"""S3-compatible object storage (MinIO locally).

Sync boto3: call via asyncio.to_thread in async handlers.
"""

from functools import lru_cache
from typing import Any

import boto3
from botocore.config import Config

from app.core.config import get_settings


@lru_cache
def _client() -> Any:
    s = get_settings()
    return boto3.client(
        "s3",
        endpoint_url=s.s3_endpoint_url,
        aws_access_key_id=s.s3_access_key,
        aws_secret_access_key=s.s3_secret_key,
        config=Config(signature_version="s3v4"),
        region_name="us-east-1",
    )


def put_object(key: str, data: bytes, content_type: str) -> None:
    _client().put_object(
        Bucket=get_settings().s3_bucket,
        Key=key,
        Body=data,
        ContentType=content_type,
        CacheControl="public, max-age=31536000, immutable",
    )
