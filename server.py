import os
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv

from langchain_community.document_loaders import PyPDFLoader
from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

app = FastAPI(title="PDF Summarizer API")

# Ensure static directory exists
os.makedirs("static", exist_ok=True)

# Mount the static directory
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_index():
    index_path = os.path.join("static", "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse(content="<h1>Frontend index.html not found!</h1>")

@app.post("/api/summarize")
async def summarize_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    # Check if MISTRAL_API_KEY is configured
    if not os.environ.get("MISTRAL_API_KEY"):
        raise HTTPException(
            status_code=500, 
            detail="MISTRAL_API_KEY is not configured in the environment variables."
        )

    try:
        # Save file to a temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_file.write(await file.read())
            tmp_file_path = tmp_file.name

        try:
            # Load and parse PDF
            loader = PyPDFLoader(tmp_file_path)
            docs = loader.load()
            
            if not docs:
                raise HTTPException(status_code=400, detail="The PDF file appears to be empty.")

            num_pages = len(docs)
            
            # Select content to summarize
            if num_pages <= 8:
                # Summarize the entire document
                text_content = "\n\n".join([doc.page_content for doc in docs])
                summary_context = f"This is a PDF document with {num_pages} page(s). Here is the full content:\n\n{text_content}"
            else:
                # Summarize first 5 pages and last 3 pages
                first_pages = docs[:5]
                last_pages = docs[-3:] if num_pages > 8 else docs[5:]
                
                intro_content = "\n\n".join([doc.page_content for doc in first_pages])
                conclusion_content = "\n\n".join([doc.page_content for doc in last_pages])
                
                summary_context = (
                    f"This is a large PDF document containing {num_pages} pages.\n\n"
                    f"--- START OF DOCUMENT (First 5 pages) ---\n{intro_content}\n\n"
                    f"--- END OF DOCUMENT (Last 3 pages) ---\n{conclusion_content}"
                )

            # Initialize Mistral LLM
            llm = ChatMistralAI(model="mistral-small-2506")

            # Create Prompt
            prompt = ChatPromptTemplate.from_messages(
                [
                    (
                        "system",
                        "You are an expert document summarizer. Analyze the text provided and "
                        "generate a premium, high-quality summary. Structure it with:\n"
                        "1. **Title & Overview**: A concise sentence describing what the document is about.\n"
                        "2. **Key Takeaways**: Bullet points highlighting the most important findings or concepts.\n"
                        "3. **Detailed Summary**: A clear paragraph summarizing the main content/chapters.\n"
                        "Use clean and readable markdown formatting."
                    ),
                    (
                        "human",
                        "Context to summarize:\n{context}"
                    )
                ]
            )

            final_prompt = prompt.invoke({"context": summary_context})
            response = llm.invoke(final_prompt)

            return {
                "filename": file.filename,
                "pages": num_pages,
                "summary": response.content
            }

        finally:
            # Clean up the temporary file
            if os.path.exists(tmp_file_path):
                os.remove(tmp_file_path)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
