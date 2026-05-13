from fastapi import APIRouter, HTTPException, Body, Depends
from app.rag.engine import rag_engine
from app.database.supabase import supabase
from app.core.auth import get_current_user
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    file_ids: List[str]
    message: str
    chat_history: Optional[List[dict]] = []

@router.post("/query")
async def query_files(request: ChatRequest, user_id: str = Depends(get_current_user)):
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
            
        # Store user message in database
        try:
            supabase.table("chat_history").insert({
                "file_id": request.file_ids[0],
                "user_id": user_id,
                "role": "user",
                "content": request.message
            }).execute()
            
            # Store assistant message in database
            supabase.table("chat_history").insert({
                "file_id": request.file_ids[0],
                "user_id": user_id,
                "role": "assistant",
                "content": answer
            }).execute()
        except Exception as db_err:
            print(f"Database Error (History): {str(db_err)}")
            # Don't fail the request if history saving fails, but log it
            
        return {
            "answer": answer,
            "sources": sources
        }
    except Exception as e:
        print(f"Chat Query Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_chat_history(user_id: str = Depends(get_current_user), file_id: Optional[str] = None):
    query = supabase.table("chat_history").select("*, uploaded_files(name)")
    
    if user_id:
        query = query.eq("user_id", user_id)
    if file_id:
        query = query.eq("file_id", file_id)
        
    response = query.order("created_at", desc=True).execute()
    return response.data
