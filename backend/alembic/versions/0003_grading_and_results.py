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
    conn = op.get_bind()
    insp = sa.inspect(conn)
    a_cols = [c["name"] for c in insp.get_columns("assignments")]
    s_cols = [c["name"] for c in insp.get_columns("submissions")]
    if "max_score" not in a_cols:
        op.add_column("assignments", sa.Column("max_score", sa.Integer(), nullable=False, server_default="100"))
    if "results_published" not in a_cols:
        op.add_column("assignments", sa.Column("results_published", sa.Boolean(), nullable=False, server_default="false"))
    if "score" not in s_cols:
        op.add_column("submissions", sa.Column("score", sa.Integer(), nullable=True))
    if "feedback" not in s_cols:
        op.add_column("submissions", sa.Column("feedback", sa.Text(), nullable=True))
    if "graded_at" not in s_cols:
        op.add_column("submissions", sa.Column("graded_at", sa.DateTime(timezone=True), nullable=True))

def downgrade():
    op.drop_column("submissions", "graded_at")
    op.drop_column("submissions", "feedback")
    op.drop_column("submissions", "score")
    op.drop_column("assignments", "results_published")
    op.drop_column("assignments", "max_score")
