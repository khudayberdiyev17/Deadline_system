import os, uuid, time, secrets
from datetime import datetime, timezone, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo
import jwt
from argon2 import PasswordHasher
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from .db import db
from .models import User, ClassRoom, Subject, Assignment, Recipient, Submission, StoredFile, StudentSequence
from .config import settings
ph=PasswordHasher()
app=FastAPI(title="NIS Assignment API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins.split(","), allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
attempts={}
class Register(BaseModel):
    full_name:str=Field(min_length=3,max_length=180); class_id:uuid.UUID; password:str=Field(min_length=8,max_length=128)
class Login(BaseModel): identity:str; password:str
class ClassIn(BaseModel): name:str=Field(min_length=1,max_length=80)
class SubjectIn(BaseModel): name:str=Field(min_length=1,max_length=100)
class AssignmentIn(BaseModel):
    subject_id:uuid.UUID; title:str=Field(min_length=3,max_length=180); description:str=Field(min_length=3); notes:str|None=None
    deadline:datetime; target_type:str; class_id:uuid.UUID|None=None; student_id:uuid.UUID|None=None
    max_score:int=Field(default=100,ge=1,le=1000)
class GradeIn(BaseModel):
    score:int=Field(ge=0); feedback:str|None=None
def err(status, detail): raise HTTPException(status, detail)
def token(user):
    return jwt.encode({"sub":str(user.id),"role":user.role,"exp":datetime.now(timezone.utc)+timedelta(hours=8)},settings.jwt_secret,algorithm="HS256")
def current(request:Request, session:Session=Depends(db)):
    raw=request.headers.get("Authorization","").removeprefix("Bearer ") or request.cookies.get("nis_token")
    try: data=jwt.decode(raw,settings.jwt_secret,algorithms=["HS256"])
    except Exception: err(401,"Kirish talab qilinadi")
    user=session.get(User,uuid.UUID(data["sub"]))
    if not user: err(401,"Foydalanuvchi topilmadi. Qayta tizimga kiring")
    if not user.active: err(401,"Hisob faol emas")
    return user
def admin(user=Depends(current)):
    if user.role!="admin": err(403,"Faqat administrator uchun")
    return user
def serialize_user(u): return {"id":str(u.id),"full_name":u.full_name,"student_id":u.student_id,"role":u.role,"class_id":str(u.class_id) if u.class_id else None,"class_name":u.classroom.name if u.classroom else None,"active":u.active}
def status(rec):
    submitted=rec.submission if hasattr(rec,"submission") else None
    expired=datetime.now(timezone.utc)>=rec.assignment.deadline
    return "submitted" if submitted else ("locked" if expired else "pending")
@app.get("/health")
def health(): return {"status":"ok"}
@app.post("/api/v1/auth/register",status_code=201)
def register(data:Register, session:Session=Depends(db)):
    classroom=session.get(ClassRoom,data.class_id)
    if not classroom or not classroom.active: err(422,"Faol sinfni tanlang")
    # The database unique constraint is the final concurrency guard; retry a random unused suffix on collision.
    for _ in range(50):
      sid=f"nis@{secrets.randbelow(999)+1:03d}"
      if session.scalar(select(User.id).where(User.student_id==sid)): continue
      user=User(full_name=data.full_name.strip(),student_id=sid,password_hash=ph.hash(data.password),role="student",class_id=classroom.id)
      try:
        with session.begin_nested():
          session.add(user); session.flush()
        session.commit()
        return {"student_id":sid,"message":"Ro‘yxatdan o‘tish muvaffaqiyatli"}
      except IntegrityError:
        session.rollback()
    err(409,"Bo‘sh o‘quvchi ID topilmadi; administrator bilan bog‘laning")
@app.post("/api/v1/auth/login")
def login(data:Login, request:Request, session:Session=Depends(db)):
    client_ip=request.headers.get("x-forwarded-for","").split(",")[0].strip() or request.headers.get("x-real-ip") or (request.client.host if request.client else "unknown")
    ident=data.identity.strip()
    key=f"{client_ip}:{ident.lower()}"
    now=time.time()
    old=[t for t in attempts.get(key,[]) if now-t<300]
    if len(old)>=15: err(429,"Juda ko‘p urinish. Keyinroq qayta urinib ko‘ring")
    user=session.execute(select(User).where((func.lower(User.student_id)==ident.lower())|(func.lower(User.username)==ident.lower()))).scalar_one_or_none()
    try: valid=bool(user) and ph.verify(user.password_hash,data.password)
    except Exception: valid=False
    if not valid: attempts[key]=old+[now]; err(401,"ID yoki parol noto‘g‘ri")
    attempts.pop(key,None)
    return {"access_token":token(user),"user":serialize_user(user)}
@app.get("/api/v1/auth/me")
def me(user=Depends(current)): return serialize_user(user)
@app.post("/api/v1/auth/logout")
def logout(): return {"message":"Chiqildi"}
@app.get("/api/v1/classes/public")
def public_classes(session:Session=Depends(db)): return [{"id":str(x.id),"name":x.name} for x in session.scalars(select(ClassRoom).where(ClassRoom.active)).all()]
@app.get("/api/v1/student/assignments")
def student_assignments(user=Depends(current),session:Session=Depends(db)):
    if user.role!="student": err(403,"O‘quvchi hisobi talab qilinadi")
    recs=session.scalars(select(Recipient).where(Recipient.student_id==user.id)).all()
    result=[]
    for r in recs:
      sub=session.scalar(select(Submission).where(Submission.recipient_id==r.id))
      st="graded" if (sub and sub.score is not None) else ("submitted" if sub else ("locked" if datetime.now(timezone.utc)>=r.assignment.deadline else "pending"))
      result.append({"recipient_id":str(r.id),"assignment_id":str(r.assignment.id),"subject":r.assignment.subject.name,"title":r.assignment.title,"description":r.assignment.description,"deadline":r.assignment.deadline,"max_score":r.assignment.max_score,"results_published":r.assignment.results_published,"status":st,"score":sub.score if sub else None,"feedback":sub.feedback if sub else None,"submitted_at":sub.submitted_at if sub else None,"graded_at":sub.graded_at if sub else None})
    return result
@app.get("/api/v1/assignments/{assignment_id}")
def assignment_detail(assignment_id:uuid.UUID,user=Depends(current),session:Session=Depends(db)):
    assignment=session.get(Assignment,assignment_id)
    if not assignment: err(404,"Vazifa topilmadi")
    rec=None
    if user.role=="student":
      rec=session.scalar(select(Recipient).where(Recipient.assignment_id==assignment_id,Recipient.student_id==user.id))
      if not rec: err(403,"Ruxsat yo‘q")
    attachments=session.scalars(select(StoredFile).where(StoredFile.assignment_id==assignment_id)).all()
    files=session.scalars(select(StoredFile).where(StoredFile.recipient_id==rec.id)).all() if rec else []
    submission=session.scalar(select(Submission).where(Submission.recipient_id==rec.id)) if rec else None
    return {"id":str(assignment.id),"subject":assignment.subject.name,"title":assignment.title,"description":assignment.description,"notes":assignment.notes,"deadline":assignment.deadline,"max_score":assignment.max_score,"results_published":assignment.results_published,"locked":datetime.now(timezone.utc)>=assignment.deadline,"submitted_at":submission.submitted_at if submission else None,"comment":submission.comment if submission else None,"score":submission.score if submission else None,"feedback":submission.feedback if submission else None,"graded_at":submission.graded_at if submission else None,"attachments":[{"id":str(f.id),"name":f.original_name} for f in attachments],"submission_files":[{"id":str(f.id),"name":f.original_name} for f in files]}
def save_upload(upload:UploadFile, assignment_id=None, recipient_id=None,session=None):
    name=Path(upload.filename or "").name
    ext=Path(name).suffix.lower()
    if not name: err(422,"Fayl nomi topilmadi")
    raw=upload.file.read()
    if len(raw)>settings.max_upload_bytes: err(413,"Fayl hajmi limitdan oshdi")
    key=str(uuid.uuid4())+ext; Path(settings.upload_dir).mkdir(parents=True,exist_ok=True)
    (Path(settings.upload_dir)/key).write_bytes(raw)
    f=StoredFile(assignment_id=assignment_id,recipient_id=recipient_id,original_name=name,storage_key=key,mime_type=upload.content_type or "application/octet-stream",size=len(raw));session.add(f)
@app.post("/api/v1/assignments/{assignment_id}/submissions")
def submit(assignment_id:uuid.UUID, files:list[UploadFile]=File([]), comment:str|None=Form(None),user=Depends(current),session:Session=Depends(db)):
    if user.role!="student": err(403,"Ruxsat yo‘q")
    rec=session.scalar(select(Recipient).where(Recipient.assignment_id==assignment_id,Recipient.student_id==user.id))
    if not rec: err(404,"Vazifa topilmadi")
    if datetime.now(timezone.utc)>=rec.assignment.deadline: err(409,"Muddat tugagan, yuborish yopilgan")
    files=[f for f in files if f.filename]
    if len(files)>5: err(422,"Ko‘pi bilan 5 ta fayl yuboring")
    if not files and not (comment and comment.strip()): err(422,"Fayl yoki izoh kiriting")
    names=[Path(f.filename or "").name.casefold() for f in files]
    if len(names)!=len(set(names)): err(409,"Bir xil nomli faylni qayta yuklash mumkin emas")
    existing={f.original_name.casefold() for f in session.scalars(select(StoredFile).where(StoredFile.recipient_id==rec.id)).all()}
    if any(name in existing for name in names): err(409,"Bu fayl avval yuklangan")
    sub=session.scalar(select(Submission).where(Submission.recipient_id==rec.id))
    if not sub: session.add(Submission(recipient_id=rec.id,comment=comment.strip() if comment else None))
    else: sub.comment=comment.strip() if comment else sub.comment
    # Replacing remains allowed only while open; old metadata/files are retained for audit simplicity.
    for f in files: save_upload(f,recipient_id=rec.id,session=session)
    session.commit(); return {"message":"Vazifa muvaffaqiyatli yuborildi"}
@app.get("/api/v1/files/{file_id}")
def download(file_id:uuid.UUID,user=Depends(current),session:Session=Depends(db)):
    f=session.get(StoredFile,file_id)
    if not f: err(404,"Fayl topilmadi")
    if user.role=="student":
      allowed=f.assignment_id and session.scalar(select(Recipient).where(Recipient.assignment_id==f.assignment_id,Recipient.student_id==user.id))
      if f.recipient_id: allowed=session.scalar(select(Recipient).where(Recipient.id==f.recipient_id,Recipient.student_id==user.id))
      if not allowed: err(403,"Ruxsat yo‘q")
    path=Path(settings.upload_dir)/f.storage_key
    if not path.is_file(): err(404,"Fayl mavjud emas")
    return FileResponse(path,filename=f.original_name,media_type=f.mime_type)
@app.get("/api/v1/admin/stats")
def stats(user=Depends(admin),session:Session=Depends(db)):
    recs=session.scalars(select(Recipient)).all(); submitted=sum(bool(session.scalar(select(Submission).where(Submission.recipient_id==r.id))) for r in recs)
    return {"active_students":session.scalar(select(func.count()).select_from(User).where(User.role=="student",User.active)),"classes":session.scalar(select(func.count()).select_from(ClassRoom)),"assignments":session.scalar(select(func.count()).select_from(Assignment)),"submitted":submitted,"pending":len(recs)-submitted,"expired":sum(not session.scalar(select(Submission).where(Submission.recipient_id==r.id)) and datetime.now(timezone.utc)>=r.assignment.deadline for r in recs)}
@app.get("/api/v1/admin/classes")
def classes(user=Depends(admin),session:Session=Depends(db)):
 return [{"id":str(c.id),"name":c.name,"active":c.active,"students":session.scalar(select(func.count()).select_from(User).where(User.class_id==c.id,User.active)),"task_count":session.scalar(select(func.count(func.distinct(Recipient.assignment_id))).join(User,Recipient.student_id==User.id).where(User.class_id==c.id)) or 0} for c in session.scalars(select(ClassRoom)).all()]
@app.post("/api/v1/admin/classes",status_code=201)
def create_class(data:ClassIn,user=Depends(admin),session:Session=Depends(db)):
 c=ClassRoom(name=data.name.strip());session.add(c)
 try: session.commit()
 except Exception: session.rollback();err(409,"Bu sinf allaqachon mavjud")
 return {"id":str(c.id),"name":c.name}
@app.patch("/api/v1/admin/classes/{id}")
def toggle_class(id:uuid.UUID,active:bool,user=Depends(admin),session:Session=Depends(db)):
 c=session.get(ClassRoom,id)
 if not c: err(404,"Sinf topilmadi")
 c.active=active;session.commit();return {"ok":True}
@app.get("/api/v1/admin/classes/{id}/overview")
def class_overview(id:uuid.UUID,user=Depends(admin),session:Session=Depends(db)):
 classroom=session.get(ClassRoom,id)
 if not classroom: err(404,"Sinf topilmadi")
 now_utc=datetime.now(timezone.utc)
 students=session.scalars(select(User).where(User.class_id==id,User.role=="student",User.active)).all()
 recipients=session.scalars(select(Recipient).join(User,Recipient.student_id==User.id).where(User.class_id==id)).all()
 submissions={r.id:session.scalar(select(Submission).where(Submission.recipient_id==r.id)) for r in recipients}
 roster=[]
 for student in students:
  own=[r for r in recipients if r.student_id==student.id]
  submitted=sum(bool(submissions[r.id]) for r in own)
  overdue=sum(not submissions[r.id] and r.assignment.deadline<=now_utc for r in own)
  pending=len(own)-submitted-overdue
  state="overdue" if overdue else ("submitted" if own and submitted==len(own) else "pending")
  roster.append({"id":str(student.id),"full_name":student.full_name,"student_id":student.student_id,"submitted_count":submitted,"pending_count":pending,"overdue_count":overdue,"state":state})
 assignments={}
 for recipient in recipients:
  assignment=recipient.assignment
  item=assignments.setdefault(assignment.id,{"id":str(assignment.id),"subject":assignment.subject.name,"title":assignment.title,"deadline":assignment.deadline,"max_score":assignment.max_score,"results_published":assignment.results_published,"recipient_count":0,"submitted_count":0})
  item["recipient_count"]+=1
  item["submitted_count"]+=bool(submissions[recipient.id])
 for item in assignments.values(): item["state"]="completed" if item["deadline"]<=now_utc else "in_progress"
 return {"id":str(classroom.id),"name":classroom.name,"students":roster,"assignments":sorted(assignments.values(),key=lambda x:x["deadline"])}
@app.get("/api/v1/admin/subjects")
def subjects(user=Depends(admin),session:Session=Depends(db)): return [{"id":str(s.id),"name":s.name,"active":s.active} for s in session.scalars(select(Subject)).all()]
@app.post("/api/v1/admin/subjects",status_code=201)
def create_subject(data:SubjectIn,user=Depends(admin),session:Session=Depends(db)):
 s=Subject(name=data.name.strip());session.add(s)
 try: session.commit()
 except Exception:session.rollback();err(409,"Bu fan allaqachon mavjud")
 return {"id":str(s.id),"name":s.name}
@app.patch("/api/v1/admin/subjects/{id}")
def toggle_subject(id:uuid.UUID,active:bool,user=Depends(admin),session:Session=Depends(db)):
 s=session.get(Subject,id)
 if not s: err(404,"Fan topilmadi")
 s.active=active;session.commit();return {"ok":True}
@app.get("/api/v1/admin/students")
def students(user=Depends(admin),session:Session=Depends(db)): return [serialize_user(x) for x in session.scalars(select(User).where(User.role=="student")).all()]
@app.patch("/api/v1/admin/students/{id}")
def toggle_student(id:uuid.UUID,active:bool,user=Depends(admin),session:Session=Depends(db)):
 student=session.get(User,id)
 if not student or student.role!="student": err(404,"O‘quvchi topilmadi")
 student.active=active;session.commit();return {"ok":True}
@app.post("/api/v1/admin/assignments",status_code=201)
def create_assignment(data:AssignmentIn,user=Depends(admin),session:Session=Depends(db)):
 deadline=data.deadline
 if deadline.tzinfo is None: deadline=deadline.replace(tzinfo=ZoneInfo("Asia/Tashkent"))
 deadline=deadline.astimezone(timezone.utc)
 if deadline<=datetime.now(timezone.utc):err(422,"Muddat kelajakda bo‘lishi kerak")
 if not session.get(Subject,data.subject_id):err(422,"Fan topilmadi")
 if data.target_type=="class" and data.class_id: targets=session.scalars(select(User).where(User.class_id==data.class_id,User.role=="student",User.active)).all()
 elif data.target_type=="student" and data.student_id: targets=[session.get(User,data.student_id)]
 else: err(422,"Qabul qiluvchi noto‘g‘ri")
 targets=[x for x in targets if x]
 if not targets:err(422,"Qabul qiluvchi o‘quvchi topilmadi")
 if data.target_type=="class":
  target_ids={student.id for student in targets}
  candidates=session.scalars(select(Assignment).where(Assignment.subject_id==data.subject_id,func.lower(Assignment.title)==data.title.strip().lower(),Assignment.deadline==deadline)).all()
  for candidate in candidates:
   existing_ids={recipient.student_id for recipient in session.scalars(select(Recipient).where(Recipient.assignment_id==candidate.id)).all()}
   if existing_ids==target_ids: err(409,"Bu sinf uchun aynan shu deadline avval yaratilgan")
 a=Assignment(subject_id=data.subject_id,title=data.title.strip(),description=data.description,notes=data.notes,deadline=deadline,creator_id=user.id,max_score=data.max_score);session.add(a);session.flush()
 for student in targets: session.add(Recipient(assignment_id=a.id,student_id=student.id))
 session.commit();return {"id":str(a.id),"recipients":len(targets)}
@app.post("/api/v1/admin/assignments/{assignment_id}/attachments")
def upload_attachment(assignment_id:uuid.UUID,files:list[UploadFile]=File(...),user=Depends(admin),session:Session=Depends(db)):
 if not session.get(Assignment,assignment_id): err(404,"Vazifa topilmadi")
 if not files or len(files)>5: err(422,"1 dan 5 tagacha fayl yuboring")
 for f in files: save_upload(f,assignment_id=assignment_id,session=session)
 session.commit();return {"message":"Fayllar yuklandi"}
@app.delete("/api/v1/admin/assignments/{assignment_id}")
def delete_assignment(assignment_id:uuid.UUID,user=Depends(admin),session:Session=Depends(db)):
 assignment=session.get(Assignment,assignment_id)
 if not assignment: err(404,"Vazifa topilmadi")
 recipients=session.scalars(select(Recipient).where(Recipient.assignment_id==assignment_id)).all()
 recipient_ids=[r.id for r in recipients]
 files=session.scalars(select(StoredFile).where((StoredFile.assignment_id==assignment_id)|(StoredFile.recipient_id.in_(recipient_ids)))).all() if recipient_ids else session.scalars(select(StoredFile).where(StoredFile.assignment_id==assignment_id)).all()
 for file in files:
  path=Path(settings.upload_dir)/file.storage_key
  if path.exists(): path.unlink()
  session.delete(file)
 for recipient in recipients:
  submission=session.scalar(select(Submission).where(Submission.recipient_id==recipient.id))
  if submission: session.delete(submission)
  session.delete(recipient)
 session.delete(assignment);session.commit()
 return {"message":"Deadline o‘chirildi"}
@app.get("/api/v1/admin/assignments/{assignment_id}/recipients")
def recipients(assignment_id:uuid.UUID,class_id:uuid.UUID|None=None,user=Depends(admin),session:Session=Depends(db)):
 rows=session.scalars(select(Recipient).where(Recipient.assignment_id==assignment_id)).all()
 if class_id: rows=[r for r in rows if r.student.class_id==class_id]
 out=[]
 for r in rows:
  sub=session.scalar(select(Submission).where(Submission.recipient_id==r.id))
  st="graded" if (sub and sub.score is not None) else ("submitted" if sub else ("locked" if datetime.now(timezone.utc)>=r.assignment.deadline else "pending"))
  out.append({"recipient_id":str(r.id),"student_id":str(r.student.id),"student_code":r.student.student_id,"full_name":r.student.full_name,"student":serialize_user(r.student),"submission_id":str(sub.id) if sub else None,"status":st,"score":sub.score if sub else None,"feedback":sub.feedback if sub else None,"graded_at":sub.graded_at if sub else None,"max_score":r.assignment.max_score,"submitted_at":sub.submitted_at if sub else None,"comment":sub.comment if sub else None,"files":[{"id":str(f.id),"name":f.original_name} for f in session.scalars(select(StoredFile).where(StoredFile.recipient_id==r.id)).all()]})
 return out
@app.post("/api/v1/admin/submissions/{submission_id}/grade")
def grade_submission(submission_id:uuid.UUID,data:GradeIn,user=Depends(admin),session:Session=Depends(db)):
 sub=session.get(Submission,submission_id)
 if not sub: err(404,"Topshiriq topilmadi")
 max_s=sub.recipient.assignment.max_score or 100
 if data.score>max_s: err(422,f"Baho ko‘pi bilan {max_s} bo‘lishi kerak")
 sub.score=data.score
 sub.feedback=data.feedback.strip() if data.feedback else None
 sub.graded_at=datetime.now(timezone.utc)
 session.commit()
 return {"message":"Baho saqlandi","score":sub.score,"feedback":sub.feedback}
@app.post("/api/v1/admin/assignments/{assignment_id}/publish-results")
def toggle_publish(assignment_id:uuid.UUID,user=Depends(admin),session:Session=Depends(db)):
 a=session.get(Assignment,assignment_id)
 if not a: err(404,"Vazifa topilmadi")
 a.results_published=not a.results_published
 session.commit()
 return {"results_published":a.results_published,"message":"Natijalar e‘lon qilindi" if a.results_published else "Natijalar yashirildi"}
@app.get("/api/v1/dashboard/results")
def dashboard_results(class_id:uuid.UUID|None=None,session:Session=Depends(db)):
 q=select(Assignment).where(Assignment.results_published==True).order_by(Assignment.created_at.desc())
 assignments=session.scalars(q).all()
 results=[]
 for a in assignments:
  recs=session.scalars(select(Recipient).where(Recipient.assignment_id==a.id)).all()
  if class_id: recs=[r for r in recs if r.student.class_id==class_id]
  students_list=[]
  for r in recs:
   sub=session.scalar(select(Submission).where(Submission.recipient_id==r.id))
   students_list.append({"student_name":r.student.full_name,"student_id":r.student.student_id,"class_name":r.student.classroom.name if r.student.classroom else "—","score":sub.score if sub else None,"feedback":sub.feedback if sub else None,"submitted":bool(sub),"submitted_at":sub.submitted_at if sub else None,"graded_at":sub.graded_at if sub else None})
  students_list.sort(key=lambda x:(x["score"] is not None, x["score"] if x["score"] is not None else -1),reverse=True)
  scored=[s["score"] for s in students_list if s["score"] is not None]
  avg=round(sum(scored)/len(scored),1) if scored else 0
  results.append({"assignment_id":str(a.id),"title":a.title,"subject":a.subject.name,"max_score":a.max_score,"deadline":a.deadline,"average_score":avg,"total_students":len(students_list),"graded_count":len(scored), "students":students_list})
 return results

