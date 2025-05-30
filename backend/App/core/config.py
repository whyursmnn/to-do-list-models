import os 
from dotenv import load_dotenv


load_dotenv()

class Settings:
    
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "mysql+pymysql://root@localhost:3306/todolist_db"
    )
    

    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-jwt-key-change-this-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # Token berlaku 24 jam

settings = Settings()