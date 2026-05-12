import os
from typing import List, Dict, Any
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from app.core.config import settings

class RAGEngine:
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)
        self.llm = ChatGroq(
            groq_api_key=settings.GROQ_API_KEY,
            model_name=settings.MODEL_NAME,
            streaming=True
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        self.vector_db_path = settings.VECTOR_DB_DIR

    def create_index(self, segments: List[Dict], file_id: str):
        """
        Creates a FAISS index for a specific file.
        """
        texts = [s["text"] for s in segments]
        metadatas = [{"start_time": s.get("start_time"), "end_time": s.get("end_time"), "source": s.get("source"), "page": s.get("page_number")} for s in segments]
        
        # Split texts if they are too large
        docs = self.text_splitter.create_documents(texts, metadatas=metadatas)
        
        vectorstore = FAISS.from_documents(docs, self.embeddings)
        index_path = os.path.join(self.vector_db_path, f"{file_id}")
        vectorstore.save_local(index_path)
        return index_path

    def get_chat_chain(self, file_ids: List[str]):
        """
        Creates a conversational chain for the given files.
        """
        vectorstores = []
        for fid in file_ids:
            index_path = os.path.join(self.vector_db_path, fid)
            if os.path.exists(index_path):
                vectorstores.append(FAISS.load_local(index_path, self.embeddings, allow_dangerous_deserialization=True))
        
        if not vectorstores:
            raise ValueError("No vector stores found for the given files.")
            
        # Merge vectorstores if multiple files
        main_vectorstore = vectorstores[0]
        for vs in vectorstores[1:]:
            main_vectorstore.merge_from(vs)
            
        retriever = main_vectorstore.as_retriever(search_kwargs={"k": 5})
        
        memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
            output_key="answer"
        )
        
        chain = ConversationalRetrievalChain.from_llm(
            llm=self.llm,
            retriever=retriever,
            memory=memory,
            return_source_documents=True,
            verbose=True
        )
        
        return chain

rag_engine = RAGEngine()
