from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import orders, producer

settings = get_settings()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(orders.router)
app.include_router(producer.router)


@app.get("/")
def read_root():
    return {"status": "ok"}
