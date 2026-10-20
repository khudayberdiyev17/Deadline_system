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

def test_grading_and_results_dashboard():
    from app.models import Subject, Assignment, Recipient, Submission
    client=TestClient(app)
    s=SessionLocal()
    admin_user=User(full_name="Admin",username="admin_test",password_hash=PasswordHasher().hash("adminpass123"),role="admin")
    subj=Subject(name="Matematika")
    s.add_all([admin_user, subj]); s.commit()
    admin_id=admin_user.id
    subj_id=subj.id
    student=s.query(User).filter_by(role="student").first()
    
    # Create assignment
    asg=Assignment(subject_id=subj_id,title="Algebra 1",description="Uy ishi",deadline=datetime.now(timezone.utc)+timedelta(days=2),creator_id=admin_id,max_score=100)
    s.add(asg); s.flush()
    rec=Recipient(assignment_id=asg.id,student_id=student.id)
    s.add(rec); s.flush()
    sub=Submission(recipient_id=rec.id,comment="Bajardim")
    s.add(sub); s.commit()
    sub_id=str(sub.id)
    asg_id=str(asg.id)
    s.close()
    
    # Login as admin
    login_res=client.post("/api/v1/auth/login",json={"identity":"admin_test","password":"adminpass123"})
    assert login_res.status_code==200
    token=login_res.json()["access_token"]
    headers={"Authorization":f"Bearer {token}"}
    
    # Grade submission
    grade_res=client.post(f"/api/v1/admin/submissions/{sub_id}/grade",json={"score":95,"feedback":"A'lo darajada!"},headers=headers)
    assert grade_res.status_code==200
    assert grade_res.json()["score"]==95
    
    # Publish results
    pub_res=client.post(f"/api/v1/admin/assignments/{asg_id}/publish-results",headers=headers)
    assert pub_res.status_code==200
    assert pub_res.json()["results_published"] is True
    
    # Check dashboard results
    dash_res=client.get("/api/v1/dashboard/results")
    assert dash_res.status_code==200
    results=dash_res.json()
    assert len(results)>=1
    assert results[0]["title"]=="Algebra 1"
    assert results[0]["students"][0]["score"]==95
    assert results[0]["students"][0]["feedback"]=="A'lo darajada!"

