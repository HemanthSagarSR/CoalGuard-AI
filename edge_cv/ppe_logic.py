"""PPE association and safety-event logic for CoalGuard Edge CV.

The detector returns independent bounding boxes. This module associates PPE
boxes with the nearest person box using center-point containment / distance.
It supports both positive PPE classes (helmet/vest) and explicit negative
classes (no_helmet/no_vest) when the dataset provides them.
"""

from __future__ import annotations

from dataclasses import dataclass
from math import hypot
from typing import Iterable


HELMET_ALIASES = {
    "helmet",
    "hardhat",
    "hard_hat",
    "hard-hat",
    "safety_helmet",
}
VEST_ALIASES = {
    "vest",
    "safety_vest",
    "safety-vest",
    "reflective_vest",
    "hi_vis_vest",
    "high_visibility_vest",
}
NO_HELMET_ALIASES = {
    "no_helmet",
    "nohelmet",
    "no_hardhat",
    "no_hard_hat",
    "no-hardhat",
    "no-hard_hat",
    "missing_helmet",
    "missing_hardhat",
    "head",
}
NO_VEST_ALIASES = {
    "no_vest",
    "novest",
    "no_safety_vest",
    "no-safety-vest",
    "missing_vest",
}
PERSON_ALIASES = {"person", "worker", "miner"}


@dataclass
class Detection:
    class_name: str
    confidence: float
    bbox: tuple[int, int, int, int]

    @property
    def center(self) -> tuple[float, float]:
        x1, y1, x2, y2 = self.bbox
        return ((x1 + x2) / 2, (y1 + y2) / 2)


def norm(name: str) -> str:
    return name.strip().lower().replace(" ", "_")


def point_in_box(point: tuple[float, float], box: tuple[int, int, int, int]) -> bool:
    x, y = point
    x1, y1, x2, y2 = box
    return x1 <= x <= x2 and y1 <= y <= y2


def distance_to_person(det: Detection, person: Detection) -> float:
    px, py = person.center
    x, y = det.center
    # Normalize by person box dimensions so distance behaves similarly at
    # different camera scales.
    w = max(person.bbox[2] - person.bbox[0], 1)
    h = max(person.bbox[3] - person.bbox[1], 1)
    return hypot((x - px) / w, (y - py) / h)


def nearest_person(det: Detection, people: list[Detection]) -> Detection | None:
    containing = [p for p in people if point_in_box(det.center, p.bbox)]
    if containing:
        return min(containing, key=lambda p: distance_to_person(det, p))
    return min(people, key=lambda p: distance_to_person(det, p)) if people else None


def classify_people(detections: Iterable[Detection]) -> list[dict]:
    detections = list(detections)
    people = [d for d in detections if norm(d.class_name) in PERSON_ALIASES]

    positive_helmet = [d for d in detections if norm(d.class_name) in HELMET_ALIASES]
    positive_vest = [d for d in detections if norm(d.class_name) in VEST_ALIASES]
    negative_helmet = [d for d in detections if norm(d.class_name) in NO_HELMET_ALIASES]
    negative_vest = [d for d in detections if norm(d.class_name) in NO_VEST_ALIASES]

    states = []
    for index, person in enumerate(people, start=1):
        helmet_hits = [d for d in positive_helmet if nearest_person(d, people) is person]
        vest_hits = [d for d in positive_vest if nearest_person(d, people) is person]
        no_helmet_hits = [d for d in negative_helmet if nearest_person(d, people) is person]
        no_vest_hits = [d for d in negative_vest if nearest_person(d, people) is person]

        helmet_ok = bool(helmet_hits) and not no_helmet_hits
        vest_ok = bool(vest_hits) and not no_vest_hits

        # If a dataset does not contain positive/negative PPE classes, we
        # avoid pretending the person is compliant. The API reports the
        # missing PPE based on what the model can actually observe.
        missing_helmet = bool(no_helmet_hits) or not helmet_ok
        missing_vest = bool(no_vest_hits) or not vest_ok

        states.append(
            {
                "worker_id": index,
                "bbox": list(person.bbox),
                "confidence": round(person.confidence, 3),
                "helmet_detected": helmet_ok,
                "vest_detected": vest_ok,
                "missing_helmet": missing_helmet,
                "missing_vest": missing_vest,
            }
        )

    return states


def summarize(states: list[dict], unauthorized_zone: bool = False) -> dict:
    missing_helmet = sum(1 for s in states if s["missing_helmet"])
    missing_vest = sum(1 for s in states if s["missing_vest"])
    missing_ppe = sum(
        1 for s in states if s["missing_helmet"] or s["missing_vest"]
    )

    if unauthorized_zone or missing_helmet >= 2 or missing_ppe >= 2:
        severity = "CRITICAL"
    elif missing_ppe:
        severity = "HIGH"
    elif states:
        severity = "LOW"
    else:
        severity = "LOW"

    return {
        "workers_detected": len(states),
        "missing_ppe_count": missing_ppe,
        "missing_helmet_count": missing_helmet,
        "missing_vest_count": missing_vest,
        "unauthorized_zone": unauthorized_zone,
        "severity": severity,
    }
