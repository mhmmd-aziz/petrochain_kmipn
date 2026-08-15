from flask import Flask, render_template, request, redirect, url_for, flash, g
import os
import time
import sqlite3
import uuid
from utils import extract_plate_from_car, extract_info_from_stnk, generate_qr_code, validate_stnk_document, validate_car_photo
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = "super_secret_key"
UPLOAD_FOLDER = 'uploads'
DATABASE = 'database.db'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        db = get_db()
        db.execute('''
            CREATE TABLE IF NOT EXISTS submissions (
                id TEXT PRIMARY KEY,
                stnk_path TEXT,
                car_path TEXT,
                stnk_plate TEXT,
                car_plate TEXT,
                status TEXT,
                message TEXT,
                qr_filename TEXT,
                created_at INTEGER
            )
        ''')
        db.commit()
        try:
            db.execute('ALTER TABLE submissions ADD COLUMN ai_conclusion TEXT')
            db.commit()
        except:
            pass

init_db()

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

from flask import send_from_directory

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/operator', methods=['GET'])
def operator():
    db = get_db()
    cur = db.execute("SELECT * FROM submissions WHERE status = 'pending' ORDER BY created_at DESC")
    submissions = cur.fetchall()
    return render_template('operator.html', submissions=submissions)

@app.route('/operator/review/<sub_id>', methods=['POST'])
def operator_review(sub_id):
    action = request.form.get('action') # 'approve' or 'reject'
    db = get_db()
    
    if action == 'approve':
        cur = db.execute("SELECT stnk_plate FROM submissions WHERE id = ?", (sub_id,))
        row = cur.fetchone()
        qr_filename = ""
        if row and row['stnk_plate']:
            qr_data = f"VALIDATED:{row['stnk_plate']}|TS:{int(time.time())}"
            qr_filename = generate_qr_code(qr_data)
        db.execute("UPDATE submissions SET status = 'approved', qr_filename = ?, message = 'Validasi Berhasil. Plat STNK dan Mobil Cocok!' WHERE id = ?", (qr_filename, sub_id))
    elif action == 'reject':
        db.execute("UPDATE submissions SET status = 'rejected', message = 'Ditolak oleh Operator. Silakan ulangi.' WHERE id = ?", (sub_id,))
    
    db.commit()
    flash("Status pengajuan berhasil diupdate.", "success")
    return redirect(url_for('operator'))

@app.route('/process', methods=['POST'])
def process():
    if 'stnk_image' not in request.files or 'car_image' not in request.files:
        flash("Mohon upload kedua gambar (STNK dan Mobil).", "error")
        return redirect(url_for('index'))

    stnk_file = request.files['stnk_image']
    car_file = request.files['car_image']

    if stnk_file.filename == '' or car_file.filename == '':
        flash("Tidak ada file yang dipilih.", "error")
        return redirect(url_for('index'))

    # Save files
    stnk_path = os.path.join(app.config['UPLOAD_FOLDER'], f"stnk_{int(time.time())}.jpg")
    car_path = os.path.join(app.config['UPLOAD_FOLDER'], f"car_{int(time.time())}.jpg")
    
    stnk_file.save(stnk_path)
    car_file.save(car_path)

    # Process STNK
    stnk_plate, stnk_conf, stnk_cc = extract_info_from_stnk(stnk_path)
    logger.info(f"STNK: {stnk_plate} (Conf: {stnk_conf}) CC: {stnk_cc}")

    # Process Car Image
    car_plate, car_conf = extract_plate_from_car(car_path)
    logger.info(f"CAR: {car_plate} (Conf: {car_conf})")
    
    # --- DUMMY MODE UNTUK TESTING ---
    # Memaksa hasil selalu terdeteksi dan sama
    stnk_plate = "B 1234 ABC"
    car_plate = "B 1234 ABC"
    stnk_conf = 0.99
    car_conf = 0.99
    # --------------------------------
    
    # Validation logic - AI prediction
    CONF_THRESHOLD = 0.3
    
    if not stnk_plate or not car_plate:
        flash("Plat nomor tidak terdeteksi di salah satu gambar. Mohon ulangi foto dengan lebih jelas.", "error")
        return redirect(url_for('index'))
    
    if stnk_conf < CONF_THRESHOLD or car_conf < CONF_THRESHOLD:
        ai_conclusion = "low_confidence"
    elif stnk_plate.replace(" ", "") == car_plate.replace(" ", ""):
        ai_conclusion = "match"
    else:
        ai_conclusion = "mismatch"

    # Generate a unique submission ID
    sub_id = str(uuid.uuid4())
    status = "pending"
    message = "Menunggu review dari Operator."
    
    # Save to database
    db = get_db()
    db.execute('''
        INSERT INTO submissions (id, stnk_path, car_path, stnk_plate, car_plate, status, message, ai_conclusion, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (sub_id, stnk_path, car_path, stnk_plate, car_plate, status, message, ai_conclusion, int(time.time())))
    db.commit()

    return redirect(url_for('status_page', sub_id=sub_id))

from flask import jsonify

@app.route('/api/extract', methods=['POST'])
def api_extract():
    """
    JSON API Endpoint for Laravel Backend Integration.
    Expects multipart/form-data with 'stnk_image' and 'car_image'.
    Returns JSON with extracted plates and match confidence.
    """
    if 'stnk_image' not in request.files or 'car_image' not in request.files:
        return jsonify({"status": "error", "message": "Missing image files"}), 400

    stnk_file = request.files['stnk_image']
    car_file = request.files['car_image']

    stnk_path = os.path.join(app.config['UPLOAD_FOLDER'], f"api_stnk_{int(time.time())}.jpg")
    car_path = os.path.join(app.config['UPLOAD_FOLDER'], f"api_car_{int(time.time())}.jpg")
    
    stnk_file.save(stnk_path)
    car_file.save(car_path)

    # Step 1: Validate the STNK document first
    doc_validation = validate_stnk_document(stnk_path)
    logger.info(f"[API] Doc validation: {doc_validation}")

    if not doc_validation['is_valid']:
        return jsonify({
            "status": "success",
            "data": {
                "stnk_plate": None,
                "stnk_confidence": 0.0,
                "car_plate": None,
                "car_confidence": 0.0,
                "stnk_cc": None,
                "is_match": False,
                "conclusion": "mismatch",
                "document_valid": False,
                "document_type": doc_validation['document_type'],
                "validation_message": doc_validation['message'],
            }
        })

    # Step 2: Validate the vehicle photo shows a CAR
    car_validation = validate_car_photo(car_path)
    logger.info(f"[API] Car photo validation: {car_validation}")

    if not car_validation['is_valid']:
        return jsonify({
            "status": "success",
            "data": {
                "stnk_plate": None,
                "stnk_confidence": 0.0,
                "car_plate": None,
                "car_confidence": 0.0,
                "stnk_cc": None,
                "is_match": False,
                "conclusion": "mismatch",
                "document_valid": False,
                "document_type": car_validation['detected_type'],
                "validation_message": car_validation['message'],
            }
        })

    # Step 3: Extract plates and CC
    stnk_plate, stnk_conf, stnk_cc = extract_info_from_stnk(stnk_path)
    car_plate, car_conf = extract_plate_from_car(car_path)
    
    logger.info(f"[API] STNK extracted: plate='{stnk_plate}' conf={stnk_conf:.3f} cc={stnk_cc}")
    logger.info(f"[API] CAR  extracted: plate='{car_plate}' conf={car_conf:.3f}")

    if not stnk_plate and not car_plate:
        # Both failed — return honest error
        return jsonify({
            "status": "success",
            "data": {
                "stnk_plate": None,
                "stnk_confidence": 0.0,
                "car_plate": None,
                "car_confidence": 0.0,
                "stnk_cc": stnk_cc,
                "is_match": False,
                "conclusion": "low_confidence"
            }
        })

    is_match = False
    ai_conclusion = "low_confidence"
    
    if stnk_plate and car_plate:
        if stnk_conf < 0.3 and car_conf < 0.3:
            ai_conclusion = "low_confidence"
        elif stnk_plate.replace(" ", "") == car_plate.replace(" ", ""):
            ai_conclusion = "match"
            is_match = True
        else:
            ai_conclusion = "mismatch"

    return jsonify({
        "status": "success",
        "data": {
            "stnk_plate": stnk_plate,
            "stnk_confidence": float(stnk_conf),
            "car_plate": car_plate,
            "car_confidence": float(car_conf),
            "stnk_cc": stnk_cc,
            "is_match": is_match,
            "conclusion": ai_conclusion,
            "document_valid": True,
            "document_type": doc_validation['document_type'],
            "validation_message": doc_validation['message'],
            "is_warning": doc_validation.get('is_warning', False),
            "car_detected_type": car_validation['detected_type']
        }
    })

@app.route('/status/<sub_id>', methods=['GET'])
def status_page(sub_id):
    db = get_db()
    cur = db.execute("SELECT * FROM submissions WHERE id = ?", (sub_id,))
    submission = cur.fetchone()
    if not submission:
        flash("Pengajuan tidak ditemukan.", "error")
        return redirect(url_for('index'))
        
    return render_template('status.html', submission=submission)

if __name__ == '__main__':
    app.run(debug=True, port=5002)
