# Generative AI Learning Journey: Document Loaders with LangChain 🚀

Welcome! This repository documents hands-on learning, exercises, and examples for building LLM applications using LangChain. 

Today's focus was on **Document Loaders**, **Prompt Engineering**, and **Integrating Chat Models** using Mistral AI.

---

## 📚 What Was Learned Today

### 1. LangChain Document Loaders
Document loaders load data from a source as a list of `Document` objects. A `Document` contains text (content) and associated metadata. We explored three primary loaders:
*   **`TextLoader`**: Used for loading plain text files (e.g., `.txt`).
*   **`PyPDFLoader`**: Parses PDF documents page by page, making it easy to extract text from papers, manuals, or documents (e.g., `GRU.pdf`).
*   **`WebBaseLoader`**: Fetches webpages (using BeautifulSoup) and converts HTML pages into clean text content (e.g., Apple's MacBook Pro product page).

### 2. Prompt Engineering & Chat Templates
We learned how to structure inputs to LLMs using:
*   **`ChatPromptTemplate`**: Defining a system instructions role (e.g., instructing the model to act as a summarizing assistant) and a human inputs role.
*   **Prompt Formatting**: Dynamically injecting document contents (using `.format_messages()`) into placeholders before sending them to the LLM.

### 3. Model Integration (Mistral AI)
*   Integrated the **Mistral AI** platform using `ChatMistralAI` with the `mistral-small-2506` model to generate response completions.
*   Used `.invoke()` to send messages and retrieve the model's generated response content (`result.content`).

---

## 📂 Project Structure

Here is how the repository is structured:

*   **`Document Loaders/`**
    *   [`test.py`](file:///c:/Users/Saurabh%20Kumar%20Singh/OneDrive/Desktop/generative%20ai2/Document%20Loaders/test.py): Demonstrates **`TextLoader`** by reading `text.txt` and generating a summarized list of key points.
    *   [`pdf.py`](file:///c:/Users/Saurabh%20Kumar%20Singh/OneDrive/Desktop/generative%20ai2/Document%20Loaders/pdf.py): Demonstrates **`PyPDFLoader`** by loading the `GRU.pdf` research paper and summarizing its content.
    *   [`page.py`](file:///c:/Users/Saurabh%20Kumar%20Singh/OneDrive/Desktop/generative%20ai2/Document%20Loaders/page.py): Demonstrates **`WebBaseLoader`** by parsing the Apple MacBook Pro webpage and extracting a bullet-point summary.
    *   `text.txt`: A sample text file containing content used in `test.py`.
    *   `GRU.pdf`: A PDF research paper document.
*   **`main.py`**: Entry point file for hello-world testing.
*   **`requirements.txt`**: Standard python package dependencies for generative AI development.

---

## 🛠️ Setup & Execution

### Prerequisites
Make sure you have Python 3.13+ installed.

### 1. Clone & Initialize
Create your virtual environment:
```bash
python -m venv .venv
# On Windows
.venv\Scripts\activate
# On macOS/Linux
source .venv/bin/activate
```

### 2. Install Dependencies
Install all required libraries:
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add your Mistral API key:
```env
MISTRAL_API_KEY=your_mistral_api_key_here
```

### 4. Run the Scripts
You can run any of the loader scripts as follows:
```bash
# To run the Text Loader script
python "Document Loaders/test.py"

# To run the PDF Loader script
python "Document Loaders/pdf.py"

# To run the Web Base Loader script
python "Document Loaders/page.py"
```
