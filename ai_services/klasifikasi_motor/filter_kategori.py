import sys
import os
import shutil
import argparse
from pathlib import Path
from tqdm import tqdm
import torch
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import io

import scrape_motor_v2
import scrape_under250cc
import scrape_under250cc_part2

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# 1. BUILD MAPPING CLASS -> CATEGORY
class_to_cat = {}

def build_mapping(motor_dict, module_ref):
    for brand, cats in motor_dict.items():
        for cat, models in cats.items():
            for model in models:
                cls_name = module_ref.make_class_name(brand, model)
                class_to_cat[cls_name] = cat

build_mapping(scrape_motor_v2.MOTOR_LIST, scrape_motor_v2)
build_mapping(scrape_under250cc.MOTOR_LIST_UNDER250, scrape_under250cc)
build_mapping(scrape_under250cc_part2.MOTOR_LIST_UNDER250, scrape_under250cc_part2)

# 2. GROUP BROAD CATEGORIES
BROAD_GROUPS = {
    "Scooter": "SCOOTER",
    "Maxi_Scooter": "SCOOTER",
    "Scooter_Electric": "SCOOTER",
    "Adventure_Scooter": "SCOOTER",
    
    "Sport": "SPORT",
    "Sport_Fairing": "SPORT",
    "Hyperbike": "SPORT",
    
    "Naked": "NAKED_RETRO",
    "Sport_Naked": "NAKED_RETRO",
    "Roadster": "NAKED_RETRO",
    "Retro": "NAKED_RETRO",
    "Cafe_Racer": "NAKED_RETRO",
    "Scrambler": "NAKED_RETRO",
    
    "Adventure": "DIRT_ADV",
    "Adventure_Touring": "DIRT_ADV",
    "Adventure_Small": "DIRT_ADV",
    "Dual_Purpose": "DIRT_ADV",
    
    "Bebek": "CUB",
    
    "Cruiser": "CRUISER",
    "Touring": "TOURING"
}

PROMPTS = {
    "SCOOTER": "a photo of a scooter or automatic motorcycle",
    "SPORT": "a photo of a sport motorcycle with full aerodynamic fairing",
    "NAKED_RETRO": "a photo of a naked, streetfighter, or retro classic motorcycle",
    "DIRT_ADV": "a photo of a tall adventure, dirt bike, trail, or off-road motorcycle",
    "CUB": "a photo of an underbone cub motorcycle",
    "CRUISER": "a photo of a low cruiser motorcycle like harley davidson",
    "TOURING": "a photo of a massive touring motorcycle with large side panniers boxes",
    "CAR": "a photo of a car, truck, or bus",
    "BICYCLE": "a photo of a bicycle"
}
PROMPT_KEYS = list(PROMPTS.keys())
PROMPT_TEXTS = list(PROMPTS.values())

# Allowed confusions (if expected is key, don't penalize if predicted is in value)
ALLOWED_CONFUSION = {
    "SCOOTER": ["CUB"],
    "CUB": ["SCOOTER", "NAKED_RETRO"],
    "SPORT": ["TOURING"],
    "NAKED_RETRO": ["CRUISER"],
    "CRUISER": ["NAKED_RETRO"],
    "TOURING": ["DIRT_ADV", "SPORT"],
    "DIRT_ADV": ["NAKED_RETRO"]
}

def get_expected_group(class_name):
    orig_cat = class_to_cat.get(class_name)
    if not orig_cat:
        return None
    return BROAD_GROUPS.get(orig_cat, "NAKED_RETRO")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dir", type=str, required=True, help="Dataset directory to filter")
    parser.add_argument("--margin", type=float, default=0.20, help="Confidence margin to trigger deletion")
    args = parser.parse_args()

    dataset_dir = Path(args.dir)
    trash_dir = Path(f"{args.dir}_category_trash")
    trash_dir.mkdir(exist_ok=True)

    print("Loading CLIP model for Smart Category Filtering...")
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32", use_safetensors=True).to(device)
    processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32", use_safetensors=True)
    print(f"Device: {device}")

    class_dirs = sorted([d for d in dataset_dir.iterdir() if d.is_dir()])
    
    total_scanned = 0
    total_removed = 0

    for class_dir in class_dirs:
        class_name = class_dir.name
        expected_group = get_expected_group(class_name)
        
        if not expected_group:
            print(f"Skipping {class_name}, unknown category mapping.")
            continue

        images = list(class_dir.glob("*.jpg"))
        if not images:
            continue

        print(f"\nScanning {class_name} (Expected: {expected_group}) ...")
        
        class_trash = trash_dir / class_name
        removed_in_class = 0

        for img_path in tqdm(images, leave=False):
            total_scanned += 1
            try:
                image = Image.open(img_path).convert("RGB")
                inputs = processor(text=PROMPT_TEXTS, images=image, return_tensors="pt", padding=True).to(device)
                
                with torch.no_grad():
                    outputs = model(**inputs)
                    probs = outputs.logits_per_image[0].softmax(dim=0).cpu().numpy()
                
                res = {PROMPT_KEYS[i]: float(probs[i]) for i in range(len(PROMPT_KEYS))}
                sorted_res = sorted(res.items(), key=lambda x: x[1], reverse=True)
                
                top_group = sorted_res[0][0]
                top_score = sorted_res[0][1]
                expected_score = res[expected_group]
                
                # Check for deletion
                should_delete = False
                reason = ""
                
                if top_group == "CAR" or top_group == "BICYCLE":
                    if top_score > expected_score + 0.1:
                        should_delete = True
                        reason = f"Identified as {top_group}"
                elif top_group != expected_group:
                    allowed = ALLOWED_CONFUSION.get(expected_group, [])
                    if top_group not in allowed:
                        # Only delete if the model is confident
                        if top_score > expected_score + args.margin:
                            should_delete = True
                            reason = f"Identified as {top_group} (diff: {top_score - expected_score:.2f})"
                
                if should_delete:
                    class_trash.mkdir(parents=True, exist_ok=True)
                    shutil.move(str(img_path), str(class_trash / img_path.name))
                    removed_in_class += 1
                    tqdm.write(f"  [TRASH] {img_path.name} -> {reason}")
                    
            except Exception as e:
                tqdm.write(f"  [Error] {img_path.name}: {e}")
                
        total_removed += removed_in_class
        if removed_in_class > 0:
            print(f"  Removed {removed_in_class} images from {class_name}")

    print("\n" + "="*50)
    print("CATEGORY FILTERING COMPLETE")
    print(f"Total images scanned: {total_scanned}")
    print(f"Total images removed: {total_removed}")
    print(f"Trash directory: {trash_dir}")
    print("="*50)

if __name__ == "__main__":
    main()
