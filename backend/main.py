"""FastAPI app: REST + WebSocket surface over the live experiment.

Two modes
---------
- "demo"  : a background simulator invents traffic so the dashboard is always
            alive (great for presentations). Nothing is persisted.
- "live"  : the simulator is off; your real product sends events via POST /event.
            Events are persisted to SQLite and replayed on restart.

Endpoints
---------
GET  /status        -> current experiment state (to_dict)
POST /reset         -> reset the current experiment (clears live data in live mode)
POST /config        -> rebuild the experiment from new parameters
POST /mode          -> switch between "demo" and "live"
GET  /assign        -> sticky variant assignment for a user_id
POST /event         -> ingest one real observation (live mode)
WS   /ws            -> pushes the full experiment state as JSON every 400ms
"""

import asyncio
import contextlib
from typing import Optional

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from persistence import EventStore, assign_variant
from simulator import stream_events
from store import Experiment

app = FastAPI(title="A/B Test Monitor")

# Wide-open CORS — fine for a local dev tool / demo deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Shared mutable state
# ---------------------------------------------------------------------------
experiment = Experiment.create(mode="demo")
db = EventStore()
_sim_task: Optional[asyncio.Task] = None


async def _run_simulator() -> None:
    """Drain the event stream until the experiment reaches a decision."""
    async for _variant, _converted in stream_events(
        experiment, experiment.events_per_second
    ):
        # The stream itself records into the experiment; nothing to do here.
        pass


def _start_simulator() -> None:
    """(Re)launch the background simulator task — demo mode only."""
    global _sim_task
    if _sim_task and not _sim_task.done():
        _sim_task.cancel()
    _sim_task = asyncio.create_task(_run_simulator())


async def _stop_simulator() -> None:
    global _sim_task
    if _sim_task and not _sim_task.done():
        _sim_task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await _sim_task
    _sim_task = None


def _replay_live() -> None:
    """Rebuild live experiment state by replaying persisted events."""
    experiment.reset()
    for variant, converted in db.all_events():
        experiment.record(variant, converted)


class Config(BaseModel):
    p0: float = 0.10
    p1: float = 0.12
    alpha: float = 0.05
    beta: float = 0.20
    events_per_second: float = 3.0


class ModeChange(BaseModel):
    mode: str  # "demo" | "live"


class Event(BaseModel):
    user_id: str
    converted: bool
    variant: Optional[str] = None  # optional override; otherwise derived from user_id


@app.on_event("startup")
async def _on_startup() -> None:
    # Start in demo mode so the dashboard is alive on first open.
    _start_simulator()


@app.on_event("shutdown")
async def _on_shutdown() -> None:
    await _stop_simulator()


@app.get("/status")
async def get_status() -> dict:
    return experiment.to_dict()


@app.post("/reset")
async def reset() -> dict:
    """Reset the current experiment.

    In live mode this also clears persisted events (a true fresh start).
    """
    await _stop_simulator()
    if experiment.mode == "live":
        db.clear()
        experiment.reset()
    else:
        experiment.reset()
        _start_simulator()
    return experiment.to_dict()


@app.post("/config")
async def configure(cfg: Config) -> dict:
    """Rebuild the experiment with new parameters, preserving the current mode."""
    global experiment
    await _stop_simulator()
    mode = experiment.mode
    experiment = Experiment.create(
        name=experiment.name,
        p0=cfg.p0,
        p1=cfg.p1,
        alpha=cfg.alpha,
        beta=cfg.beta,
        events_per_second=cfg.events_per_second,
        mode=mode,
    )
    if mode == "live":
        _replay_live()  # recompute against the new boundaries
    else:
        _start_simulator()
    return experiment.to_dict()


@app.post("/mode")
async def set_mode(change: ModeChange) -> dict:
    """Switch between demo and live mode."""
    if change.mode not in ("demo", "live"):
        raise HTTPException(400, "mode must be 'demo' or 'live'")
    global experiment
    await _stop_simulator()
    experiment.mode = change.mode
    if change.mode == "live":
        _replay_live()  # load whatever real data already exists
    else:
        experiment.reset()
        _start_simulator()
    return experiment.to_dict()


@app.get("/assign")
async def assign(user_id: str) -> dict:
    """Return the sticky variant a given user should be shown."""
    return {"user_id": user_id, "variant": assign_variant(user_id)}


@app.post("/event")
async def ingest_event(evt: Event) -> dict:
    """Ingest one real observation (live mode only).

    The variant is derived from user_id (sticky 50/50) unless explicitly given.
    Duplicate user_ids are ignored so each user counts exactly once.
    """
    if experiment.mode != "live":
        raise HTTPException(409, "experiment is in demo mode; switch to live first")
    variant = evt.variant or assign_variant(evt.user_id)
    is_new = db.add_event(evt.user_id, variant, evt.converted)
    if is_new:
        experiment.record(variant, evt.converted)
    return {"recorded": is_new, "variant": variant, "status": experiment.status}


@app.websocket("/ws")
async def ws(websocket: WebSocket) -> None:
    await websocket.accept()
    try:
        while True:
            await websocket.send_json(experiment.to_dict())
            await asyncio.sleep(0.4)
    except WebSocketDisconnect:
        pass
    except asyncio.CancelledError:
        raise
