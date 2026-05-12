from fastapi import APIRouter, HTTPException, Body
from app.rag.engine import rag_engine
from app.database.supabase import supabase
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    file_ids: List[str]
    message: str
    chat_history: Optional[List[dict]] = []

@router.post("/query")
async def query_files(request: ChatRequest):
    """
    Query the uploaded files using RAG.
    """
    try:
        chain = rag_engine.get_chat_chain(request.file_ids)
        
        # Groq doesn't support streaming with ConversationalRetrievalChain directly in a simple way for FastAPI Response
        # But we can get the result and return it.
        result = chain.invoke({"question": request.message, "chat_history": request.chat_history})
        
        answer = result["answer"]
        source_documents = result["source_documents"]
        
        sources = []
        for doc in source_documents:
            sources.append({
                "content": doc.page_content,
                "metadata": doc.metadata
            })
            
        return {
            "answer": answer,
            "sources": sources
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_chat_history(file_id: str):
    response = supabase.table("chat_history").select("*").eq("file_id", file_id).execute()
    return response.data
