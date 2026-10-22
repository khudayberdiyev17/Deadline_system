"""add class_id to assignments

Revision ID: 0004
Revises: 0003
Create Date: 2026-10-20
"""
from alembic import op
import sqlalchemy as sa

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None

def upgrade():
    op.add_column("assignments", sa.Column("class_id", sa.Uuid(), sa.ForeignKey("classes.id"), nullable=True))
    # Populate existing assignments with class_id from their student recipients
    op.execute("""
        UPDATE assignments 
        SET class_id = (
            SELECT users.class_id 
            FROM recipients 
            JOIN users ON recipients.student_id = users.id 
            WHERE recipients.assignment_id = assignments.id 
            LIMIT 1
        )
        WHERE class_id IS NULL;
    """)

def downgrade():
    op.drop_column("assignments", "class_id")
