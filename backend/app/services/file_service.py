import os
import shutil
from pathlib import Path

WORKSPACE_DIR = Path("/tmp/ai-coder-workspace")
WORKSPACE_DIR.mkdir(parents=True, exist_ok=True)

LANGUAGE_MAP = {
    ".py": "python",
    ".js": "javascript",
    ".ts": "typescript",
    ".tsx": "typescriptreact",
    ".jsx": "javascriptreact",
    ".go": "go",
    ".rs": "rust",
    ".java": "java",
    ".cpp": "cpp",
    ".c": "c",
    ".cs": "csharp",
    ".rb": "ruby",
    ".php": "php",
    ".swift": "swift",
    ".kt": "kotlin",
    ".dart": "dart",
    ".html": "html",
    ".css": "css",
    ".scss": "scss",
    ".json": "json",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".md": "markdown",
    ".sql": "sql",
    ".sh": "shell",
    ".bash": "shell",
    ".xml": "xml",
    ".toml": "toml",
    ".ini": "ini",
    ".env": "dotenv",
    ".dockerfile": "dockerfile",
    ".r": "r",
}


def get_language(file_path: str) -> str:
    ext = Path(file_path).suffix.lower()
    name = Path(file_path).name.lower()
    if name == "dockerfile":
        return "dockerfile"
    if name == "makefile":
        return "makefile"
    return LANGUAGE_MAP.get(ext, "text")


def get_safe_path(path: str) -> Path:
    safe = WORKSPACE_DIR / path.lstrip("/")
    resolved = safe.resolve()
    if not str(resolved).startswith(str(WORKSPACE_DIR.resolve())):
        raise ValueError("Path traversal detected")
    return resolved


def list_files(directory: str = "") -> list[dict]:
    target = get_safe_path(directory)
    if not target.exists():
        return []

    items = []
    for item in sorted(target.iterdir()):
        rel_path = str(item.relative_to(WORKSPACE_DIR))
        if item.is_dir():
            items.append({
                "name": item.name,
                "path": rel_path,
                "type": "directory",
                "children": []
            })
        else:
            items.append({
                "name": item.name,
                "path": rel_path,
                "type": "file",
                "language": get_language(item.name),
                "size": item.stat().st_size
            })
    return items


def read_file(path: str) -> dict:
    file_path = get_safe_path(path)
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {path}")
    content = file_path.read_text(encoding="utf-8", errors="replace")
    return {
        "path": path,
        "content": content,
        "language": get_language(path)
    }


def write_file(path: str, content: str) -> dict:
    file_path = get_safe_path(path)
    file_path.parent.mkdir(parents=True, exist_ok=True)
    file_path.write_text(content, encoding="utf-8")
    return {
        "path": path,
        "content": content,
        "language": get_language(path)
    }


def delete_file(path: str) -> dict:
    file_path = get_safe_path(path)
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {path}")
    if file_path.is_dir():
        shutil.rmtree(file_path)
    else:
        file_path.unlink()
    return {"path": path, "deleted": True}


def create_directory(path: str) -> dict:
    dir_path = get_safe_path(path)
    dir_path.mkdir(parents=True, exist_ok=True)
    return {"path": path, "created": True}


def list_files_recursive(directory: str = "") -> list[dict]:
    target = get_safe_path(directory)
    if not target.exists():
        return []

    items = []
    for item in sorted(target.rglob("*")):
        if item.is_file():
            rel_path = str(item.relative_to(WORKSPACE_DIR))
            items.append({
                "name": item.name,
                "path": rel_path,
                "type": "file",
                "language": get_language(item.name),
                "size": item.stat().st_size
            })
    return items
