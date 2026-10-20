import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, UniqueConstraint, Integer
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid
class Base(DeclarativeBase): pass
def uid(): return uuid.uuid4()
def now(): return datetime.now(timezone.utc)
class ClassRoom(Base):
    __tablename__="classes"
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uid)
    name: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
class User(Base):
    __tablename__="users"
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uid)
    full_name: Mapped[str] = mapped_column(String(180))
    username: Mapped[str|None] = mapped_column(String(80), unique=True, nullable=True)
    student_id: Mapped[str|None] = mapped_column(String(10), unique=True, index=True, nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(15), default="student")
    class_id: Mapped[uuid.UUID|None] = mapped_column(Uuid, ForeignKey("classes.id"), nullable=True, index=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    classroom = relationship("ClassRoom")
class StudentSequence(Base):
    __tablename__="student_sequence"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    value: Mapped[int] = mapped_column(Integer, default=0)
class Subject(Base):
    __tablename__="subjects"
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uid)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
class Assignment(Base):
    __tablename__="assignments"
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uid)
    subject_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("subjects.id"))
    title: Mapped[str] = mapped_column(String(180))
    description: Mapped[str] = mapped_column(Text)
    notes: Mapped[str|None] = mapped_column(Text, nullable=True)
    deadline: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    creator_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    subject = relationship("Subject")
class Recipient(Base):
    __tablename__="recipients"
    __table_args__=(UniqueConstraint("assignment_id","student_id"),)
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uid)
    assignment_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("assignments.id"))
    student_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id"))
    assignment = relationship("Assignment")
    student = relationship("User")
class StoredFile(Base):
    __tablename__="stored_files"
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uid)
    assignment_id: Mapped[uuid.UUID|None] = mapped_column(Uuid, ForeignKey("assignments.id"), nullable=True)
    recipient_id: Mapped[uuid.UUID|None] = mapped_column(Uuid, ForeignKey("recipients.id"), nullable=True)
    original_name: Mapped[str] = mapped_column(String(255))
    storage_key: Mapped[str] = mapped_column(String(100), unique=True)
    mime_type: Mapped[str] = mapped_column(String(100))
    size: Mapped[int] = mapped_column(Integer)
    recipient = relationship("Recipient")
class Submission(Base):
    __tablename__="submissions"
    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uid)
    recipient_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("recipients.id"), unique=True)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    comment: Mapped[str|None] = mapped_column(Text, nullable=True)
    recipient = relationship("Recipient")

