import os
from groq import Groq
from app.core.config import settings
from typing import List, Dict

class TranscriptionService:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)

    def transcribe_audio(self, file_path: str) -> List[Dict]:
        """
        Transcribes audio/video file using Groq Whisper and returns segments with timestamps.
        """
        if not settings.GROQ_API_KEY:
            raise ValueError("Groq API Key is not set. Please set GROQ_API_KEY in .env")

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        try:
            with open(file_path, "rb") as audio_file:
                # Groq's transcription API is very similar to OpenAI's
                transcript = self.client.audio.transcriptions.create(
                    model="whisper-large-v3", 
                    file=audio_file,
                    response_format="verbose_json",
                )

            print(f"DEBUG: Groq transcript response: {type(transcript)}")
            segments = []
            if hasattr(transcript, 'segments') and transcript.segments:
                print(f"DEBUG: Found {len(transcript.segments)} segments")
                for segment in transcript.segments:
                    segments.append({
                        "text": segment['text'] if isinstance(segment, dict) else segment.text,
                        "start_time": segment['start'] if isinstance(segment, dict) else segment.start,
                        "end_time": segment['end'] if isinstance(segment, dict) else segment.end,
                        "source": os.path.basename(file_path)
                    })
            else:
                # Fallback if segments aren't returned
                segments.append({
                    "text": transcript.text,
                    "start_time": 0,
                    "end_time": 0,
                    "source": os.path.basename(file_path)
                })
                
            return segments
        except Exception as e:
            raise Exception(f"Groq Transcription failed: {str(e)}")

transcription_service = TranscriptionService()
