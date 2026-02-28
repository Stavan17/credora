"""
Document quality checks for fraud detection: face detection and image brightness.
"""
import os
from typing import List

# Optional OpenCV - only used for photo quality checks
try:
    import cv2
    HAS_OPENCV = True
except ImportError:
    HAS_OPENCV = False

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp"}
# Average brightness below this = too dark (0-255 scale)
DARK_THRESHOLD = 70
# Minimum brightness to attempt face detection (below this = assume no face detectable)
FACE_DETECT_MIN_BRIGHTNESS = 50


def check_photo_quality(file_path: str) -> List[str]:
    """
    Run face detection and brightness check on a photo document.
    Returns list of fraud flags: NO_FACE_DETECTED_IN_PHOTO, PHOTO_OR_IMAGE_TOO_DARK.
    """
    flags: List[str] = []
    if not file_path or not os.path.isfile(file_path):
        return flags

    ext = os.path.splitext(file_path)[1].lower()
    if ext not in IMAGE_EXTENSIONS:
        return flags

    if not HAS_OPENCV:
        return flags

    try:
        img = cv2.imread(file_path)
        if img is None:
            flags.append("PHOTO_OR_IMAGE_TOO_DARK")  # unreadable often means bad quality
            return flags

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        mean_brightness = float(gray.mean())

        # 1) Too dark overall
        if mean_brightness < DARK_THRESHOLD:
            flags.append("PHOTO_OR_IMAGE_TOO_DARK")

        # 2) Face detection only if image is bright enough to be meaningful
        if mean_brightness >= FACE_DETECT_MIN_BRIGHTNESS:
            face_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
            )
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4)
            if len(faces) == 0:
                flags.append("NO_FACE_DETECTED_IN_PHOTO")
        else:
            # Too dark to reliably detect face -> treat as no verifiable face
            flags.append("NO_FACE_DETECTED_IN_PHOTO")

    except Exception:
        # On any error (e.g. corrupt image), treat as unverifiable
        flags.append("PHOTO_OR_IMAGE_TOO_DARK")

    return flags
