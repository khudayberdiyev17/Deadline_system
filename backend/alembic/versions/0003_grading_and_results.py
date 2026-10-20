"""add grading and published results

Revision ID: 0003
Revises: 0002
Create Date: 2026-10-20
"""
from alembic import op
import sqlalchemy as sa

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None

def upgrade():
    op.add_column("assignments", sa.Column("max_score", sa.Integer(), nullable=False, server_default="100"))
    op.add_column("assignments", sa.Column("results_published", sa.Boolean(), nullable=False, server_default="false"))
    op.add_column("submissions", sa.Column("score", sa.Integer(), nullable=True))
    op.add_column("submissions", sa.Column("feedback", sa.Text(), nullable=True))
    op.add_column("submissions", sa.Column("graded_at", sa.DateTime(timezone=True), nullable=True))

def downgrade():
    op.drop_column("submissions", "graded_at")
    op.drop_column("submissions", "feedback")
    op.drop_column("submissions", "score")
    op.drop_column("assignments", "results_published")
    op.drop_column("assignments", "max_score")
