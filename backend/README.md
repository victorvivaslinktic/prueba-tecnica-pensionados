# Backend – Parte 2 (Python Lambda + S3 + DynamoDB)

Lambda en **Python 3.11** que maneja documentos de usuarios dentro de una VPC (supuesto) usando solo **VPC Endpoints** para S3 y DynamoDB (no se despliega; se valida con **moto** + **pytest**).

## Endpoints (simulados)

- **POST `/documents`**  
  Body (JSON):
  ```json
  { "user_id": "123", "document_type": "cedula", "file_base64": "<...>" }
  ```
  Comportamiento:
  - Valida payload (400 si inválido).
  - Decodifica `file_base64`.
  - Guarda PDF en S3: `s3://$BUCKET_NAME/{user_id}/{YYYY-MM-DD}_{document_type}.pdf`
  - Persiste metadata en DynamoDB (tabla `$TABLE_NAME`) con esquema:
    - `pk = "{user_id}#{document_type}"` (Partition key)
    - `uploaded_at` (Sort key, ISO-8601)
    - Atributos: `user_id`, `document_type`, `s3_key`, `uploaded_at`

- **GET `/documents/{user_id}/{document_type}`**  
  - Busca en DynamoDB el **último** documento (`Query` por `pk`, `ScanIndexForward=False`, `Limit=1`).  
  - Si existe, trae el archivo de S3 y lo retorna en `file_base64`.  
  - Si no existe → 404.

## Estructura

```
/backend
  ├─ lambdas/
  │  └─ lambda_function.py
  ├─ tests/
  │  └─ test_handler.py
  └─ requirements.txt
```

## Requisitos

- Python 3.11
- pip

## Instalación (local)

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

## Ejecutar pruebas

```bash
pytest -q
```

Las pruebas usan **moto** para mockear S3 y DynamoDB. No requiere AWS real.

## Variables de entorno (para runtime)

- `BUCKET_NAME` (por defecto: `user-documents-mock`)
- `TABLE_NAME` (por defecto: `user_documents`)

> En los tests, se crean el bucket y la tabla con esos nombres.

## Notas sobre VPC Endpoints (conceptual)

En un despliegue real dentro de una VPC **sin NAT Gateway**, la Lambda debería acceder a S3 y DynamoDB mediante **VPC Endpoints** (Gateway para S3 y Interface para DynamoDB), ajustando políticas para restringir acceso a los recursos requeridos. Este repo **no despliega**, solo simula con mocks.

## Licencia

MIT
