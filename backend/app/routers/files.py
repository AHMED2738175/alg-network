from fastapi import APIRouter, HTTPException
from app.models.schemas import FileRequest, FileResponse
from app.services.file_service import (
    list_files,
    read_file,
    write_file,
    delete_file,
    create_directory,
    list_files_recursive,
)

router = APIRouter(prefix="/api/files", tags=["files"])


@router.get("/")
async def get_files(directory: str = ""):
    try:
        return list_files(directory)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tree")
async def get_file_tree(directory: str = ""):
    try:
        return list_files_recursive(directory)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/read")
async def get_file(path: str):
    try:
        return read_file(path)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/write")
async def save_file(request: FileRequest):
    try:
        return write_file(request.path, request.content or "")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/")
async def remove_file(path: str):
    try:
        return delete_file(path)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/directory")
async def make_directory(request: FileRequest):
    try:
        return create_directory(request.path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
