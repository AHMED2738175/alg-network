from fastapi import APIRouter, HTTPException
from app.models.schemas import ExecuteRequest, ExecuteResponse
from app.services.executor_service import execute_code, get_supported_languages

router = APIRouter(prefix="/api/execute", tags=["execute"])


@router.post("/", response_model=ExecuteResponse)
async def run_code(request: ExecuteRequest):
    try:
        result = await execute_code(request.code, request.language, request.timeout)
        return ExecuteResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/languages")
async def supported_languages():
    return {"languages": get_supported_languages()}
