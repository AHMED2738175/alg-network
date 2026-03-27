from pathlib import Path
from app.services.file_service import WORKSPACE_DIR, get_safe_path

TEMPLATES = {
    "python": {
        "fastapi": {
            "files": {
                "main.py": '''from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="{name}", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {{"message": "Welcome to {name}"}}

@app.get("/healthz")
async def healthz():
    return {{"status": "ok"}}
''',
                "requirements.txt": "fastapi[standard]>=0.100.0\nuvicorn>=0.23.0\npydantic>=2.0.0\n",
                "README.md": "# {name}\n\n{description}\n\n## Setup\n```bash\npip install -r requirements.txt\nuvicorn main:app --reload\n```\n",
            }
        },
        "flask": {
            "files": {
                "app.py": '''from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return jsonify({{"message": "Welcome to {name}"}})

if __name__ == "__main__":
    app.run(debug=True)
''',
                "requirements.txt": "flask>=3.0.0\n",
                "README.md": "# {name}\n\n{description}\n\n## Setup\n```bash\npip install -r requirements.txt\npython app.py\n```\n",
            }
        },
        "script": {
            "files": {
                "main.py": '''"""
{name} - {description}
"""

def main():
    print("Hello from {name}!")

if __name__ == "__main__":
    main()
''',
                "requirements.txt": "",
                "README.md": "# {name}\n\n{description}\n\n## Run\n```bash\npython main.py\n```\n",
            }
        },
    },
    "javascript": {
        "express": {
            "files": {
                "index.js": '''const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {{
  res.json({{ message: 'Welcome to {name}' }});
}});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {{
  console.log(`Server running on port ${{PORT}}`);
}});
''',
                "package.json": '''{{"name": "{name}", "version": "1.0.0", "description": "{description}", "main": "index.js", "scripts": {{"start": "node index.js", "dev": "nodemon index.js"}}, "dependencies": {{"express": "^4.18.0", "cors": "^2.8.5"}}, "devDependencies": {{"nodemon": "^3.0.0"}}}}
''',
                "README.md": "# {name}\n\n{description}\n\n## Setup\n```bash\nnpm install\nnpm run dev\n```\n",
            }
        },
        "vanilla": {
            "files": {
                "index.html": '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{name}</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: system-ui, sans-serif; background: #0a0a0a; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; }}
        .container {{ text-align: center; padding: 2rem; }}
        h1 {{ font-size: 2.5rem; margin-bottom: 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
        p {{ color: #888; font-size: 1.1rem; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>{name}</h1>
        <p>{description}</p>
    </div>
    <script src="main.js"></script>
</body>
</html>
''',
                "main.js": '''console.log("Welcome to {name}!");
''',
                "README.md": "# {name}\n\n{description}\n\nOpen `index.html` in your browser.\n",
            }
        },
    },
    "typescript": {
        "react": {
            "files": {
                "src/App.tsx": '''import React from 'react';

function App() {{
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{name}</h1>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
}}

export default App;
''',
                "package.json": '''{{"name": "{name}", "version": "1.0.0", "scripts": {{"dev": "vite", "build": "vite build"}}, "dependencies": {{"react": "^18.2.0", "react-dom": "^18.2.0"}}, "devDependencies": {{"@types/react": "^18.2.0", "typescript": "^5.0.0", "vite": "^5.0.0", "@vitejs/plugin-react": "^4.0.0"}}}}
''',
                "tsconfig.json": '''{{"compilerOptions": {{"target": "ES2020", "module": "ESNext", "jsx": "react-jsx", "strict": true, "moduleResolution": "node", "esModuleInterop": true}}}}
''',
                "README.md": "# {name}\n\n{description}\n\n## Setup\n```bash\nnpm install\nnpm run dev\n```\n",
            }
        },
        "node": {
            "files": {
                "src/index.ts": '''console.log("Hello from {name}!");

interface Config {{
  name: string;
  version: string;
}}

const config: Config = {{
  name: "{name}",
  version: "1.0.0"
}};

console.log(`Running ${{config.name}} v${{config.version}}`);
''',
                "tsconfig.json": '''{{"compilerOptions": {{"target": "ES2020", "module": "commonjs", "outDir": "./dist", "strict": true, "esModuleInterop": true}}}}
''',
                "package.json": '''{{"name": "{name}", "version": "1.0.0", "description": "{description}", "scripts": {{"build": "tsc", "start": "node dist/index.js", "dev": "ts-node src/index.ts"}}}}
''',
                "README.md": "# {name}\n\n{description}\n\n## Setup\n```bash\nnpm install\nnpm run dev\n```\n",
            }
        },
    },
    "go": {
        "api": {
            "files": {
                "main.go": '''package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
)

func main() {{
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {{
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]string{{"message": "Welcome to {name}"}})
    }})

    fmt.Println("Server running on :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}}
''',
                "go.mod": "module {name}\n\ngo 1.21\n",
                "README.md": "# {name}\n\n{description}\n\n## Run\n```bash\ngo run main.go\n```\n",
            }
        },
        "cli": {
            "files": {
                "main.go": '''package main

import (
    "fmt"
    "os"
)

func main() {{
    fmt.Println("{name} - {description}")
    if len(os.Args) > 1 {{
        fmt.Printf("Arguments: %v\\n", os.Args[1:])
    }}
}}
''',
                "go.mod": "module {name}\n\ngo 1.21\n",
                "README.md": "# {name}\n\n{description}\n\n## Run\n```bash\ngo run main.go\n```\n",
            }
        },
    },
    "rust": {
        "cli": {
            "files": {
                "src/main.rs": '''fn main() {{
    println!("Welcome to {name}!");
    println!("{description}");
}}
''',
                "Cargo.toml": '''[package]
name = "{name}"
version = "0.1.0"
edition = "2021"

[dependencies]
''',
                "README.md": "# {name}\n\n{description}\n\n## Build & Run\n```bash\ncargo run\n```\n",
            }
        },
    },
    "java": {
        "app": {
            "files": {
                "src/Main.java": '''public class Main {{
    public static void main(String[] args) {{
        System.out.println("Welcome to {name}!");
        System.out.println("{description}");
    }}
}}
''',
                "README.md": "# {name}\n\n{description}\n\n## Compile & Run\n```bash\njavac src/Main.java\njava -cp src Main\n```\n",
            }
        },
    },
}


def get_available_templates() -> list[dict]:
    result = []
    for lang, templates in TEMPLATES.items():
        for template_name in templates:
            result.append({
                "language": lang,
                "template": template_name,
                "name": f"{lang}/{template_name}"
            })
    return result


def create_project(name: str, template: str, language: str, description: str = "") -> dict:
    lang_templates = TEMPLATES.get(language.lower())
    if not lang_templates:
        raise ValueError(f"Unsupported language: {language}. Available: {', '.join(TEMPLATES.keys())}")

    tmpl = lang_templates.get(template.lower())
    if not tmpl:
        raise ValueError(f"Unknown template: {template}. Available for {language}: {', '.join(lang_templates.keys())}")

    project_dir = get_safe_path(name)
    project_dir.mkdir(parents=True, exist_ok=True)

    created_files = []
    for file_path, content in tmpl["files"].items():
        full_path = project_dir / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        formatted_content = content.format(name=name, description=description or f"A {language} {template} project")
        full_path.write_text(formatted_content, encoding="utf-8")
        created_files.append(str(Path(name) / file_path))

    return {
        "name": name,
        "path": name,
        "files": created_files,
        "message": f"Project '{name}' created with {language}/{template} template ({len(created_files)} files)"
    }


def get_languages_info() -> list[dict]:
    return [
        {"name": "Python", "extensions": [".py"], "icon": "🐍", "templates": list(TEMPLATES.get("python", {}).keys())},
        {"name": "JavaScript", "extensions": [".js", ".mjs"], "icon": "📜", "templates": list(TEMPLATES.get("javascript", {}).keys())},
        {"name": "TypeScript", "extensions": [".ts", ".tsx"], "icon": "📘", "templates": list(TEMPLATES.get("typescript", {}).keys())},
        {"name": "Go", "extensions": [".go"], "icon": "🐹", "templates": list(TEMPLATES.get("go", {}).keys())},
        {"name": "Rust", "extensions": [".rs"], "icon": "🦀", "templates": list(TEMPLATES.get("rust", {}).keys())},
        {"name": "Java", "extensions": [".java"], "icon": "☕", "templates": list(TEMPLATES.get("java", {}).keys())},
        {"name": "C", "extensions": [".c", ".h"], "icon": "⚙️", "templates": []},
        {"name": "C++", "extensions": [".cpp", ".hpp"], "icon": "⚙️", "templates": []},
        {"name": "Ruby", "extensions": [".rb"], "icon": "💎", "templates": []},
        {"name": "PHP", "extensions": [".php"], "icon": "🐘", "templates": []},
        {"name": "Swift", "extensions": [".swift"], "icon": "🐦", "templates": []},
        {"name": "Kotlin", "extensions": [".kt"], "icon": "🟣", "templates": []},
        {"name": "R", "extensions": [".r", ".R"], "icon": "📊", "templates": []},
        {"name": "Shell", "extensions": [".sh", ".bash"], "icon": "🖥️", "templates": []},
        {"name": "SQL", "extensions": [".sql"], "icon": "🗃️", "templates": []},
        {"name": "HTML", "extensions": [".html"], "icon": "🌐", "templates": []},
        {"name": "CSS", "extensions": [".css", ".scss"], "icon": "🎨", "templates": []},
    ]
