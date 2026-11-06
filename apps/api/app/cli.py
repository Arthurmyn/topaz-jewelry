"""Management commands: python -m app.cli <command>."""

import argparse
import asyncio
import json
import sys
from getpass import getpass
from pathlib import Path

from sqlalchemy import select

from app.core.db import get_sessionmaker
from app.main import app
from app.modules.auth.models import User
from app.modules.auth.service import create_user


async def _create_admin(email: str, password: str) -> None:
    async with get_sessionmaker()() as db:
        if await db.scalar(select(User).where(User.email == email)):
            print(f"User {email} already exists")  # noqa: T201
            return
        await create_user(db, email=email, password=password, role="admin")
        await db.commit()
        print(f"Admin {email} created")  # noqa: T201


def main() -> None:
    parser = argparse.ArgumentParser(prog="app.cli")
    sub = parser.add_subparsers(dest="cmd", required=True)
    p_admin = sub.add_parser("create-admin")
    p_admin.add_argument("email")
    p_admin.add_argument("--password", help="If omitted, you are prompted")
    sub.add_parser("seed", help="Load sample data (skipped if the catalog is not empty)")
    p_spec = sub.add_parser("export-openapi")
    p_spec.add_argument("--out", default="openapi.json")
    args = parser.parse_args()

    if args.cmd == "create-admin":
        password = args.password or getpass("Password: ")
        if len(password) < 10:
            sys.exit("Password must be at least 10 characters")
        asyncio.run(_create_admin(args.email, password))
    elif args.cmd == "seed":
        from app.seed.run import run_seed

        asyncio.run(run_seed())
    elif args.cmd == "export-openapi":
        Path(args.out).write_text(json.dumps(app.openapi(), indent=2, ensure_ascii=False) + "\n")
        print(f"Wrote {args.out}")  # noqa: T201


if __name__ == "__main__":
    main()
