"""YOLOv8 + OpenCV inference engine for CoalGuard Edge CV."""

from __future__ import annotations

import os
import threading
import time
from pathlib import Path
from typing import Any

import cv2

from .ppe_logic import Detection, classify_people, summarize


class VisionEngine:
    def __init__(self) -> None:
        self.source = os.getenv("CV_SOURCE", "0")
        self.model_path = Path(
            os.getenv("CV_MODEL_PATH", "edge_cv/models/best.pt")
        )
        self.confidence = float(os.getenv("CV_CONFIDENCE", "0.35"))
        self.iou = float(os.getenv("CV_IOU", "0.45"))
        self.zone = os.getenv("CV_ZONE", "A")
        self.demo_mode = os.getenv("CV_DEMO_MODE", "false").lower() == "true"
        self.stream_fps = max(1, int(os.getenv("CV_STREAM_FPS", "12")))
        self.zone_rect = (
            int(os.getenv("CV_ZONE_X1", "0")),
            int(os.getenv("CV_ZONE_Y1", "0")),
            int(os.getenv("CV_ZONE_X2", "1280")),
            int(os.getenv("CV_ZONE_Y2", "720")),
        )

        self._model: Any = None
        self._capture: cv2.VideoCapture | None = None
        self._lock = threading.Lock()
        self._latest_jpeg: bytes | None = None
        self._latest_state: dict[str, Any] = self._empty_state()
        self._last_frame_time = 0.0

    def _empty_state(self) -> dict[str, Any]:
        return {
            "source": self.source,
            "timestamp": time.time(),
            "vision": {
                "workers_detected": 0,
                "missing_ppe_count": 0,
                "missing_helmet_count": 0,
                "missing_vest_count": 0,
                "unauthorized_zone": False,
                "severity": "LOW",
            },
            "detections": [],
            "worker_states": [],
            "model_loaded": False,
            "demo_mode": self.demo_mode,
            "error": None,
        }

    def load(self) -> None:
        if self.demo_mode:
            return

        from ultralytics import YOLO

        if not self.model_path.exists():
            raise FileNotFoundError(
                f"YOLO model not found at {self.model_path}. "
                "Train the PPE model and copy best.pt there, or set CV_MODEL_PATH."
            )

        self._model = YOLO(str(self.model_path))

    def _open_capture(self) -> cv2.VideoCapture:
        source: int | str
        try:
            source = int(self.source)
        except ValueError:
            source = self.source

        capture = cv2.VideoCapture(source)
        if not capture.isOpened():
            raise RuntimeError(f"Unable to open CV_SOURCE={self.source}")
        return capture

    def start(self) -> None:
        if self._capture is not None:
            return
        if not self.demo_mode and self._model is None:
            self.load()
        self._capture = self._open_capture()

    def stop(self) -> None:
        if self._capture is not None:
            self._capture.release()
            self._capture = None

    def _unauthorized_zone(self, worker_states: list[dict]) -> bool:
        x1, y1, x2, y2 = self.zone_rect
        for worker in worker_states:
            bx1, by1, bx2, by2 = worker["bbox"]
            cx = (bx1 + bx2) / 2
            cy = (by1 + by2) / 2
            if not (x1 <= cx <= x2 and y1 <= cy <= y2):
                return True
        return False

    def _demo_state(self, frame) -> tuple[dict, Any]:
        # Demo mode intentionally produces a clearly synthetic state. It is
        # never presented as real inference.
        height, width = frame.shape[:2]
        box = (
            int(width * 0.35),
            int(height * 0.15),
            int(width * 0.65),
            int(height * 0.92),
        )
        state = self._empty_state()
        state["model_loaded"] = False
        state["demo_mode"] = True
        state["vision"] = summarize(
            [
                {
                    "worker_id": 1,
                    "bbox": list(box),
                    "confidence": 1.0,
                    "helmet_detected": True,
                    "vest_detected": True,
                    "missing_helmet": False,
                    "missing_vest": False,
                }
            ]
        )
        state["worker_states"] = [
            {
                "worker_id": 1,
                "bbox": list(box),
                "confidence": 1.0,
                "helmet_detected": True,
                "vest_detected": True,
                "missing_helmet": False,
                "missing_vest": False,
            }
        ]
        state["timestamp"] = time.time()
        return state, frame

    def process_frame(self, frame):
        if self.demo_mode:
            state, annotated = self._demo_state(frame)
        else:
            assert self._model is not None
            results = self._model.predict(
                source=frame,
                conf=self.confidence,
                iou=self.iou,
                verbose=False,
            )
            result = results[0]

            names = result.names
            detections: list[Detection] = []
            serializable = []

            if result.boxes is not None:
                for box in result.boxes:
                    cls_id = int(box.cls[0].item())
                    conf = float(box.conf[0].item())
                    x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]
                    class_name = str(names[cls_id])
                    detections.append(
                        Detection(
                            class_name=class_name,
                            confidence=conf,
                            bbox=(x1, y1, x2, y2),
                        )
                    )
                    serializable.append(
                        {
                            "class_name": class_name,
                            "confidence": round(conf, 3),
                            "bbox": [x1, y1, x2, y2],
                        }
                    )

            worker_states = classify_people(detections)
            unauthorized_zone = self._unauthorized_zone(worker_states)
            vision = summarize(worker_states, unauthorized_zone=unauthorized_zone)
            state = {
                "source": self.source,
                "timestamp": time.time(),
                "vision": vision,
                "detections": serializable,
                "worker_states": worker_states,
                "model_loaded": True,
                "demo_mode": False,
                "error": None,
            }
            annotated = result.plot()

        # Draw the configured safe zone so an unauthorized worker crossing
        # its boundary becomes visually obvious in the pitch.
        zx1, zy1, zx2, zy2 = self.zone_rect
        zx2 = min(zx2, annotated.shape[1] - 1)
        zy2 = min(zy2, annotated.shape[0] - 1)
        cv2.rectangle(annotated, (zx1, zy1), (zx2, zy2), (80, 180, 120), 2)

        # Stamp the state onto the image so the edge stream itself is useful
        # during a pitch/demo.
        label = (
            f"COALGUARD EDGE CV | {state['vision']['severity']} | "
            f"Workers: {state['vision']['workers_detected']} | "
            f"PPE violations: {state['vision']['missing_ppe_count']}"
        )
        cv2.rectangle(annotated, (0, 0), (annotated.shape[1], 42), (20, 20, 20), -1)
        cv2.putText(
            annotated,
            label,
            (12, 28),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.65,
            (255, 255, 255),
            2,
            cv2.LINE_AA,
        )

        return state, annotated

    def update(self) -> dict[str, Any]:
        with self._lock:
            if self._capture is None:
                self.start()

            assert self._capture is not None
            ok, frame = self._capture.read()

            if not ok:
                # Loop prerecorded files so the pitch demo doesn't stop at EOF.
                self._capture.set(cv2.CAP_PROP_POS_FRAMES, 0)
                ok, frame = self._capture.read()

            if not ok:
                raise RuntimeError("OpenCV could not read a frame")

            state, annotated = self.process_frame(frame)

            ok, encoded = cv2.imencode(".jpg", annotated, [cv2.IMWRITE_JPEG_QUALITY, 82])
            if not ok:
                raise RuntimeError("Could not JPEG-encode annotated frame")

            self._latest_jpeg = encoded.tobytes()
            self._latest_state = state
            self._last_frame_time = time.time()
            return state

    def get_state(self) -> dict[str, Any]:
        with self._lock:
            return dict(self._latest_state)

    def get_jpeg(self) -> bytes | None:
        with self._lock:
            return self._latest_jpeg


engine = VisionEngine()
