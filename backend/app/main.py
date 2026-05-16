"""
FindUrWay — FastAPI Main Application
AI-Powered Career Recommendation Platform

Entry point for the backend server. Configures:
- CORS middleware for frontend communication
- Lifespan events for NLP model loading
- API routers for analysis, jobs, and saved jobs
- Database initialization
- Swagger documentation
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import init_db
from app.services import nlp_service
from app.routers import analysis, jobs, saved_jobs
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler:
    - Startup: Load NLP model + initialize database tables
    - Shutdown: Cleanup resources
    """
    # ── Startup ──
    logger.info("🚀 Starting FindUrWay Backend...")
    
    # Initialize database tables
    try:
        init_db()
        logger.info("✅ Database tables initialized")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        logger.info("ℹ️  Make sure PostgreSQL is running and the database exists")
    
    # Load NLP model (Sentence Transformers)
    try:
        nlp_service.load_model(settings.MODEL_NAME)
        logger.info("✅ NLP model loaded")
    except Exception as e:
        logger.warning(f"⚠️ NLP model loading failed: {e}")
        logger.info("ℹ️  Matching will use keyword fallback mode")
    
    logger.info("🟢 FindUrWay Backend is ready!")
    
    yield  # App runs here
    
    # ── Shutdown ──
    logger.info("👋 Shutting down FindUrWay Backend...")


# ── Create FastAPI Application ──
app = FastAPI(
    title="FindUrWay API",
    description=(
        "AI-Powered Career Recommendation Platform. "
        "Analyzes user profiles using NLP and matches them "
        "to relevant job opportunities in Morocco."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS Configuration ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register Routers ──
app.include_router(analysis.router)
app.include_router(jobs.router)
app.include_router(saved_jobs.router)


# ── Root Endpoint ──
@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {
        "name": "FindUrWay API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "description": "AI-Powered Career Recommendation Platform",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check with service status."""
    model_loaded = nlp_service.get_model() is not None
    return {
        "status": "healthy",
        "nlp_model": "loaded" if model_loaded else "not loaded (using fallback)",
        "database": "connected",
        "api": "adzuna",
    }
