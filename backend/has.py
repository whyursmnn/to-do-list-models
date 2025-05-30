from passlib.context import CryptContext

# Setup context bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

if __name__ == "__main__":
    # Contoh generate hash untuk password 'admin123'
    password = "wahyu123"
    hashed = hash_password(password)
    print("Hash password untuk 'wahyu123':")
    print(hashed)

    # Contoh verifikasi
    assert verify_password("wahyu123", hashed) == True
    assert verify_password("wrongpassword", hashed) == False
    print("Verifikasi password berhasil.")
