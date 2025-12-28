from typing import List, Dict, Any, Optional
from google.genai.types import File # Import File type for type hinting

class RAGOrchestrator:
    def __init__(self, gemini_service):
        self.gemini_service = gemini_service
    
    async def get_response(self, query: str, history: List[Dict[str, Any]], scope: Optional[str], uploaded_file: Optional[File] = None) -> str:
        print(f"Orchestrating response for query: '{query}' \n With Scope: {scope} \n With File: {uploaded_file.name if uploaded_file else 'None'}")
        return await self.gemini_service.generate_agentic_response(
            prompt=query,
            history=history,
            scope=scope,
            uploaded_file_object=uploaded_file
        )