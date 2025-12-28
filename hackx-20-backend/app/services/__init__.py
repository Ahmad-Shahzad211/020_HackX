from .ai_services import AgenticGeminiService, EmbeddingService, GroundingGeminiService
from .knowledge_retriever import ScopedKnowledgeRetriever
from .tools import ToolBox
from .rag_orchestrator import RAGOrchestrator
# doc_review_instance is no longer needed
from .file_service import file_service_instance

# --- 1. Instantiate Base Services ---
embedding_service_instance = EmbeddingService()
grounding_gemini_instance = GroundingGeminiService()

# --- 2. Create a Specialist Retriever for EACH Category ---
general_retriever = ScopedKnowledgeRetriever(
    embedding_service=embedding_service_instance,
    collection_name="general"
)

statutes_retriever = ScopedKnowledgeRetriever(
    embedding_service=embedding_service_instance,
    collection_name="statues"
)
judgements_retriever = ScopedKnowledgeRetriever(
    embedding_service=embedding_service_instance,
    collection_name="judgments"
)
suits_retriever = ScopedKnowledgeRetriever(
    embedding_service=embedding_service_instance,
    collection_name="suits"
)
contracts_retriever = ScopedKnowledgeRetriever(
    embedding_service=embedding_service_instance,
    collection_name="contracts" 
)

# --- 3. Create the ToolBox and inject ALL dependencies ---
# doc_review_service is removed from injection.
tool_box_instance = ToolBox(
    general_retriever=general_retriever,
    statutes_retriever=statutes_retriever,
    judgements_retriever=judgements_retriever,
    suits_retriever=suits_retriever, 
    contracts_retriever=contracts_retriever, 
    grounding_service=grounding_gemini_instance,
)

# --- 4. Create the Final Agent and Orchestrator ---
agentic_gemini_instance = AgenticGeminiService(tool_box=tool_box_instance)
rag_orchestrator_instance = RAGOrchestrator(gemini_service=agentic_gemini_instance)