from edge_cv.ppe_logic import Detection, classify_people, summarize


def test_safe_worker():
    detections = [
        Detection("Person", 0.95, (0, 0, 100, 200)),
        Detection("Hardhat", 0.90, (30, 10, 70, 50)),
        Detection("Safety Vest", 0.90, (20, 70, 80, 150)),
    ]
    states = classify_people(detections)
    assert len(states) == 1
    assert states[0]["missing_helmet"] is False
    assert states[0]["missing_vest"] is False
    assert summarize(states)["missing_ppe_count"] == 0


def test_missing_helmet():
    detections = [
        Detection("Person", 0.95, (0, 0, 100, 200)),
        Detection("Safety Vest", 0.90, (20, 70, 80, 150)),
        Detection("NO-Hardhat", 0.90, (30, 10, 70, 50)),
    ]
    states = classify_people(detections)
    assert states[0]["missing_helmet"] is True
    assert states[0]["missing_vest"] is False
    assert summarize(states)["severity"] == "HIGH"


def test_two_ppe_violations_are_critical():
    detections = [
        Detection("Person", 0.95, (0, 0, 100, 200)),
        Detection("NO-Hardhat", 0.90, (30, 10, 70, 50)),
        Detection("Person", 0.95, (120, 0, 220, 200)),
        Detection("NO-Safety Vest", 0.90, (140, 70, 200, 150)),
    ]
    states = classify_people(detections)
    assert summarize(states)["missing_ppe_count"] == 2
    assert summarize(states)["severity"] == "CRITICAL"
