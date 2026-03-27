from fastapi import APIRouter, HTTPException
from app.models.schemas import ProjectRequest, ProjectResponse
from app.services.project_service import create_project, get_available_templates, get_languages_info

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.post("/", response_model=ProjectResponse)
async def new_project(request: ProjectRequest):
    try:
        result = create_project(request.name, request.template, request.language, request.description)
        return ProjectResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/templates")
async def list_templates():
    return get_available_templates()


@router.get("/languages")
async def list_languages():
    return get_languages_info()
