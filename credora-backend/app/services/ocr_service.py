import os
from typing import Optional

import pytesseract
from PIL import Image
from PyPDF2 import PdfReader


class OCRService:
    def _normalize(self, text: str) -> Optional[str]:
        if not text:
            return None
        cleaned = " ".join(text.split())
        return cleaned or None

    def _extract_from_image(self, file_path: str) -> Optional[str]:
        try:
            image = Image.open(file_path).convert("RGB")
            text = pytesseract.image_to_string(image, lang="eng")
            return self._normalize(text)
        except Exception:
            return None

    def _extract_from_pdf(self, file_path: str) -> Optional[str]:
        """
        Extract text from a PDF using PyPDF2.
        Works best for digital (text) PDFs; scanned PDFs may still need image OCR.
        """
        try:
            reader = PdfReader(file_path)
            parts = []
            for page in reader.pages:
                page_text = page.extract_text() or ""
                parts.append(page_text)
            text = " ".join(parts)
            return self._normalize(text)
        except Exception:
            return None

    def extract_text(self, file_path: str) -> Optional[str]:
        """
        Run OCR or text extraction on the given file and return extracted text.
        Supports images and PDFs. Returns None if extraction fails.
        """
        ext = os.path.splitext(file_path)[1].lower()

        if ext in [".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp"]:
            return self._extract_from_image(file_path)
        if ext == ".pdf":
            return self._extract_from_pdf(file_path)

        # Unsupported type for now
        return None


ocr_service = OCRService()

