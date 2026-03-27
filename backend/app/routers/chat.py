from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse
from app.services.ai_service import chat_with_ai

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        messages = [{"role": m.role, "content": m.content} for m in request.messages]
        result = await chat_with_ai(messages, request.language, request.context)
        return ChatResponse(
            response=result["response"],
            code_blocks=result["code_blocks"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
