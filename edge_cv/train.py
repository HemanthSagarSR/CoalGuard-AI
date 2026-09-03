"""Train the Member-2 PPE detector.

Example:
    python edge_cv/train.py --data edge_cv/dataset/data.yaml --model yolov8n.pt --epochs 25
"""

from __future__ import annotations

import argparse
from pathlib import Path

from ultralytics import YOLO


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train CoalGuard PPE YOLO model")
    parser.add_argument("--data", required=True, help="Path to YOLO dataset YAML")
    parser.add_argument("--model", default="yolov8n.pt", help="Base YOLO checkpoint")
    parser.add_argument("--epochs", type=int, default=25)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=-1)
    parser.add_argument("--device", default=None, help="cpu, 0, 1, ...; omit for auto")
    parser.add_argument("--project", default="runs/ppe")
    parser.add_argument("--name", default="coalguard-ppe")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    data = Path(args.data)
    if not data.exists():
        raise FileNotFoundError(f"Dataset YAML not found: {data}")

    model = YOLO(args.model)
    train_kwargs = dict(
        data=str(data),
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        project=args.project,
        name=args.name,
        pretrained=True,
        verbose=True,
    )
    if args.device:
        train_kwargs["device"] = args.device

    model.train(**train_kwargs)
    print("\nTraining complete.")
    print(f"Copy the best checkpoint from {args.project}/{args.name}/weights/best.pt")
    print("to edge_cv/models/best.pt for the CoalGuard edge service.")


if __name__ == "__main__":
    main()
