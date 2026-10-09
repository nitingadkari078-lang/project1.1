import os

# DATABASE_URL can be overridden via environment variable.
# Falls back to PostgreSQL by default; set e.g. DATABASE_URL=sqlite:///./medivault.db
# for local runs without a PostgreSQL server.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://medivault:medivault_password@localhost:5432/medivault",
)

# Google OAuth
GOOGLE_CLIENT_ID = "your-google-client-id"
GOOGLE_CLIENT_SECRET = "your-google-client-secret"
GOOGLE_REDIRECT_URI = "http://localhost:8000/auth/google/callback"

# JWT
SECRET_KEY = "your-secret-key-change-in-production-min-32-chars"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 30

# CORS allowed origins
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]

# Pagination
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

# Token expiration (emergency access)
EMERGENCY_ACCESS_EXPIRE_HOURS = 6
EMERGENCY_ACCESS_MIN_HOURS = 1
EMERGENCY_ACCESS_MAX_HOURS = 24

# Record sharing durations
CONSENT_DURATIONS = [7, 30, 90, 365]
