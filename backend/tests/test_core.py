import re
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from app.models import Base, ClassRoom, User
from app.db import engine, SessionLocal
from app.main import app
from argon2 import PasswordHasher
def setup_module():
    Base.metadata.drop_all(engine); Base.metadata.create_all(engine)
def test_registration_generates_sequential_id():
    s=SessionLocal(); c=ClassRoom(name="9-A"); s.add(c);s.commit();cid=str(c.id);s.close()
    client=TestClient(app)
    r=client.post("/api/v1/auth/register",json={"full_name":"Ali Valiyev","class_id":cid,"password":"secret123"})
    assert r.status_code==201 and re.fullmatch(r"nis@\d{3}", r.json()["student_id"])
def test_registered_student_is_created():
    s=SessionLocal();u=s.query(User).filter_by(role="student").one();assert re.fullmatch(r"nis@\d{3}", u.student_id);s.close()

