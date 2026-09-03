"""FastAPI service for CoalGuard Member-2 Edge CV.

Member 1 can import `router` into the shared FastAPI application rather than
running a second server.
"""

from __future__ import annotations

import asyncio
import os
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from .detector import engine


router = APIRouter(prefix="/api/vision", tags=["edge-cv"])


@router.get("/health")
def health() -> dict:
    state = engine.get_state()
    return {
        "status": "ok",
        "service": "coalguard-edge-cv",
        "model_loaded": state["model_loaded"],
        "demo_mode": state["demo_mode"],
        "source": state["source"],
        "error": state["error"],
    }


@router.get("/state")
def state() -> dict:
    try:
        # Process one frame when the state is stale. This keeps the API useful
        # even when the stream endpoint is not being viewed.
        current = engine.get_state()
        if current["timestamp"] < engine._last_frame_time + 0.001:
            pass
        return engine.update()
    except Exception as exc:
        current = engine.get_state()
        current["error"] = str(exc)
        return current


async def frame_generator() -> AsyncIterator[bytes]:
    while True:
        try:
            engine.update()
        except Exception as exc:
            current = engine.get_state()
            current["error"] = str(exc)
            await asyncio.sleep(1)
            continue

        frame = engine.get_jpeg()
        if frame:
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n"
                + frame
                + b"\r\n"
            )
        await asyncio.sleep(1 / engine.stream_fps)


@router.get("/stream")
async def stream() -> StreamingResponse:
    return StreamingResponse(
        frame_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers={"Cache-Control": "no-cache"},
    )


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Do not open the camera until an endpoint is requested. This keeps the
    # shared backend startup lightweight.
    yield
    engine.stop()


app = FastAPI(
    title="CoalGuard Edge CV",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "edge_cv.service:app",
        host=os.getenv("EDGE_CV_HOST", "0.0.0.0"),
        port=int(os.getenv("EDGE_CV_PORT", "8000")),
        reload=False,
    )
