import os
import re
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """You are DevAssist AI, an expert software engineering assistant. You can:
- Write code in any programming language
- Create complete projects and applications
- Debug and fix code issues
- Explain complex concepts
- Refactor and optimize code
- Generate tests
- Create APIs, frontends, backends, databases, and more

When generating code:
1. Always provide complete, runnable code
2. Include all necessary imports and dependencies
3. Add helpful comments
4. Follow best practices for the language
5. If creating a project, provide clear file structure

Format code blocks with triple backticks and the language name, e.g.:
```python
print("Hello World")
```

Always be helpful, thorough, and provide production-quality code."""


def get_client() -> AsyncOpenAI:
    api_key = os.getenv("OPENAI_API_KEY", "")
    return AsyncOpenAI(api_key=api_key)


def extract_code_blocks(text: str) -> list[dict]:
    pattern = r"```(\w+)?\n(.*?)```"
    matches = re.findall(pattern, text, re.DOTALL)
    blocks = []
    for lang, code in matches:
        blocks.append({
            "language": lang or "text",
            "code": code.strip()
        })
    return blocks


async def chat_with_ai(messages: list[dict], language: str | None = None, context: str | None = None) -> dict:
    client = get_client()

    system_message = SYSTEM_PROMPT
    if language:
        system_message += f"\n\nThe user is currently working with {language}. Prioritize this language in your responses."
    if context:
        system_message += f"\n\nCurrent file context:\n{context}"

    formatted_messages = [{"role": "system", "content": system_message}]
    for msg in messages:
        formatted_messages.append({"role": msg["role"], "content": msg["content"]})

    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key:
        response_text = generate_demo_response(messages[-1]["content"] if messages else "")
        return {
            "response": response_text,
            "code_blocks": extract_code_blocks(response_text)
        }

    response = await client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o"),
        messages=formatted_messages,
        max_tokens=4096,
        temperature=0.7,
    )

    response_text = response.choices[0].message.content or ""
    code_blocks = extract_code_blocks(response_text)

    return {
        "response": response_text,
        "code_blocks": code_blocks
    }


def generate_demo_response(user_message: str) -> str:
    msg = user_message.lower()

    if any(word in msg for word in ["hello", "hi", "مرحبا", "سلام"]):
        return """# Welcome to DevAssist AI! 👋

I'm your AI coding assistant. I can help you with:

- **Code Generation** - Write code in any language
- **Project Creation** - Scaffold complete projects
- **Debugging** - Find and fix bugs
- **Code Review** - Improve your code quality
- **Explanations** - Understand complex concepts

Just tell me what you'd like to build! For example:
- "Create a REST API with Express.js"
- "Build a React todo app"
- "Write a Python web scraper"
- "Create a Go CLI tool"
"""

    if any(word in msg for word in ["python", "بايثون"]):
        return """Here's a Python example for you:

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import uvicorn

app = FastAPI(title="My API", version="1.0.0")

class Item(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    quantity: int = 0

items_db: dict[int, Item] = {}
counter = 0

@app.post("/items/", response_model=dict)
async def create_item(item: Item):
    global counter
    counter += 1
    items_db[counter] = item
    return {"id": counter, **item.model_dump()}

@app.get("/items/{item_id}")
async def get_item(item_id: int):
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"id": item_id, **items_db[item_id].model_dump()}

@app.get("/items/")
async def list_items():
    return [{"id": k, **v.model_dump()} for k, v in items_db.items()]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

This creates a complete REST API with FastAPI. You can run it and test with curl or a browser at `http://localhost:8000/docs`.
"""

    if any(word in msg for word in ["react", "frontend", "واجهة"]):
        return """Here's a React component example:

```typescript
import React, { useState, useEffect } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
    setInput('');
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Todo App</h1>
      <div className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && addTodo()}
          className="flex-1 border rounded px-3 py-2"
          placeholder="Add a todo..."
        />
        <button onClick={addTodo} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {todos.map(todo => (
          <li key={todo.id} className="flex items-center gap-2 p-2 border rounded">
            <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} />
            <span className={todo.completed ? 'line-through text-gray-400' : ''}>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)} className="ml-auto text-red-500">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoApp;
```

This creates a fully functional Todo app with add, toggle, and delete functionality!
"""

    if any(word in msg for word in ["javascript", "js", "node", "express"]):
        return """Here's a Node.js Express API example:

```javascript
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let tasks = [];
let nextId = 1;

// Get all tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// Create a task
app.post('/api/tasks', (req, res) => {
  const { title, description } = req.body;
  const task = { id: nextId++, title, description, status: 'pending', createdAt: new Date() };
  tasks.push(task);
  res.status(201).json(task);
});

// Update a task
app.put('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  Object.assign(task, req.body);
  res.json(task);
});

// Delete a task
app.delete('/api/tasks/:id', (req, res) => {
  tasks = tasks.filter(t => t.id !== parseInt(req.params.id));
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

Run with `node server.js` and your API will be ready at `http://localhost:3000`.
"""

    if any(word in msg for word in ["rust", "رست"]):
        return """Here's a Rust example:

```rust
use std::collections::HashMap;
use std::io;

fn main() {
    let mut inventory: HashMap<String, (f64, u32)> = HashMap::new();

    loop {
        println!("\\n=== Inventory Manager ===");
        println!("1. Add item");
        println!("2. View inventory");
        println!("3. Update quantity");
        println!("4. Remove item");
        println!("5. Exit");
        print!("Choose option: ");

        let mut choice = String::new();
        io::stdin().read_line(&mut choice).unwrap();

        match choice.trim() {
            "1" => {
                println!("Item name:");
                let mut name = String::new();
                io::stdin().read_line(&mut name).unwrap();
                println!("Price:");
                let mut price = String::new();
                io::stdin().read_line(&mut price).unwrap();
                println!("Quantity:");
                let mut qty = String::new();
                io::stdin().read_line(&mut qty).unwrap();

                inventory.insert(
                    name.trim().to_string(),
                    (price.trim().parse().unwrap_or(0.0), qty.trim().parse().unwrap_or(0))
                );
                println!("Item added!");
            }
            "2" => {
                if inventory.is_empty() {
                    println!("Inventory is empty.");
                } else {
                    println!("{:<20} {:<10} {:<10}", "Name", "Price", "Qty");
                    for (name, (price, qty)) in &inventory {
                        println!("{:<20} ${:<9.2} {:<10}", name, price, qty);
                    }
                }
            }
            "5" => break,
            _ => println!("Invalid option"),
        }
    }
}
```

Compile with `rustc main.rs` and run `./main`.
"""

    if any(word in msg for word in ["go", "golang"]):
        return """Here's a Go HTTP server example:

```go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "sync"
)

type Message struct {
    ID      int    `json:"id"`
    Author  string `json:"author"`
    Content string `json:"content"`
}

var (
    messages []Message
    mu       sync.RWMutex
    nextID   = 1
)

func getMessages(w http.ResponseWriter, r *http.Request) {
    mu.RLock()
    defer mu.RUnlock()
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(messages)
}

func createMessage(w http.ResponseWriter, r *http.Request) {
    var msg Message
    if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    mu.Lock()
    msg.ID = nextID
    nextID++
    messages = append(messages, msg)
    mu.Unlock()
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(msg)
}

func main() {
    http.HandleFunc("/api/messages", func(w http.ResponseWriter, r *http.Request) {
        switch r.Method {
        case "GET":
            getMessages(w, r)
        case "POST":
            createMessage(w, r)
        default:
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        }
    })
    fmt.Println("Server running on :8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

Run with `go run main.go`.
"""

    return """I can help you build anything! Here are some things I can do:

```python
# I can write code in any language:
languages = [
    "Python", "JavaScript", "TypeScript", "Go", "Rust",
    "Java", "C++", "C#", "Ruby", "PHP", "Swift",
    "Kotlin", "Dart", "R", "SQL", "Shell/Bash"
]

# I can create any type of project:
projects = [
    "REST APIs", "Web Applications", "CLI Tools",
    "Mobile Apps", "Desktop Apps", "Microservices",
    "Data Pipelines", "ML Models", "Games",
    "Browser Extensions", "DevOps Scripts"
]

print(f"I support {len(languages)} languages!")
print(f"I can build {len(projects)} types of projects!")
```

Just tell me what you'd like to build and I'll create it for you! 🚀

**Tips:**
- Be specific about what you want
- Mention the language/framework you prefer
- I'll provide complete, runnable code
- Ask me to explain any part of the code
"""
