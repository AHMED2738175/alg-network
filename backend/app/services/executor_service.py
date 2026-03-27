import asyncio
import tempfile
import time
import os
from pathlib import Path


LANGUAGE_CONFIGS = {
    "python": {
        "extension": ".py",
        "command": "python3 {file}",
    },
    "javascript": {
        "extension": ".js",
        "command": "node {file}",
    },
    "typescript": {
        "extension": ".ts",
        "command": "npx ts-node {file}",
    },
    "shell": {
        "extension": ".sh",
        "command": "bash {file}",
    },
    "bash": {
        "extension": ".sh",
        "command": "bash {file}",
    },
    "go": {
        "extension": ".go",
        "command": "go run {file}",
    },
    "rust": {
        "extension": ".rs",
        "command": "rustc {file} -o {output} && {output}",
    },
    "c": {
        "extension": ".c",
        "command": "gcc {file} -o {output} && {output}",
    },
    "cpp": {
        "extension": ".cpp",
        "command": "g++ {file} -o {output} && {output}",
    },
    "java": {
        "extension": ".java",
        "command": "javac {file} && java -cp {dir} Main",
    },
    "ruby": {
        "extension": ".rb",
        "command": "ruby {file}",
    },
    "php": {
        "extension": ".php",
        "command": "php {file}",
    },
    "r": {
        "extension": ".r",
        "command": "Rscript {file}",
    },
}


async def execute_code(code: str, language: str, timeout: int = 30) -> dict:
    start_time = time.time()

    lang_config = LANGUAGE_CONFIGS.get(language.lower())
    if not lang_config:
        return {
            "stdout": "",
            "stderr": f"Unsupported language: {language}. Supported: {', '.join(LANGUAGE_CONFIGS.keys())}",
            "exit_code": 1,
            "execution_time": 0.0
        }

    with tempfile.TemporaryDirectory() as tmp_dir:
        ext = lang_config["extension"]
        file_name = "main" if language.lower() != "java" else "Main"
        file_path = os.path.join(tmp_dir, f"{file_name}{ext}")
        output_path = os.path.join(tmp_dir, "output")

        with open(file_path, "w") as f:
            f.write(code)

        command = lang_config["command"].format(
            file=file_path,
            output=output_path,
            dir=tmp_dir
        )

        try:
            process = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=tmp_dir,
                env={"PATH": os.environ.get("PATH", "/usr/bin:/bin"), "HOME": tmp_dir, "TMPDIR": tmp_dir, "LANG": os.environ.get("LANG", "C.UTF-8")}
            )

            stdout, stderr = await asyncio.wait_for(
                process.communicate(),
                timeout=timeout
            )

            execution_time = time.time() - start_time

            return {
                "stdout": stdout.decode("utf-8", errors="replace"),
                "stderr": stderr.decode("utf-8", errors="replace"),
                "exit_code": process.returncode or 0,
                "execution_time": round(execution_time, 3)
            }

        except asyncio.TimeoutError:
            process.kill()
            execution_time = time.time() - start_time
            return {
                "stdout": "",
                "stderr": f"Execution timed out after {timeout} seconds",
                "exit_code": -1,
                "execution_time": round(execution_time, 3)
            }
        except Exception as e:
            execution_time = time.time() - start_time
            return {
                "stdout": "",
                "stderr": str(e),
                "exit_code": 1,
                "execution_time": round(execution_time, 3)
            }


def get_supported_languages() -> list[str]:
    return list(LANGUAGE_CONFIGS.keys())
