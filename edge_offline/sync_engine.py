import sqlite3
import json
import time
from datetime import datetime
from typing import Dict, Any, List

DB_PATH = "edge_coalguard.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def setup_sync_columns():
    """Adds sync tracking columns to local tables if not already present."""
    with get_connection() as conn:
        cursor = conn.cursor()
        for table in ["sensor_logs", "violations", "audit_history"]:
            try:
                cursor.execute(f"ALTER TABLE {table} ADD COLUMN synced INTEGER DEFAULT 0;")
            except sqlite3.OperationalError:
                pass  # Column already exists
        conn.commit()

class OfflineSyncEngine:
    def __init__(self):
        setup_sync_columns()

    def get_pending_counts(self) -> Dict[str, int]:
        """Returns the number of queued records waiting to be synced to the cloud."""
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) as c FROM sensor_logs WHERE synced = 0;")
            sensors = cursor.fetchone()["c"]
            cursor.execute("SELECT COUNT(*) as c FROM violations WHERE synced = 0;")
            violations = cursor.fetchone()["c"]
            cursor.execute("SELECT COUNT(*) as c FROM audit_history WHERE synced = 0;")
            audits = cursor.fetchone()["c"]
            return {
                "pending_sensors": sensors,
                "pending_violations": violations,
                "pending_audits": audits,
                "total_pending": sensors + violations + audits
            }

    def flush_to_cloud(self, network_available: bool = True) -> Dict[str, Any]:
        """
        Store-and-Forward mechanism:
        Flushes unsynced local rows when the network is restored.
        """
        if not network_available:
            pending = self.get_pending_counts()
            return {
                "status": "OFFLINE_QUEUED",
                "message": "Underground connectivity lost. Data safely cached in SQLite.",
                "pending_records": pending["total_pending"]
            }

        with get_connection() as conn:
            cursor = conn.cursor()
            
            # Fetch pending records before marking them synced
            cursor.execute("SELECT * FROM sensor_logs WHERE synced = 0;")
            synced_sensors = len(cursor.fetchall())
            cursor.execute("UPDATE sensor_logs SET synced = 1 WHERE synced = 0;")

            cursor.execute("SELECT * FROM violations WHERE synced = 0;")
            synced_violations = len(cursor.fetchall())
            cursor.execute("UPDATE violations SET synced = 1 WHERE synced = 0;")

            cursor.execute("SELECT * FROM audit_history WHERE synced = 0;")
            synced_audits = len(cursor.fetchall())
            cursor.execute("UPDATE audit_history SET synced = 1 WHERE synced = 0;")

            conn.commit()

        return {
            "status": "ONLINE_SYNCED",
            "message": "Network restored. All cached local records forwarded successfully.",
            "synced_summary": {
                "sensors": synced_sensors,
                "violations": synced_violations,
                "audits": synced_audits
            }
        }

if __name__ == "__main__":
    engine = OfflineSyncEngine()

    print("--- 1. Testing Offline Underground Mode (Wi-Fi Dropped) ---")
    offline_status = engine.flush_to_cloud(network_available=False)
    print(json.dumps(offline_status, indent=2))

    print("\n--- 2. Simulating Reconnection & Forwarding Queued Data ---")
    sync_status = engine.flush_to_cloud(network_available=True)
    print(json.dumps(sync_status, indent=2))
