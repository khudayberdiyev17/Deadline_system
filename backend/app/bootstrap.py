from .db import SessionLocal
from .models import User
from .config import settings
from argon2 import PasswordHasher
def main():
    if not settings.initial_admin_username or not settings.initial_admin_password: return
    s=SessionLocal()
    if not s.query(User).filter_by(username=settings.initial_admin_username).first():
        s.add(User(full_name="Administrator",username=settings.initial_admin_username,password_hash=PasswordHasher().hash(settings.initial_admin_password),role="admin"));s.commit()
    s.close()
if __name__=="__main__": main()

