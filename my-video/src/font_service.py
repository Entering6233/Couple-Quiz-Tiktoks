from flask import Flask, send_file, jsonify, request
from flask_cors import CORS
import os
import json
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Ensure fonts directory exists
FONTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public', 'fonts')
os.makedirs(FONTS_DIR, exist_ok=True)

# Load or create font dictionary
FONT_DICT_FILE = os.path.join(FONTS_DIR, 'font_dictionary.json')

def load_font_dictionary():
    if os.path.exists(FONT_DICT_FILE):
        try:
            with open(FONT_DICT_FILE, 'r') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_font_dictionary(font_dict):
    with open(FONT_DICT_FILE, 'w') as f:
        json.dump(font_dict, f, indent=2)

# Initialize font dictionary
font_dictionary = load_font_dictionary()

@app.route('/fonts/<path:filename>')
def serve_font(filename):
    return send_file(os.path.join(FONTS_DIR, filename))

@app.route('/fonts/dictionary', methods=['GET'])
def get_font_dictionary():
    print("Serving font dictionary:", font_dictionary)
    return jsonify(font_dictionary)

@app.route('/set_font', methods=['POST'])
def set_font():
    try:
        print("Received font upload request")
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not file.filename.lower().endswith(('.otf', '.ttf')):
            return jsonify({'error': 'Invalid file type. Only .otf and .ttf files are allowed'}), 400

        filename = secure_filename(file.filename)
        filepath = os.path.join(FONTS_DIR, filename)
        file.save(filepath)
        print(f"Saved font to: {filepath}")

        # Update font dictionary
        font_name = os.path.splitext(filename)[0]
        font_url = f'http://localhost:3003/fonts/{filename}'
        font_dictionary[font_name] = {
            'url': font_url,
            'path': filepath,
            'format': 'opentype' if filename.lower().endswith('.otf') else 'truetype'
        }
        save_font_dictionary(font_dictionary)
        print(f"Updated font dictionary with: {font_name}")

        return jsonify({
            'success': True,
            'message': 'Font uploaded',
            'url': font_url,
            'name': font_name
        })
    except Exception as e:
        print(f"Error uploading font: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/delete_font', methods=['POST'])
def delete_font():
    try:
        data = request.json
        if not data or 'name' not in data:
            return jsonify({'error': 'Font name not provided'}), 400

        font_name = data['name']
        if font_name not in font_dictionary:
            return jsonify({'error': 'Font not found'}), 404

        # Delete the font file
        font_path = font_dictionary[font_name]['path']
        if os.path.exists(font_path):
            os.remove(font_path)

        # Remove from dictionary
        del font_dictionary[font_name]
        save_font_dictionary(font_dictionary)

        return jsonify({
            'success': True,
            'message': 'Font deleted'
        })
    except Exception as e:
        print(f"Error deleting font: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting font service on port 3003...")
    print(f"Fonts directory: {FONTS_DIR}")
    print(f"Font dictionary: {font_dictionary}")
    app.run(port=3003, debug=True) 