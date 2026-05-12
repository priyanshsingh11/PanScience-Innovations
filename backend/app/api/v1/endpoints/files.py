from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from app.services.pdf_service import pdf_service
from app.services.transcription_service import transcription_service
from app.rag.engine import rag_engine
from app.database.supabase import supabase
from app.core.config import settings
import os
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

def process_file_task(file_id: str, file_path: str, file_extension: str, filename: str):
    """
    Background task to process the file and index it.
    """
    try:
        logger.info(f"Starting processing for file: {file_id} ({filename})")
        
        # Process file based on extension
        segments = []
        if file_extension == "pdf":
            segments = pdf_service.extract_text(file_path)
        elif file_extension in ["mp3", "mp4", "wav", "m4a", "mov", "ogg", "webm"]:
            segments = transcription_service.transcribe_audio(file_path)
        else:
            logger.error(f"Unsupported file type: {file_extension}")
            supabase.table("uploaded_files").update({"status": "error"}).eq("id", file_id).execute()
            return

        # Index segments in FAISS
        logger.info(f"Indexing {len(segments)} segments for file: {file_id}")
        rag_engine.create_index(segments, file_id)
        
        # Update status in Supabase
        supabase.table("uploaded_files").update({"status": "ready"}).eq("id", file_id).execute()
        
        # Store timestamps if audio/video
        if file_extension in ["mp3", "mp4", "wav", "m4a", "mov"]:
            for s in segments:
                ts_data = {
                    "file_id": file_id,
                    "text": s["text"],
                    "start_time": s["start_time"],
                    "end_time": s["end_time"]
                }
                supabase.table("media_timestamps").insert(ts_data).execute()
        
        logger.info(f"Successfully processed file: {file_id}")
        
    except Exception as e:
        logger.error(f"Error processing file {file_id}: {str(e)}")
        supabase.table("uploaded_files").update({"status": "error"}).eq("id", file_id).execute()

@router.post("/upload")
async def upload_file(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...), 
    user_id: str = Form("test_user")
):
    """
    Uploads a file and enqueues processing.
    """
    try:
        file_extension = file.filename.split(".")[-1].lower()
        file_id = str(uuid.uuid4())
        file_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}.{file_extension}")
        
        logger.info(f"Receiving file: {file.filename} for user: {user_id}")
        
        # Save file locally
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            
        # Initial database entry
        file_data = {
            "id": file_id,
            "name": file.filename,
            "type": file_extension,
            "user_id": user_id,
            "status": "processing"
        }
        supabase.table("uploaded_files").insert(file_data).execute()
        
        # Enqueue background processing
        background_tasks.add_task(process_file_task, file_id, file_path, file_extension, file.filename)
        
        return {"file_id": file_id, "status": "processing", "filename": file.filename}
        
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def list_files(user_id: str = "test_user"):
    response = supabase.table("uploaded_files").select("*").eq("user_id", user_id).execute()
    return response.data
