"""longer log action

Revision ID: e1c7f1e6abca
Revises: 1c690da23a8d
Create Date: 2024-12-13 20:51:43.649330

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e1c7f1e6abca'
down_revision: Union[str, None] = '1c690da23a8d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Modify action column length to 200
    op.alter_column('logs', 'action', type_=sa.String(200), existing_type=sa.String(50))


def downgrade() -> None:
    # Revert action column length to 50
    op.alter_column('logs', 'action', type_=sa.String(50), existing_type=sa.String(200))
