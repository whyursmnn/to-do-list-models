import os 
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    # Database MySQL
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "mysql+mysqlclient://root:password@localhost:3306/todolist_db"
    )
    # Sesuaikan user, password, host, port, dan nama database MySQL Anda

    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-yang-sangat-panjang-dan-acak")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # Token berlaku 24 jam

settings = Settings()