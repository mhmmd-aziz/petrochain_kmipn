import os
import cv2
from flask import Flask, render_template, request, redirect, url_for, send_from_directory, jsonify
from werkzeug.utils import secure_filename
from ultralytics import YOLO
import time

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['RESULT_FOLDER'] = 'static/results'

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    return response

# Buat folder jika belum ada
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['RESULT_FOLDER'], exist_ok=True)

# Panggil Model YOLO yang sudah ditraining
try:
    model = YOLO('best.pt')
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.route('/api/classify', methods=['POST'])
def api_classify():
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"status": "error", "message": "No selected file"}), 400
        
    if model is None:
        return jsonify({"status": "error", "message": "Model not loaded"}), 500

    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        is_video = filename.lower().endswith(('.mp4', '.avi', '.mov', '.mkv', '.webm'))
        
        best_confidence = 0.0
        best_class_id = -1
        best_bbox = []
        
        if is_video:
            # PROSES VIDEO
            cap = cv2.VideoCapture(filepath)
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            fps = int(cap.get(cv2.CAP_PROP_FPS))
            if fps == 0: fps = 30
            
            result_filename = f"result_{int(time.time())}.webm"
            result_filepath = os.path.join(app.config['RESULT_FOLDER'], result_filename)
            
            fourcc = cv2.VideoWriter_fourcc(*'vp09')
            out = cv2.VideoWriter(result_filepath, fourcc, fps, (width, height))
            
            results = model.predict(source=filepath, conf=0.15, stream=True)
            for r in results:
                frame = r.plot()
                out.write(frame)
                
                # Cari deteksi terbaik di frame ini
                if len(r.boxes) > 0:
                    box = max(r.boxes, key=lambda x: x.conf[0].item())
                    conf = float(box.conf[0].item())
                    if conf > best_confidence:
                        best_confidence = conf
                        best_class_id = int(box.cls[0].item())
                        best_bbox = box.xyxy[0].tolist()
                        
            out.release()
            cap.release()
            media_type = 'video'
            
        else:
            # PROSES GAMBAR
            results = model.predict(source=filepath, conf=0.15)
            
            # Simpan annotated image
            annotated_img = results[0].plot()
            result_filename = f"result_{int(time.time())}.jpg"
            result_filepath = os.path.join(app.config['RESULT_FOLDER'], result_filename)
            cv2.imwrite(result_filepath, annotated_img)
            
            if len(results[0].boxes) > 0:
                best_box = max(results[0].boxes, key=lambda x: x.conf[0].item())
                best_confidence = float(best_box.conf[0].item())
                best_class_id = int(best_box.cls[0].item())
                best_bbox = best_box.xyxy[0].tolist()
                
            media_type = 'image'

        if best_class_id == -1:
            return jsonify({
                "status": "success",
                "data": {
                    "detected_class": None,
                    "confidence": 0.0,
                    "eligibility_result": "UNKNOWN",
                    "message": "No vehicle detected.",
                    "media_url": f"http://127.0.0.1:5001/static/results/{result_filename}",
                    "media_type": media_type
                }
            })
            
        class_name = model.names[best_class_id]
        eligibility = "ELIGIBLE" if class_name == "under_250cc" else "NOT_ELIGIBLE"
        
        return jsonify({
            "status": "success",
            "data": {
                "detected_class": class_name,
                "confidence": best_confidence,
                "eligibility_result": eligibility,
                "bbox": best_bbox,
                "media_url": f"http://127.0.0.1:5001/static/results/{result_filename}",
                "media_type": media_type
            }
        })

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        if 'file' not in request.files:
            return redirect(request.url)
        file = request.files['file']
        if file.filename == '':
            return redirect(request.url)
            
        if file:
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Cek apakah file adalah video
            is_video = filename.lower().endswith(('.mp4', '.avi', '.mov', '.mkv', '.webm'))
            
            # Proses dengan YOLO
            if model is not None:
                if is_video:
                    # PROSES VIDEO
                    cap = cv2.VideoCapture(filepath)
                    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                    fps = int(cap.get(cv2.CAP_PROP_FPS))
                    if fps == 0: fps = 30
                    
                    result_filename = f"result_{int(time.time())}.webm"
                    result_filepath = os.path.join(app.config['RESULT_FOLDER'], result_filename)
                    
                    # Gunakan codec 'vp09' untuk WebM (sangat stabil di browser)
                    fourcc = cv2.VideoWriter_fourcc(*'vp09')
                    out = cv2.VideoWriter(result_filepath, fourcc, fps, (width, height))
                    
                    # stream=True agar RAM tidak penuh
                    results = model.predict(source=filepath, conf=0.15, stream=True)
                    for r in results:
                        frame = r.plot()
                        out.write(frame)
                        
                    out.release()
                    cap.release()
                    
                    return render_template('index.html', result_video=result_filename)
                else:
                    # PROSES GAMBAR
                    results = model.predict(source=filepath, conf=0.15)
                    # Simpan gambar hasil deteksi
                    annotated_img = results[0].plot()
                    result_filename = f"result_{int(time.time())}.jpg"
                    result_filepath = os.path.join(app.config['RESULT_FOLDER'], result_filename)
                    cv2.imwrite(result_filepath, annotated_img)
                    
                    return render_template('index.html', result_image=result_filename)
            
    return render_template('index.html', result_image=None, result_video=None)

@app.route('/static/results/<filename>')
def serve_result(filename):
    return send_from_directory(app.config['RESULT_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
