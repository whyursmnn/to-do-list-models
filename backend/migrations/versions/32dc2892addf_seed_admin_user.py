"""seed admin user

Revision ID: 32dc2892addf
Revises: cb99373eb317
Create Date: 2025-05-28 18:40:23.752923

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from sqlalchemy.sql import table, column
from sqlalchemy import String, Integer, DateTime, Boolean, Enum
from datetime import datetime
import hashlib


# revision identifiers, used by Alembic.
revision: str = '32dc2892addf'
down_revision: Union[str, None] = 'cb99373eb317'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    
    users = table(
        'users',
        column('id', Integer),
        column('username', String),
        column('hash_password', String),
        column('name', String),
        column('role', Enum("admin", "pegawai", name="role")),
        column('created_at', DateTime),
        column('updated_at', DateTime),
        column('is_deleted', Boolean)
    )

    op.bulk_insert(users, [
        {
            "id": 1,
            "username": "wahyu",
            "hash_password": hashlib.sha256("admin123".encode()).hexdigest(),  # hash simple, bisa ganti pakai bcrypt nanti
            "name": "Admin Wahyu",
            "role": "admin",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_deleted": False,
        }
    ])

def downgrade():
    op.execute("DELETE FROM users WHERE username='admin'")
