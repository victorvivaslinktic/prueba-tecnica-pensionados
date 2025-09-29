import os
import json
import base64
import boto3
import botocore
from datetime import datetime, timezone
import logging
from typing import Any, Dict

logger = logging.getLogger()
logger.setLevel(logging.INFO)

S3_BUCKET = os.environ.get("BUCKET_NAME", "user-documents-mock")
DDB_TABLE = os.environ.get("TABLE_NAME", "user_documents")

def _region() -> str:
    return os.environ.get("AWS_REGION") or os.environ.get("AWS_DEFAULT_REGION") or "us-east-1"

def _s3():
    return boto3.client("s3", region_name=_region())

def _ddb():
    return boto3.resource("dynamodb", region_name=_region())

def _response(status: int, body: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body),
    }

def validate_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(payload, dict):
        raise ValueError("Payload must be a JSON object")
    required = ["user_id", "document_type", "file_base64"]
    for k in required:
        if k not in payload or not isinstance(payload[k], str) or not payload[k].strip():
            raise ValueError(f"Missing or invalid field: {k}")
    if not payload["document_type"].isalpha():
        raise ValueError("document_type must be alphabetic (e.g., 'cedula')")
    return payload

def handle_post(event):
    try:
        body_raw = event.get("body")
        if body_raw is None:
            return _response(400, {"error": "Missing body"})
        if event.get("isBase64Encoded"):
            body_raw = base64.b64decode(body_raw).decode("utf-8")
        payload = json.loads(body_raw)
        payload = validate_payload(payload)
    except (json.JSONDecodeError, ValueError) as e:
        return _response(400, {"error": "Invalid payload", "details": str(e)})

    user_id = payload["user_id"]
    doc_type = payload["document_type"]
    file_b64 = payload["file_base64"]

    try:
        file_bytes = base64.b64decode(file_b64, validate=True)
    except Exception as e:
        return _response(400, {"error": "Invalid base64 file", "details": str(e)})

    now = datetime.now(timezone.utc)
    date_stamp = now.strftime("%Y-%m-%d")
    uploaded_at = now.isoformat().replace("+00:00", "Z")
    s3_key = f"{user_id}/{date_stamp}_{doc_type}.pdf"

    try:
        _s3().put_object(Bucket=S3_BUCKET, Key=s3_key, Body=file_bytes, ContentType="application/pdf")
        table = _ddb().Table(DDB_TABLE)
        table.put_item(
            Item={
                "pk": f"{user_id}#{doc_type}",
                "uploaded_at": uploaded_at,
                "user_id": user_id,
                "document_type": doc_type,
                "s3_key": s3_key,
            }
        )
    except botocore.exceptions.BotoCoreError:
        logger.exception("AWS error while saving document")
        return _response(500, {"error": "Internal error saving document"})
    except Exception:
        logger.exception("Unexpected error while saving document")
        return _response(500, {"error": "Internal error saving document"})

    return _response(200, {
        "user_id": user_id,
        "document_type": doc_type,
        "s3_key": s3_key,
        "uploaded_at": uploaded_at,
    })

def handle_get(event):
    path_params = (event.get("pathParameters") or {})
    user_id = path_params.get("user_id")
    doc_type = path_params.get("document_type")
    if not user_id or not doc_type:
        return _response(400, {"error": "Missing path parameters: user_id and document_type"})

    try:
        table = _ddb().Table(DDB_TABLE)
        from boto3.dynamodb.conditions import Key
        resp = table.query(
            KeyConditionExpression=Key("pk").eq(f"{user_id}#{doc_type}"),
            ScanIndexForward=False,
            Limit=1,
        )
        items = resp.get("Items", [])
        if not items:
            return _response(404, {"error": "Document not found"})
        item = items[0]
        s3_key = item["s3_key"]

        s3_obj = _s3().get_object(Bucket=S3_BUCKET, Key=s3_key)
        data = s3_obj["Body"].read()
        b64 = base64.b64encode(data).decode("utf-8")
        return _response(200, {
            "user_id": item["user_id"],
            "document_type": item["document_type"],
            "s3_key": s3_key,
            "uploaded_at": item["uploaded_at"],
            "file_base64": b64,
        })
    except botocore.exceptions.ClientError as e:
        if e.response.get("Error", {}).get("Code") == "NoSuchKey":
            return _response(404, {"error": "Document file not found in storage"})
        logger.exception("AWS client error while retrieving document")
        return _response(500, {"error": "Internal error retrieving document"})
    except botocore.exceptions.BotoCoreError:
        logger.exception("AWS error while retrieving document")
        return _response(500, {"error": "Internal error retrieving document"})
    except Exception:
        logger.exception("Unexpected error while retrieving document")
        return _response(500, {"error": "Internal error retrieving document"})

def lambda_handler(event, context):
    method = (event.get("httpMethod") or event.get("requestContext", {}).get("http", {}).get("method", "")).upper()
    path = event.get("path") or event.get("rawPath") or ""
    if method == "POST" and (path.endswith("/documents") or path == "/documents"):
        return handle_post(event)
    if method == "GET" and "/documents/" in path:
        return handle_get(event)
    return _response(404, {"error": "Not found"})
