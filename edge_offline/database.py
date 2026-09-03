import sqlite3
import hashlib
import json
from datetime import datetime
from typing import Dict, Any

DB_PATH = "edge_coalguard.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the Day 1 local database schema."""
    with get_db_connection() as conn:
        cursor = conn.cursor()

        # 1. Sensor Telemetry Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sensor_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                methane REAL NOT NULL,
                co REAL NOT NULL,
                airflow REAL NOT NULL,
                temp REAL NOT NULL,
                recorded_at TEXT NOT NULL
            );
        """)

        # 2. Vision & PPE Violations Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS violations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                missing_ppe_count INTEGER NOT NULL,
                unauthorized_zone BOOLEAN NOT NULL,
                details TEXT,
                recorded_at TEXT NOT NULL
            );
        """)

        # 3. Cryptographic Audit Trail Table (SHA-256 Hash Chained)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action TEXT NOT NULL,
                entity TEXT NOT NULL,
                details TEXT NOT NULL,
                previous_hash TEXT NOT NULL,
                current_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
        """)
        conn.commit()
    print("Database tables initialized successfully in edge_coalguard.db")

def insert_sensor_log(methane: float, co: float, airflow: float, temp: float):
    now = datetime.utcnow().isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO sensor_logs (methane, co, airflow, temp, recorded_at)
            VALUES (?, ?, ?, ?, ?)
        """, (methane, co, airflow, temp, now))
        conn.commit()

def insert_violation(missing_ppe: int, unauthorized: bool, details: str = ""):
    now = datetime.utcnow().isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO violations (missing_ppe_count, unauthorized_zone, details, recorded_at)
            VALUES (?, ?, ?, ?)
        """, (missing_ppe, unauthorized, details, now))
        conn.commit()

def log_audit_event(action: str, entity: str, details: Dict[str, Any]):
    now = datetime.utcnow().isoformat()
    details_str = json.dumps(details, sort_keys=True)
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT current_hash FROM audit_history ORDER BY id DESC LIMIT 1;")
        row = cursor.fetchone()
        prev_hash = row["current_hash"] if row else "GENESIS_HASH_0000000000"

        payload = f"{prev_hash}|{action}|{entity}|{details_str}|{now}"
        curr_hash = hashlib.sha256(payload.encode("utf-8")).hexdigest()

        cursor.execute("""
            INSERT INTO audit_history (action, entity, details, previous_hash, current_hash, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (action, entity, details_str, prev_hash, curr_hash, now))
        conn.commit()

if __name__ == "__main__":
    init_db()
    insert_sensor_log(1.15, 40.0, 2.4, 31.0)
    insert_violation(1, False, "Worker spotted without helmet in Sector 2")
    log_audit_event("DGMS_ALERT", "SECTOR_2", {"rule": "CMR 2017 Rule 125 Breached"})
    print("Test records inserted successfully.")
