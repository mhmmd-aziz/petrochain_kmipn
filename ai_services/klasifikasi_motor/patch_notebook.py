import json

with open('scrapping.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

changes = 0
for cell in nb['cells']:
    if cell['cell_type'] != 'code':
        continue
    new_source = []
    for line in cell['source']:
        # Fix: ganti library name
        if 'duckduckgo-search' in line:
            line = line.replace('duckduckgo-search', 'ddgs')
            changes += 1
        if 'from duckduckgo_search import DDGS' in line:
            line = line.replace('from duckduckgo_search import DDGS', 'from ddgs import DDGS')
            changes += 1
        if 'pip install duckduckgo-search' in line:
            line = line.replace('pip install duckduckgo-search', 'pip install ddgs')
            changes += 1
        # Hapus param yang tidak didukung ddgs baru
        if 'type_image' in line and 'photo' in line:
            changes += 1
            continue
        if 'size=' in line and 'Large' in line:
            changes += 1
            continue
        new_source.append(line)
    cell['source'] = new_source

with open('scrapping.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1, ensure_ascii=False)

print(f'Done! {changes} perubahan dilakukan.')
