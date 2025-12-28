import pathlib
import tempfile
import mimetypes # <-- Import the mimetypes library
from fastapi import UploadFile
from google import genai
from google.genai.types import File

class FileService:
    def __init__(self):
        # Initialize the new centralized client
        self.client = genai.Client()

    def _get_correct_mime_type(self, file: UploadFile) -> str:
        """
        Returns the file's reported MIME type, or guesses it if a generic one is provided.
        This makes the backend more robust against poorly configured clients.
        """
        # If the client provides a generic mime type, we try to guess the real one.
        if file.content_type == "application/octet-stream":
            # Guess type from filename extension (e.g., '.pdf')
            guessed_type, _ = mimetypes.guess_type(file.filename)
            if guessed_type:
                print(f"Client sent generic mime type, but we guessed '{guessed_type}' from filename.")
                return guessed_type
        
        # Otherwise, trust the client's provided mime type
        return file.content_type

    async def upload_file(self, file: UploadFile) -> File:
        """Saves UploadFile to a temp path and uploads to Gemini File API."""
        
        # Determine the best MIME type for the file.
        correct_mime_type = self._get_correct_mime_type(file)

        suffix = pathlib.Path(file.filename).suffix
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        try:
            print(f"Uploading {tmp_path} (MIME: {correct_mime_type}) to Gemini File API...")
            # Use the corrected MIME type for the upload
            gemini_file = self.client.files.upload(
                file=tmp_path,
                config=dict(mime_type=correct_mime_type)
            )
            print(f"Upload successful. File name: {gemini_file.name}")
            return gemini_file
        finally:
            pathlib.Path(tmp_path).unlink(missing_ok=True)

file_service_instance = FileService()
