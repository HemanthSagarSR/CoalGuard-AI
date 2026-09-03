# Member 2 — CoalGuard Edge Vision Handoff

## What was completed in this branch

This is the full Member-2 implementation for the current CoalGuard repository.

### Added

```text
edge_cv/
├── __init__.py
├── requirements.txt
├── .env.example
├── README.md
├── train.py
├── download_model.py
├── detector.py
├── ppe_logic.py
├── service.py
├── dataset/
│   └── data.yaml.example
└── models/
    └── .gitkeep

src/
├── components/vision/
│   └── EdgeVisionPanel.tsx
└── lib/
    └── vision-api.ts
```

### Modified

```text
src/pages/ViolationsPage.tsx
vite.config.ts
.gitignore
README.md
```

## Day 1 — Dataset + environment

1. Create the Python virtual environment.
2. Install `edge_cv/requirements.txt`.
3. Use a PPE dataset exported in YOLOv8 format.
4. Recommended starting point: Roboflow's **Personal Protective Equipment - Combined Model**. It has person, hardhat, safety vest and explicit `NO-Hardhat` / `NO-Safety Vest` classes and a YOLOv8 export.
5. Put the exported dataset under `edge_cv/dataset/` and copy its real `data.yaml` into that directory.

Reference:
https://universe.roboflow.com/roboflow-universe-projects/personal-protective-equipment-combined-model/dataset/8

## Day 2 — Fine-tune

Recommended first run:

```powershell
python edge_cv/train.py `
  --data edge_cv/dataset/data.yaml `
  --model yolov8n.pt `
  --epochs 25 `
  --imgsz 640
```

If the laptop is too slow, run the exact same script in Google Colab with a GPU.

When training finishes:

```text
runs/ppe/coalguard-ppe/weights/best.pt
```

Copy it to:

```text
edge_cv/models/best.pt
```

Do not commit the large dataset or `.pt` file to Git.

### Fast integration fallback

If the team needs a working CV checkpoint before your fine-tune completes:

```powershell
python edge_cv/download_model.py
```

This downloads a public PPE-focused YOLOv8 checkpoint from Hugging Face. Treat it as a demo/integration fallback and retain its CC BY 4.0 attribution. Replace it with your own trained checkpoint for the final submission.

## Day 3 — OpenCV + FastAPI

Create:

```text
edge_cv/.env
```

from `.env.example`.

For webcam:

```text
CV_SOURCE=0
```

For a prerecorded video:

```text
CV_SOURCE=C:/Users/<you>/Downloads/mine_demo.mp4
```

Then:

```powershell
uvicorn edge_cv.service:app --host 0.0.0.0 --port 8000
```

Verify:

```text
http://localhost:8000/api/vision/health
http://localhost:8000/api/vision/state
http://localhost:8000/api/vision/stream
```

Expected state shape:

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
  "detections": [],
  "worker_states": [],
  "model_loaded": true,
  "demo_mode": false,
  "error": null
}
```

## Day 4 — Frontend integration

The existing CoalGuard Vite app now proxies:

```text
/api/* → http://localhost:8000
```

The existing `Violations` page includes:

```text
Edge Vision Safety Feed
```

It polls the CV state every two seconds and displays:

- worker count
- PPE violation count
- missing helmets
- missing vests
- severity
- YOLO/backend status
- annotated OpenCV stream

Start both processes:

### Terminal 1

```powershell
uvicorn edge_cv.service:app --host 0.0.0.0 --port 8000
```

### Terminal 2

```powershell
npm run dev
```

Then open:

```text
http://localhost:5173/violations
```

## Shared backend integration with Member 1

The final architecture should have **one** FastAPI process.

Member 1 should import:

```python
from edge_cv.service import router as edge_cv_router

app.include_router(edge_cv_router)
```

Do not run a second FastAPI server in the final combined build.

The shared `/api/physical-ai/state` response can merge:

```json
{
  "telemetry": {},
  "vision": {},
  "prediction": {},
  "safety_shell": {}
}
```

The CV module supplies only `vision`.

## Pitch/demo sequence

Use this sequence:

```text
1. Camera sees workers
2. OpenCV captures frames
3. YOLO detects person + PPE
4. PPE logic creates a safety observation
5. FastAPI exposes the observation
6. Digital Twin updates worker/PPE state
7. Physical AI combines vision + telemetry
8. Risk trajectory changes
9. Safety Shell decides whether an action is permitted
```

Your contribution should be described as:

> "The edge vision layer gives the Digital Twin visual observations from CCTV, converting worker and PPE conditions into structured state that Physical AI can reason over."

## Important boundary

CV is an observation layer. It must not directly actuate ventilation, evacuation, machinery or other safety-critical controls. The deterministic safety shell remains the authority for hard overrides.

## Git handoff

Suggested branch:

```text
feature/member2-edge-cv
```

Commit:

```powershell
git add edge_cv src/components/vision src/lib/vision-api.ts src/pages/ViolationsPage.tsx vite.config.ts README.md .gitignore
git commit -m "feat: add edge CV PPE pipeline for digital twin"
git push -u origin feature/member2-edge-cv
```

Then open a PR into the team's main branch.

## Files you should own

For the team split, claim these files/directories:

```text
edge_cv/**
src/components/vision/EdgeVisionPanel.tsx
src/lib/vision-api.ts
```

The only frontend page touched is `ViolationsPage.tsx`, because that is the Day-4 mounting point defined in the team plan.
