import os
from openai import OpenAI
from app.core.config import settings
from typing import List, Dict

class TranscriptionService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    def transcribe_audio(self, file_path: str) -> List[Dict]:
        """
        Transcribes audio/video file using OpenAI Whisper and returns segments with timestamps.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        with open(file_path, "rb") as audio_file:
            transcript = self.client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file,
                response_format="verbose_json",
                timestamp_granularities=["segment"]
            )

        segments = []
        for segment in transcript.segments:
            segments.append({
                "text": segment.text,
                "start_time": segment.start,
                "end_time": segment.end,
                "source": os.path.basename(file_path)
            })
            
        return segments

transcription_service = TranscriptionService()
