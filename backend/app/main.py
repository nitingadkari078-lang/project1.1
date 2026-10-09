"""Main FastAPI application entry point."""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import logging

from app.core.config import DATABASE_URL, SECRET_KEY, CORS_ORIGINS
from app.database import engine, Base
from app.routes import auth, hospitals, visits, emergency, emergency_readonly, private_keys, audit, qr_share

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("MediVault API starting up")
    yield
    # Shutdown
    logger.info("MediVault API shutting down")

# Create FastAPI app
app = FastAPI(
    title="MediVault API",
    description="Patient-controlled medical record sharing platform",
    version="0.1.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/")
async def root():
    return {
        "name": "MediVault API",
        "version": "0.1.0",
        "status": "operational",
        "documentation": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy"}

# Include routers
app.include_router(auth.router)
app.include_router(hospitals.router)
app.include_router(visits.router)
app.include_router(emergency.router, prefix="/emergency-list")
app.include_router(emergency_readonly.em_router)
app.include_router(private_keys.router)
app.include_router(audit.router)
app.include_router(qr_share.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
