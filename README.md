# Multimedia RAG Application

A production-ready AI-Powered Multimedia RAG Application using Next.js 15, FastAPI, Supabase, LangChain, and OpenAI/Groq.

## Architecture
- **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS, Shadcn/UI, React Player.
- **Backend**: FastAPI, Python, FAISS, LangChain.
- **AI**: Groq (LLM), HuggingFace (Embeddings), OpenAI Whisper (Transcription).
- **Database**: Supabase (PostgreSQL, Storage, Auth).

## Features
- **PDF Interaction**: Chat with documents using semantic search.
- **Audio/Video RAG**: Transcribe multimedia and retrieve relevant segments based on timestamps.
- **Media Player**: Integrated player with "seek to timestamp" functionality from chat answers.
- **Real-time Status**: Track processing status of uploaded files.

## Setup Instructions

### 1. Supabase Setup
1. Create a project on [Supabase](https://supabase.com/).
2. Run the SQL provided in `supabase/schema.sql` in the SQL Editor.
3. Create a bucket named `multimedia` in Supabase Storage.
4. Get your `SUPABASE_URL`, `ANON_KEY`, and `SERVICE_ROLE_KEY`.

### 2. Backend Setup
1. `cd backend`
2. `python -m venv venv`
3. `.\venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
4. `pip install -r requirements.txt`
5. Create `.env` and add:
   ```env
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   OPENAI_API_KEY=...
   GROQ_API_KEY=...
   ```
6. Run: `uvicorn app.main:app --reload`

### 3. Frontend Setup
1. `cd frontend`
2. `npm install`
3. Create `.env.local` and add:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```
4. Run: `npm run dev`

## RAG Pipeline
1. **Extraction**: PDF (PyMuPDF), Audio/Video (Whisper API).
2. **Chunking**: RecursiveCharacterTextSplitter for text; segment-based chunking for multimedia.
3. **Indexing**: Embeddings using `BAAI/bge-base-en-v1.5` stored in FAISS local indexes.
4. **Retrieval**: Semantic search on FAISS indices with metadata preservation (timestamps/pages).
5. **Generation**: Groq (Mixtral) processes context + query to provide answers with source citations.

## Future Improvements
- Multi-user data isolation via RLS.
- Streaming responses from LLM in the UI.
- Support for more document types (Docx, Excel).
- Advanced re-ranking for better retrieval accuracy.
