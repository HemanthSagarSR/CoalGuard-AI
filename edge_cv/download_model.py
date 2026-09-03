"""Download an optional public YOLOv8 PPE checkpoint.

This is a fallback to unblock the integration demo. For the team's final
submission, replace it with your own fine-tuned checkpoint when available.

Default checkpoint:
    Hexmon/vyra-yolo-ppe-detection / best.pt

The model card lists a CC BY 4.0 license and PPE-focused YOLOv8 usage.
"""

from pathlib import Path

from huggingface_hub import hf_hub_download

REPO_ID = "Hexmon/vyra-yolo-ppe-detection"
FILENAME = "best.pt"
TARGET = Path("edge_cv/models/best.pt")


def main() -> None:
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    path = hf_hub_download(
        repo_id=REPO_ID,
        filename=FILENAME,
        local_dir=str(TARGET.parent),
    )
    downloaded = Path(path)
    if downloaded.resolve() != TARGET.resolve():
        downloaded.replace(TARGET)
    print(f"Model ready: {TARGET}")
    print("Use this only as an integration/demo fallback; prefer your own fine-tuned checkpoint.")


if __name__ == "__main__":
    main()
