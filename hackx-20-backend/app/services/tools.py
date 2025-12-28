class ToolBox:
    def __init__(
        self, general_retriever, statutes_retriever, judgements_retriever, 
        suits_retriever, contracts_retriever, grounding_service
        ):
        # Inject all necessary dependencies
        self.general_retriever = general_retriever
        self.statutes_retriever = statutes_retriever
        self.judgements_retriever = judgements_retriever
        self.suits_retriever = suits_retriever
        self.contracts_retriever = contracts_retriever
        self.grounding_service = grounding_service
        
        # The execution map now includes all active tools
        self.execution_map = {
            "call_general_agent": self.call_general_agent,
            "call_statutes_agent": self.call_statutes_agent,
            "call_judgements_agent": self.call_judgements_agent,
            "call_suits_agent": self.call_suits_agent,
            "call_contracts_agent": self.call_contracts_agent,
            "search_google": self.search_google,
        }

    async def call_statutes_agent(self, query: str) -> str:
        """Use this to get information from the Statutes knowledge base."""
        print(f"--- Calling Statutes Worker Agent with query: '{query}' ---")
        results = await self.statutes_retriever.search(query=query)
        if results:
            print(f"  - RAG tool found {len(results)} results.")
            print(f"  - Snippet of first result: {results[0][:150]}...")
            return "\n---\n".join(results)
        else:
            print("  - RAG tool found 0 results.")
            return "No relevant information found in Statutes."

    async def call_judgements_agent(self, query: str) -> str:
        """Use this to get information from the Judgements knowledge base."""
        print(f"--- Calling Judgements Worker Agent with query: '{query}' ---")
        results = await self.judgements_retriever.search(query=query)
        return "\n---\n".join(results) if results else "No relevant information found in Judgements."

    async def call_suits_agent(self, query: str) -> str:
        """Use this to get information from the Suits knowledge base."""
        print(f"--- Calling Suits Worker Agent with query: '{query}' ---")
        results = await self.suits_retriever.search(query=query)
        return "\n---\n".join(results) if results else "No relevant information found in Suits."

    async def call_contracts_agent(self, query: str) -> str:
        """Use this to get information from the Contracts knowledge base."""
        print(f"--- Calling Contracts Worker Agent with query: '{query}' ---")
        results = await self.contracts_retriever.search(query=query)
        return "\n---\n".join(results) if results else "No relevant information found in Contracts."

    async def search_google(self, query: str) -> str:
        """Use this for recent events, news, or general information when internal documents are not sufficient."""
        print(f"--- Calling Google Search Tool with query: '{query}' ---")
        return await self.grounding_service.generate_content_async(contents=[query])
    
    async def call_general_agent(self, query: str) -> str:
        """Use this to get information from the General knowledge base."""
        print(f"--- Calling General Worker Agent with query: '{query}' ---")
        results = await self.general_retriever.search(query=query)
        if results:
            print(f"  - RAG tool found {len(results)} results.")
            return "\n---\n".join(results)
        else:
            print("  - RAG tool found 0 results.")
            return "No relevant information found in General Information."