# CoalGuard Edge CV — Member 2

This module is the computer-vision edge layer for CoalGuard AI.

## Pipeline

```text
Webcam / IP CCTV / Video
        ↓
      OpenCV
        ↓
   YOLOv8 detector
        ↓
 PPE + worker association
        ↓
   CV safety state
        ↓
FastAPI `/api/vision/state`
        ↓
CoalGuard Digital Twin / React UI
```

The module is deliberately independent from the React local-data layer. Member 1 can mount the router into the shared FastAPI application on `localhost:8000`.

## 1. Create the Python environment

From the repository root on Windows PowerShell:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r edge_cv/requirements.txt
```

If PowerShell blocks activation, run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

## 2. Model

Place the trained model at:

```text
edge_cv/models/best.pt
```

The code also accepts another path through `CV_MODEL_PATH`.

For Day 1/2, use a small YOLO model such as YOLOv8n and fine-tune it on a PPE dataset. Ultralytics supports loading pretrained weights and training them against a custom `data.yaml`.

Recommended classes:

```text
person
helmet / hard_hat
vest / safety_vest
```

The inference code also recognizes aliases such as `no_helmet`, `no_hardhat`, and `missing_helmet` if the chosen dataset contains explicit negative PPE classes.

A practical starting point is the Roboflow PPE detection collection, which includes PPE datasets/models with person, hard-hat and safety-vest classes:
https://universe.roboflow.com/use-cases/ppe-detection

## 3. Dataset

Use a YOLO-format export and keep it outside Git if it is large:

```text
edge_cv/dataset/
├── images/
│   ├── train/
│   └── val/
├── labels/
│   ├── train/
│   └── val/
└── data.yaml
```

The repository includes `dataset/data.yaml.example`.

Do not commit a large dataset or model weights unless the team explicitly decides to.

## 4. Train

Copy the example config:

```powershell
Copy-Item edge_cv/dataset/data.yaml.example edge_cv/dataset/data.yaml
```

Edit `data.yaml` so the class names match your downloaded dataset.

Then:

```powershell
python edge_cv/train.py --data edge_cv/dataset/data.yaml --model yolov8n.pt --epochs 25 --imgsz 640
```

The best checkpoint is normally written under:

```text
runs/ppe/weights/best.pt
```

Copy it to:

```text
edge_cv/models/best.pt
```

For a hackathon, start with 20–30 epochs and a small model. Prioritize stable inference and a clean demo over squeezing out the last few percentage points of mAP.

## 5. Run the edge CV API

From the repository root:

```powershell
Copy-Item edge_cv/.env.example edge_cv/.env
```

Then:

```powershell
uvicorn edge_cv.service:app --host 0.0.0.0 --port 8000
```

Health:

```text
http://localhost:8000/api/vision/health
```

State:

```text
http://localhost:8000/api/vision/state
```

Annotated MJPEG stream:

```text
http://localhost:8000/api/vision/stream
```

## 6. Source options

Webcam:

```text
CV_SOURCE=0
```

Video file:

```text
CV_SOURCE=C:/path/to/mine_demo.mp4
```

RTSP CCTV:

```text
CV_SOURCE=rtsp://username:password@camera-ip:554/stream
```

For the hackathon, a prerecorded mine/safety video is the most reliable fallback.

## 7. API state contract

The endpoint returns:

```json
{
  "source": "0",
  "timestamp": 1720000000.123,
  "vision": {
    "workers_detected": 3,
    "missing_ppe_count": 1,
    "missing_helmet_count": 1,
    "missing_vest_count": 0,
    "unauthorized_zone": false,
    "severity": "HIGH"
  },
  "detections": [
    {
      "class_name": "person",
      "confidence": 0.91,
      "bbox": [120, 80, 420, 620]
    }
  ]
}
```

This is intentionally compatible with the team's shared physical-state JSON. Member 1 can merge `vision` with telemetry/prediction/safety-shell fields.

## 8. React integration

The existing CoalGuard React app reads the edge service through the Vite `/api` proxy during development.

The Violations page contains the `EdgeVisionPanel`, which shows:

- backend status
- worker count
- missing PPE count
- severity
- annotated live stream
- last CV update

If the backend is not running, the UI stays usable and reports `Edge CV offline` rather than crashing the application.

## 9. Safety boundary

This module is a demonstration component. It should not be treated as a certified mine-safety control. The deterministic safety shell must remain the authority for hard safety overrides; CV is an observation/input source.


## 10. FastAPI integration with Member 1

If Member 1 owns the single shared FastAPI process, do **not** run a second
server. In their main FastAPI file:

```python
from edge_cv.service import router as edge_cv_router

app.include_router(edge_cv_router)
```

The resulting endpoints remain:

```text
GET /api/vision/health
GET /api/vision/state
GET /api/vision/stream
```

The shared physical-state endpoint can then merge the returned `vision` object
with telemetry, prediction and safety-shell fields.
