from pydantic import BaseModel
from typing import Optional


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    language: Optional[str] = None
    context: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    code_blocks: list[dict] = []


class FileRequest(BaseModel):
    path: str
    content: Optional[str] = None


class FileResponse(BaseModel):
    path: str
    content: str
    language: str


class ExecuteRequest(BaseModel):
    code: str
    language: str
    timeout: int = 30


class ExecuteResponse(BaseModel):
    stdout: str
    stderr: str
    exit_code: int
    execution_time: float


class ProjectRequest(BaseModel):
    name: str
    template: str
    language: str
    description: Optional[str] = ""


class ProjectResponse(BaseModel):
    name: str
    path: str
    files: list[str]
    message: str


class LanguageInfo(BaseModel):
    name: str
    extensions: list[str]
    icon: str
    templates: list[str]
