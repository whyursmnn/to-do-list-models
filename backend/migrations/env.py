# migrations/env.py

# Import yang diperlukan
import os
import sys
from pathlib import Path
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Ini adalah bagian PENTING untuk mengatur Python Path agar Alembic dapat menemukan modul 'app'
# Asumsi: Anda menjalankan alembic dari direktori 'backend/'
project_root = Path(__file__).parent.parent # Ini akan mengarah ke direktori 'backend'
sys.path.insert(0, str(project_root)) # Tambahkan 'backend' ke Python path

# =====================================================================
# BARIS KRUSIAL: Impor Base dan semua model Anda di sini
# =====================================================================
from app.core.database import Base # Impor Base dari database.py Anda
# Impor semua model Anda agar Base.metadata 'melihat' mereka
from app.models import (
    user,
    kategori,
    tugas,
    penugasan_tugas,
    komentar_tugas,
    lampiran_tugas,
    riwayat_status_tugas,
    log_autentikasi,
)
# =====================================================================


# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python's standard logging.
# This ensures that loggers are configured correctly
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import Base
# target_metadata = Base.metadata
# =====================================================================
# BARIS KRUSIAL: Setel target_metadata ke Base.metadata
# =====================================================================
target_metadata = Base.metadata


# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an actual DBAPI connection.

    By skipping the connection the environment can be loaded
    without ever connecting to a database.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario, we need to create an Engine
    and associate a connection with the context.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_as_batch=True # Penting untuk MySQL saat ALTER tabel
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()