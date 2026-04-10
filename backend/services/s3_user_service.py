"""
S3-backed user store.

Each user is stored as a JSON object at:
  s3://{S3_USERS_BUCKET}/users/{normalized_email}.json

Object schema:
  {
    "id":              str (UUID),
    "name":            str,
    "email":           str (lowercase),
    "hashed_password": str,
    "created_at":      str (ISO-8601)
  }
"""
import os
import json
import uuid
import logging
from datetime import datetime, timezone

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

_s3 = None


def _client():
    global _s3
    if _s3 is None:
        _s3 = boto3.client(
            "s3",
            region_name=os.getenv("AWS_REGION", "us-east-1"),
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        )
    return _s3


def _bucket() -> str:
    bucket = os.getenv("S3_USERS_BUCKET")
    if not bucket:
        raise RuntimeError("S3_USERS_BUCKET environment variable not set")
    return bucket


def _key(email: str) -> str:
    return f"users/{email.lower()}.json"


def get_user_by_email(email: str) -> dict | None:
    """Return the user dict or None if not found."""
    try:
        resp = _client().get_object(Bucket=_bucket(), Key=_key(email))
        return json.loads(resp["Body"].read())
    except ClientError as e:
        if e.response["Error"]["Code"] in ("NoSuchKey", "404"):
            return None
        raise


def create_user(name: str, email: str, hashed_password: str) -> dict:
    """
    Write a new user to S3 and return the user dict.
    Raises ValueError if the email is already taken.
    """
    email = email.lower()
    if get_user_by_email(email) is not None:
        raise ValueError("Email already registered")

    user = {
        "id": str(uuid.uuid4()),
        "name": name.strip(),
        "email": email,
        "hashed_password": hashed_password,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    _client().put_object(
        Bucket=_bucket(),
        Key=_key(email),
        Body=json.dumps(user),
        ContentType="application/json",
    )
    logger.info("Created user: %s", email)
    return user
