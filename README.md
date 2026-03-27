# DevAssist AI - AI Coding Assistant

An AI-powered coding assistant similar to Devin AI that can generate code, create projects, execute code, and manage files across multiple programming languages.

## Features

- **AI Chat Interface** - Interactive chat with AI for code generation, debugging, and explanations
- **Multi-Language Support** - Python, JavaScript, TypeScript, Go, Rust, Java, C++, Ruby, PHP, and more
- **Project Scaffolding** - Create complete projects from templates (FastAPI, Express, React, Go API, Rust CLI, etc.)
- **Code Execution** - Run code directly in the browser with real-time output
- **File Management** - Create, edit, delete, and browse project files
- **Code Editor** - Syntax-highlighted code viewer with editing capabilities
- **Terminal Panel** - Execute code in multiple languages with output display

## Architecture

### Backend (FastAPI + Python)
- `backend/app/main.py` - FastAPI application with CORS
- `backend/app/routers/` - API routes (chat, files, execute, projects)
- `backend/app/services/` - Business logic (AI, file management, code execution, project scaffolding)
- `backend/app/models/` - Pydantic schemas

### Frontend (React + TypeScript + Tailwind CSS)
- `frontend/src/App.tsx` - Main application layout
- `frontend/src/components/` - UI components (ChatMessage, ChatInput, Sidebar, TerminalPanel, CodeViewer, ProjectCreator)
- `frontend/src/services/` - API client
- `frontend/src/types/` - TypeScript type definitions

## Setup Instructions

### Prerequisites
- Python 3.12+
- Node.js 18+
- Poetry (Python package manager)

### Backend Setup
```bash
cd backend
poetry install
# Create .env file with your OpenAI API key (optional - works with demo mode without it)
echo "OPENAI_API_KEY=your-key-here" > .env
poetry run fastapi dev app/main.py --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

Access the app at `http://localhost:5173`

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/chat/` | POST | Send messages to AI assistant |
| `/api/files/` | GET | List files in workspace |
| `/api/files/read` | GET | Read file content |
| `/api/files/write` | POST | Create/update a file |
| `/api/execute/` | POST | Execute code |
| `/api/projects/` | POST | Create a new project from template |
| `/api/projects/templates` | GET | List available templates |
| `/api/projects/languages` | GET | List supported languages |

## Supported Languages & Templates

| Language | Templates |
|---|---|
| Python | FastAPI, Flask, Script |
| JavaScript | Express, Vanilla |
| TypeScript | React, Node |
| Go | API, CLI |
| Rust | CLI |
| Java | App |

## License

MIT
