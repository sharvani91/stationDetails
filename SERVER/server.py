from flask import Flask, request, jsonify
from flask import send_from_directory
import cv2
from PIL import Image
import google.generativeai as genai
import os
from thefuzz import fuzz
import csv
import uuid
import pandas as pd
import numpy as np
import easyocr
import re
import math
import difflib

from flask_cors import CORS

app = Flask(__name__)
CORS(app)

#genai.configure(api_key="AIzaSyDjtw9P04RapooniWeM6Xj2cDA5QgsRsGw")
genai.configure(api_key="AIzaSyD-wFFgwoXN_FvDMlt2rBKInCyUZIJOpOM")

def normalize_station_name(name):
    name = name.lower()
    name = re.sub(r'\(.*?\)', '', name)
    name = re.sub(r'km[:.]?\s*\d+\.?\d*', '', name)
    name = name.replace('.', '')
    name = name.strip()
    name = re.sub(r'\s+', ' ', name)
    return name

def detect_black_dots(image_path):
    image = cv2.imread(image_path)
    if image is None:
        return [], None
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 30, 255, cv2.THRESH_BINARY_INV)
    kernel = np.ones((3, 3), np.uint8)
    thresh = cv2.dilate(thresh, kernel, iterations=1)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    min_area, max_area, min_circularity = 3, 1000, 0.3
    black_dots = []
    for contour in contours:
        area = cv2.contourArea(contour)
        if not (min_area < area < max_area):
            continue
        perimeter = cv2.arcLength(contour, True)
        if perimeter == 0:
            continue
        circularity = 4 * np.pi * area / (perimeter * perimeter)
        if circularity < min_circularity:
            continue
        (x, y), radius = cv2.minEnclosingCircle(contour)
        center = (int(x), int(y))
        radius = int(radius)
        if radius <= 1:
            continue
        mask = np.zeros_like(gray)
        cv2.circle(mask, center, radius, 255, -1)
        mean_intensity = cv2.mean(gray, mask=mask)[0]
        if mean_intensity > 76:
            continue
        circle_area = np.pi * (radius ** 2)
        filled_area = cv2.countNonZero(cv2.bitwise_and(thresh, thresh, mask=mask))
        if filled_area / circle_area < 0.8:
            continue
        black_dots.append({'x': center[0], 'y': center[1], 'radius': radius})
    return black_dots, image

def load_station_boxes(image_path, csv_path, cutoff=0.6):
    reader = easyocr.Reader(['en'], gpu=False)
    df = pd.read_csv(csv_path)
    station_names = df['Station Name'].apply(normalize_station_name).tolist()
    original_names = df['Station Name'].tolist()
    ocr_results = reader.readtext(image_path)
    boxes = []
    normalized_ocr_texts = []
    for bbox, text, confidence in ocr_results:
        text_clean = normalize_station_name(text)
        normalized_ocr_texts.append((bbox, text_clean, confidence))
    for i, station in enumerate(station_names):
        matches_for_station = []
        for bbox, ocr_text, confidence in normalized_ocr_texts:
            ratio = difflib.SequenceMatcher(None, station, ocr_text).ratio()
            if ratio >= cutoff:
                matches_for_station.append((bbox, ocr_text, confidence, ratio))
        if matches_for_station:
            best_match = max(matches_for_station, key=lambda x: (x[3], x[2]))
            bbox = best_match[0]
            x_coords = [pt[0] for pt in bbox]
            y_coords = [pt[1] for pt in bbox]
            x1, y1 = int(min(x_coords)), int(min(y_coords))
            x2, y2 = int(max(x_coords)), int(max(y_coords))
            center_x = (x1 + x2) // 2
            center_y = (y1 + y2) // 2
            box = {
                'name': original_names[i],
                'x': center_x,
                'y': center_y,
                'box': (x1, y1, x2, y2)
            }
            boxes.append(box)
    return boxes

def match_dots_to_stations(dots, boxes, max_distance=150):
    best_matches = {}
    for dot in dots:
        for box in boxes:
            x1, y1, x2, y2 = box['box']
            dx = max(x1 - dot['x'], 0, dot['x'] - x2)
            dy = max(y1 - dot['y'], 0, dot['y'] - y2)
            edge_distance = math.hypot(dx, dy)
            if edge_distance > max_distance:
                continue
            current_best = best_matches.get(box['name'])
            if current_best is None or edge_distance < current_best['distance']:
                best_matches[box['name']] = {
                    'station_name': box['name'],
                    'station_x': box['x'],
                    'station_y': box['y'],
                    'dot_x': dot['x'],
                    'dot_y': dot['y'],
                    'distance': edge_distance
                }
    matched = [{
        'station_name': m['station_name'],
        'dot_x': m['dot_x'],
        'dot_y': m['dot_y']
    } for m in best_matches.values()]
    return matched

@app.route('/process_stations', methods=['POST'])
def process_stations():
    if 'image' not in request.files or 'division' not in request.form:
        return jsonify({"error": "Image file or division not found in request"}), 400

    file = request.files['image']
    division = request.form['division'].strip()
    img_path = f"temp_{uuid.uuid4().hex}.png"
    file.save(img_path)

    try:
        img = cv2.imread(img_path)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        enhanced_bgr = cv2.cvtColor(enhanced, cv2.COLOR_GRAY2BGR)
        enhanced_path = f"enhanced_{uuid.uuid4().hex}.png"
        cv2.imwrite(enhanced_path, enhanced_bgr)

        prompt = (
            "From the image provided, extract only the names of all railway stations. "
            "Each name should appear on a new line. "
            "Ignore all other information such as distances, kilometer markings, codes in brackets, IBH values, or numbers. "
            "Include all station names regardless of text size, font style, or color. "
            "Only return clean station names."
        )

        with Image.open(enhanced_path) as image:
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content([prompt, image])

        raw_text = response.text.strip()
        station_lines = [line.strip() for line in raw_text.split('\n') if line.strip()]

        unique_stations = []
        seen = set()
        for station in station_lines:
            if station not in seen:
                unique_stations.append(station)
                seen.add(station)

        final_stations = []
        for station in unique_stations:
            if all(fuzz.ratio(station.lower(), existing.lower()) < 90 for existing in final_stations):
                final_stations.append(station)

        csv_path = f"cleaned_stations.csv"
        with open(csv_path, "w", newline='', encoding="utf-8") as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(["No.", "Station Name"])
            for i, station in enumerate(final_stations, start=1):
                writer.writerow([i, station])

        # Run dot matching pipeline
        dots, _ = detect_black_dots(img_path)
        boxes = load_station_boxes(img_path, csv_path)
        matches = match_dots_to_stations(dots, boxes)

        # Save dot match results
        dot_csv_path = f"public/dots_{division}.csv"
        match_log = [
            {
                'id': idx + 1,
                'stationName': m['station_name'],
                'centerX': m['dot_x'],
                'centerY': m['dot_y']
            }
            for idx, m in enumerate(matches)
        ]
        pd.DataFrame(match_log).to_csv(dot_csv_path, index=False)

        os.remove(img_path)
        os.remove(enhanced_path)

        return jsonify({
            "station_count": len(final_stations),
            "stations": final_stations,
            "dot_csv": dot_csv_path,
            "matched_count": len(matches)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    if not os.path.exists('static'):
        os.makedirs('static')
    app.run(debug=True)
