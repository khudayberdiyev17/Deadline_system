"""track mandatory password changes after an administrator reset

Revision ID: 0005
Revises: 0004
Create Date: 2026-10-20
"""
from alembic import op
import sqlalchemy as sa

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None

def upgrade():
    conn = op.get_bind()
    insp = sa.inspect(conn)
    u_cols = [c["name"] for c in insp.get_columns("users")]
    if "must_change_password" not in u_cols:
        op.add_column("users", sa.Column("must_change_password", sa.Boolean(), nullable=False, server_default="false"))

def downgrade():
    op.drop_column("users", "must_change_password")
