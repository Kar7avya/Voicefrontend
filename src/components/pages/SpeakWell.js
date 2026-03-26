import cv2
import numpy as np
import base64
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

_hands = _pose = _mp_hands = _mp_pose = _mp_drawing = None

def get_mp():
    global _hands, _pose, _mp_hands, _mp_pose, _mp_drawing
    if _hands is None:
        import mediapipe as mp
        _mp_hands   = mp.solutions.hands
        _mp_pose    = mp.solutions.pose
        _mp_drawing = mp.solutions.drawing_utils
        _hands = mp.solutions.hands.Hands(
            static_image_mode=False, max_num_hands=2,
            min_detection_confidence=0.7, min_tracking_confidence=0.5)
        _pose = mp.solutions.pose.Pose(
            static_image_mode=False, model_complexity=1,
            min_detection_confidence=0.7, min_tracking_confidence=0.5)
        print("MediaPipe ready")
    return _hands, _pose, _mp_hands, _mp_pose, _mp_drawing

def pt(lm, w, h):
    return np.array([lm.x * w, lm.y * h])

def analyze(hand_list, pose_lms, w, h, mp_hands, mp_pose):
    if not hand_list:
        return {"status":"warning","color":"yellow","score":40,
                "issues":["No hands visible — raise your hands into frame"],
                "positives":[],"gestures":[]}

    issues, positives, gestures, score = [], [], [], 70
    sy = hy = None
    if pose_lms:
        lm = pose_lms.landmark
        sy = ((lm[11].y + lm[12].y) / 2) * h
        hy = ((lm[23].y + lm[24].y) / 2) * h

    for i, hand in enumerate(hand_list):
        lm = hand.landmark
        wrist = pt(lm[0], w, h)
        tips  = [pt(lm[t], w, h) for t in [8,12,16,20]]
        mcps  = [pt(lm[m], w, h) for m in [5, 9,13,17]]
        ext   = sum(t[1] < m[1] for t, m in zip(tips, mcps))
        is_open  = ext >= 3
        is_fist  = ext == 0
        is_point = tips[0][1] < mcps[0][1] and tips[1][1] >= mcps[1][1]

        if is_open:
            positives.append(f"Hand {i+1}: Open palm — signals confidence and trust")
            score += 10
            gestures.append({"hand":i,"gesture":"open_palm","quality":"good"})
        elif is_fist:
            issues.append(f"Hand {i+1}: Closed fist — can appear aggressive or anxious")
            score -= 15
            gestures.append({"hand":i,"gesture":"fist","quality":"bad"})
        elif is_point:
            issues.append(f"Hand {i+1}: Pointing — use open hand to guide instead")
            score -= 5
            gestures.append({"hand":i,"gesture":"pointing","quality":"warning"})
        else:
            gestures.append({"hand":i,"gesture":"neutral","quality":"ok"})

        if sy:
            if wrist[1] < sy - 50:
                issues.append(f"Hand {i+1}: Too high — keep between waist and shoulder")
                score -= 10
            elif hy and wrist[1] > hy + 50:
                issues.append(f"Hand {i+1}: Too low — raise into gesture zone")
                score -= 8
            else:
                positives.append(f"Hand {i+1}: Perfect gesture zone")
                score += 5

    if len(hand_list) == 2:
        w0 = pt(hand_list[0].landmark[0], w, h)
        w1 = pt(hand_list[1].landmark[0], w, h)
        if abs(w0[1] - w1[1]) < 80:
            positives.append("Balanced — both hands at equal height")
            score += 8

    score = max(0, min(100, score))
    if score >= 75:   s, c = "good",    "green"
    elif score >= 50: s, c = "warning", "yellow"
    else:             s, c = "bad",     "red"
    return {"status":s,"color":c,"score":score,
            "issues":issues,"positives":positives,"gestures":gestures}

def draw_overlay(frame, hand_list, pose_lms, result, mp_hands, mp_pose, mp_drawing):
    h, w, _ = frame.shape
    cmap = {"good":(0,200,80),"bad":(60,60,220),"warning":(0,140,255),"ok":(200,200,0)}

    # semi-transparent overlay
    overlay = frame.copy()

    if pose_lms:
        mp_drawing.draw_landmarks(frame, pose_lms, mp_pose.POSE_CONNECTIONS,
            mp_drawing.DrawingSpec(color=(160,160,160), thickness=1, circle_radius=2),
            mp_drawing.DrawingSpec(color=(100,100,100), thickness=1))

    for i, hand in enumerate(hand_list):
        q   = next((g["quality"] for g in result["gestures"] if g["hand"]==i), "ok")
        col = cmap.get(q, (200,200,0))
        mp_drawing.draw_landmarks(frame, hand, mp_hands.HAND_CONNECTIONS,
            mp_drawing.DrawingSpec(color=col, thickness=3, circle_radius=5),
            mp_drawing.DrawingSpec(color=col, thickness=2))

    # Score pill
    score = result["score"]
    sc = (0,200,80) if score>=75 else (0,140,255) if score>=50 else (60,60,220)
    pill_w, pill_h = 160, 44
    cv2.rectangle(frame, (16, 16), (16+pill_w, 16+pill_h), (10,10,10), -1)
    cv2.rectangle(frame, (16, 16), (16+pill_w, 16+pill_h), sc, 1)
    cv2.putText(frame, f"Score  {score}", (28, 44),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, sc, 2)
    return frame

@app.route("/",        methods=["GET"])
@app.route("/health",  methods=["GET"])
def health():
    return jsonify({"status":"ok","message":"SpeakWell ML"})

@app.route("/warmup",  methods=["GET"])
def warmup():
    try:
        get_mp()
        return jsonify({"status":"ok","message":"MediaPipe loaded"})
    except Exception as e:
        return jsonify({"status":"error","message":str(e)}), 500

@app.route("/analyze", methods=["POST"])
def analyze_frame():
    try:
        hands, pose, mp_hands, mp_pose, mp_drawing = get_mp()
        data = request.get_json(force=True)
        if not data or "frame" not in data:
            return jsonify({"error":"No frame"}), 400

        raw = data["frame"]
        if "," in raw: raw = raw.split(",")[1]

        img   = np.frombuffer(base64.b64decode(raw), dtype=np.uint8)
        frame = cv2.imdecode(img, cv2.IMREAD_COLOR)
        if frame is None:
            return jsonify({"error":"Bad image"}), 400

        h, w, _ = frame.shape
        rgb     = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        hr      = hands.process(rgb)
        pr      = pose.process(rgb)
        hl      = hr.multi_hand_landmarks or []
        pl      = pr.pose_landmarks
        result  = analyze(hl, pl, w, h, mp_hands, mp_pose)
        ann     = draw_overlay(frame.copy(), hl, pl, result, mp_hands, mp_pose, mp_drawing)
        _, buf  = cv2.imencode(".jpg", ann, [cv2.IMWRITE_JPEG_QUALITY, 82])
        b64     = base64.b64encode(buf).decode()

        return jsonify({
            "analysis":        result,
            "annotated_frame": f"data:image/jpeg;base64,{b64}",
            "hands_detected":  len(hl),
        })
    except Exception as e:
        import traceback
        return jsonify({"error":str(e),"trace":traceback.format_exc()}), 500

@app.route("/analyze_session", methods=["POST"])
def analyze_session():
    data   = request.get_json(force=True)
    scores = data.get("scores", [])
    if not scores:
        return jsonify({"error":"No scores"}), 400

    total = len(scores)
    avg   = sum(scores) / total
    good  = sum(1 for s in scores if s >= 75)
    warn  = sum(1 for s in scores if 50 <= s < 75)
    bad   = total - good - warn

    if avg >= 75:   rating, tips = "Excellent",         ["Maintain your open palm gestures","Your symmetry is great","Keep hands in the gesture zone"]
    elif avg >= 60: rating, tips = "Good",              ["Try opening your palms more often","Vary gesture types for emphasis","Avoid keeping arms too still"]
    elif avg >= 40: rating, tips = "Needs Improvement", ["Practice open palm gestures daily","Avoid closed fists when speaking","Keep hands between waist and shoulders"]
    else:           rating, tips = "Poor",              ["Study great speakers on YouTube","Practice in front of a mirror","Start with basic open hand positions"]

    return jsonify({
        "avg_score":    round(avg, 1),
        "max_score":    max(scores),
        "min_score":    min(scores),
        "good_percent": round((good/total)*100),
        "warn_percent": round((warn/total)*100),
        "bad_percent":  round((bad/total)*100),
        "total_frames": total,
        "rating":       rating,
        "tips":         tips,
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    print(f"SpeakWell ML — port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)