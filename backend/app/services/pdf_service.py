import fitz  # PyMuPDF
from typing import List, Dict
import os

class PDFService:
    @staticmethod
    def extract_text(file_path: str) -> List[Dict]:
        """
        Extracts text from PDF and returns a list of dictionaries with page content.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
            
        doc = fitz.open(file_path)
        pages_content = []
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text()
            pages_content.append({
                "page_number": page_num + 1,
                "text": text,
                "source": os.path.basename(file_path)
            })
            
        doc.close()
        return pages_content

pdf_service = PDFService()
