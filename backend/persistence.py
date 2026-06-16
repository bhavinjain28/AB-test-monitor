"""SQLite persistence for live experiment events.

Demo-mode data is ephemeral (it's simulated), so only *live* events are stored.
Each real participant is one row, deduped by user_id, so the SPRT engine sees
exactly one observation per user even if the product sends an event twice.

On startup the live events are replayed into a fresh engine, so results survive
server restarts and deploys.
"""

import hashlib
import os
import sqlite3
import threading
import time

DB_PATH = os.path.join(os.path.dirname(__file__), "experiment.db")


def assign_variant(user_id: str) -> str:
    """Deterministic, sticky 50/50 bucketing from a stable hash of the user id.

    Using SHA-256 (not Python's salted ``hash()``) means the same user always
    lands in the same variant, even across processes and restarts.
    """
    digest = hashlib.sha256(str(user_id).encode("utf-8")).hexdigest()
    return "treatment" if int(digest, 16) % 2 == 0 else "control"


class EventStore:
    """Thin thread-safe wrapper around a single SQLite file."""

    def __init__(self, path: str = DB_PATH):
        self.conn = sqlite3.connect(path, check_same_thread=False)
        self.lock = threading.Lock()
        self.conn.execute(
            """
            CREATE TABLE IF NOT EXISTS events (
                user_id   TEXT PRIMARY KEY,
                variant   TEXT NOT NULL,
                converted INTEGER NOT NULL,
                ts        REAL NOT NULL
            )
            """
        )
        self.conn.commit()

    def add_event(self, user_id: str, variant: str, converted: bool) -> bool:
        """Insert one event. Returns True if new, False if a duplicate user_id."""
        with self.lock:
            try:
                self.conn.execute(
                    "INSERT INTO events (user_id, variant, converted, ts) VALUES (?, ?, ?, ?)",
                    (str(user_id), variant, 1 if converted else 0, time.time()),
                )
                self.conn.commit()
                return True
            except sqlite3.IntegrityError:
                return False  # user already recorded — ignore

    def all_events(self):
        """All events in arrival order, as (variant, converted) tuples."""
        cur = self.conn.execute("SELECT variant, converted FROM events ORDER BY ts")
        return [(variant, bool(converted)) for variant, converted in cur.fetchall()]

    def count(self) -> int:
        cur = self.conn.execute("SELECT COUNT(*) FROM events")
        return cur.fetchone()[0]

    def clear(self) -> None:
        with self.lock:
            self.conn.execute("DELETE FROM events")
            self.conn.commit()
