import os
import json
import base64
import boto3
import pytest
from moto import mock_aws
from lambdas.lambda_function import lambda_handler

BUCKET = "user-documents-mock"
TABLE = "user_documents"

def _make_post_event(payload: dict):
    return {
        "httpMethod": "POST",
        "path": "/documents",
        "body": json.dumps(payload),
        "isBase64Encoded": False,
    }

def _make_get_event(user_id: str, doc_type: str):
    return {
        "httpMethod": "GET",
        "path": f"/documents/{user_id}/{doc_type}",
        "pathParameters": {"user_id": user_id, "document_type": doc_type},
    }

@mock_aws
def setup_env():
    os.environ["BUCKET_NAME"] = BUCKET
    os.environ["TABLE_NAME"] = TABLE
    s3 = boto3.client("s3", region_name="us-east-1")
    s3.create_bucket(Bucket=BUCKET)

    ddb = boto3.client("dynamodb", region_name="us-east-1")
    ddb.create_table(
        TableName=TABLE,
        KeySchema=[
            {"AttributeName": "pk", "KeyType": "HASH"},
            {"AttributeName": "uploaded_at", "KeyType": "RANGE"},
        ],
        AttributeDefinitions=[
            {"AttributeName": "pk", "AttributeType": "S"},
            {"AttributeName": "uploaded_at", "AttributeType": "S"},
        ],
        BillingMode="PAY_PER_REQUEST",
    )

def test_upload_valid(monkeypatch):
    with mock_aws():
        setup_env()
        pdf_bytes = b"%PDF-1.4\n% Test"
        payload = {
            "user_id": "123",
            "document_type": "cedula",
            "file_base64": base64.b64encode(pdf_bytes).decode("utf-8"),
        }
        event = _make_post_event(payload)
        resp = lambda_handler(event, None)
        assert resp["statusCode"] == 200
        body = json.loads(resp["body"])
        assert body["user_id"] == "123"
        assert body["document_type"] == "cedula"
        assert body["s3_key"].startswith("123/")
        assert body["s3_key"].endswith("_cedula.pdf")

def test_upload_invalid_payload():
    with mock_aws():
        setup_env()
        # Missing document_type
        payload = {"user_id": "123", "file_base64": base64.b64encode(b"abc").decode("utf-8")}
        event = _make_post_event(payload)
        resp = lambda_handler(event, None)
        assert resp["statusCode"] == 400

def test_upload_aws_failure_s3():
    with mock_aws():
        # No bucket created → S3 put_object should fail
        os.environ["BUCKET_NAME"] = BUCKET
        os.environ["TABLE_NAME"] = TABLE
        ddb = boto3.client("dynamodb", region_name="us-east-1")
        ddb.create_table(
            TableName=TABLE,
            KeySchema=[
                {"AttributeName": "pk", "KeyType": "HASH"},
                {"AttributeName": "uploaded_at", "KeyType": "RANGE"},
            ],
            AttributeDefinitions=[
                {"AttributeName": "pk", "AttributeType": "S"},
                {"AttributeName": "uploaded_at", "AttributeType": "S"},
            ],
            BillingMode="PAY_PER_REQUEST",
        )
        payload = {
            "user_id": "123",
            "document_type": "cedula",
            "file_base64": base64.b64encode(b"%PDF%").decode("utf-8"),
        }
        event = _make_post_event(payload)
        resp = lambda_handler(event, None)
        assert resp["statusCode"] == 500

def test_get_existing_document_roundtrip():
    with mock_aws():
        setup_env()
        # First upload
        pdf_bytes = b"%PDF-1.4\n% Test Roundtrip"
        payload = {
            "user_id": "123",
            "document_type": "cedula",
            "file_base64": base64.b64encode(pdf_bytes).decode("utf-8"),
        }
        resp_up = lambda_handler(_make_post_event(payload), None)
        assert resp_up["statusCode"] == 200

        # Then get latest
        resp_get = lambda_handler(_make_get_event("123", "cedula"), None)
        assert resp_get["statusCode"] == 200
        body = json.loads(resp_get["body"])
        assert body["user_id"] == "123"
        assert body["document_type"] == "cedula"
        got_bytes = base64.b64decode(body["file_base64"])
        assert got_bytes == pdf_bytes

def test_get_nonexistent_document():
    with mock_aws():
        setup_env()
        resp_get = lambda_handler(_make_get_event("999", "cedula"), None)
        assert resp_get["statusCode"] == 404
