from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chat, files, execute, projects

app = FastAPI(
    title="DevAssist AI - AI Coding Assistant",
    description="An AI-powered coding assistant that can generate code, create projects, and execute code in multiple languages.",
    version="1.0.0",
)

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(chat.router)
app.include_router(files.router)
app.include_router(execute.router)
app.include_router(projects.router)


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.get("/")
async def root():
    return {
        "name": "DevAssist AI",
        "version": "1.0.0",
        "description": "AI-powered coding assistant",
        "endpoints": {
            "chat": "/api/chat/",
            "files": "/api/files/",
            "execute": "/api/execute/",
            "projects": "/api/projects/",
            "languages": "/api/projects/languages",
            "templates": "/api/projects/templates",
        }
    }
