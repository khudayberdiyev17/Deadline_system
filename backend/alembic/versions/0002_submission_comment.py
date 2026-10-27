"""add submission comment"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None

def upgrade():
    conn = op.get_bind()
    insp = sa.inspect(conn)
    cols = [c["name"] for c in insp.get_columns("submissions")]
    if "comment" not in cols:
        op.add_column("submissions", sa.Column("comment", sa.Text(), nullable=True))

def downgrade():
    op.drop_column("submissions", "comment")
