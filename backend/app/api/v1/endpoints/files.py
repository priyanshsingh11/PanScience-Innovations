from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from app.services.pdf_service import pdf_service
from app.services.transcription_service import transcription_service
from app.rag.engine import rag_engine
from app.database.supabase import supabase
from app.core.config import settings
import os
import uuid

router = APIRouter()

@router.post("/upload")
async def upload_file(background_tasks: BackgroundTasks, file: UploadFile = File(...), user_id: str = "test_user"):
    """
    Uploads a file, processes it based on type, and indexes it.
    """
    file_extension = file.filename.split(".")[-1].lower()
    file_id = str(uuid.uuid4())
    file_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}.{file_extension}")
    
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
        
    # Process file based on extension
    segments = []
    try:
        if file_extension == "pdf":
            segments = pdf_service.extract_text(file_path)
        elif file_extension in ["mp3", "mp4", "wav", "m4a"]:
            segments = transcription_service.transcribe_audio(file_path)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
            
        # Store metadata in Supabase
        file_data = {
            "id": file_id,
            "name": file.filename,
            "type": file_extension,
            "user_id": user_id,
            "status": "processing"
        }
        supabase.table("uploaded_files").insert(file_data).execute()
        
        # Index segments in FAISS
        rag_engine.create_index(segments, file_id)
        
        # Update status in Supabase
        supabase.table("uploaded_files").update({"status": "ready"}).eq("id", file_id).execute()
        
        # Store timestamps if audio/video
        if file_extension in ["mp3", "mp4", "wav", "m4a"]:
            for s in segments:
                ts_data = {
                    "file_id": file_id,
                    "text": s["text"],
                    "start_time": s["start_time"],
                    "end_time": s["end_time"]
                }
                supabase.table("media_timestamps").insert(ts_data).execute()

        return {"file_id": file_id, "status": "ready", "filename": file.filename}
        
    except Exception as e:
        # Update status to error
        supabase.table("uploaded_files").update({"status": "error"}).eq("id", file_id).execute()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def list_files(user_id: str = "test_user"):
    response = supabase.table("uploaded_files").select("*").eq("user_id", user_id).execute()
    return response.data
