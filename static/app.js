document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadCard = document.getElementById('uploadCard');
    const fileDetailsContainer = document.getElementById('fileDetailsContainer');
    const fileNameElement = document.getElementById('fileName');
    const fileSizeElement = document.getElementById('fileSize');
    const removeFileBtn = document.getElementById('removeFileBtn');
    const summarizeBtn = document.getElementById('summarizeBtn');
    
    const loadingSection = document.getElementById('loadingSection');
    const loaderStatusText = document.getElementById('loaderStatusText');
    const loaderSubText = document.getElementById('loaderSubText');
    
    const errorCard = document.getElementById('errorCard');
    const errorMessage = document.getElementById('errorMessage');
    const errorBackBtn = document.getElementById('errorBackBtn');
    
    const resultSection = document.getElementById('resultSection');
    const resultPageCount = document.getElementById('resultPageCount');
    const resultDocTitle = document.getElementById('resultDocTitle');
    const summaryOutput = document.getElementById('summaryOutput');
    const copyBtn = document.getElementById('copyBtn');
    const newDocBtn = document.getElementById('newDocBtn');

    let selectedFile = null;
    let loadingInterval = null;
    let rawSummaryText = '';

    // Drag and Drop Event Listeners
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('drag-over');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('drag-over');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // File Selection Handler
    function handleFileSelect(file) {
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            showError("Only PDF documents are supported. Please select a valid PDF file.");
            return;
        }

        selectedFile = file;
        fileNameElement.textContent = file.name;
        fileSizeElement.textContent = formatBytes(file.size);
        
        // Show details and hide the drag area drop-zone-content
        dropZone.style.display = 'none';
        fileDetailsContainer.style.display = 'flex';
        errorCard.style.display = 'none';
    }

    // Remove File Handler
    removeFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetUploadState();
    });

    function resetUploadState() {
        selectedFile = null;
        fileInput.value = '';
        dropZone.style.display = 'block';
        fileDetailsContainer.style.display = 'none';
        errorCard.style.display = 'none';
    }

    // Format bytes to readable size
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // Summarize Action Handler
    summarizeBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        // Hide upload section, show loading section
        uploadCard.style.display = 'none';
        loadingSection.style.display = 'flex';
        
        // Start loading text simulation
        startLoadingSimulation();

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('/api/summarize', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            clearInterval(loadingInterval);

            if (!response.ok) {
                throw new Error(data.detail || "Failed to process the document.");
            }

            renderSummaryResult(data);
        } catch (error) {
            clearInterval(loadingInterval);
            showError(error.message);
        }
    });

    // Loading status texts simulation
    function startLoadingSimulation() {
        const statuses = [
            { title: "Uploading document...", sub: "Sending PDF to server securely..." },
            { title: "Parsing PDF content...", sub: "Extracting text and pages from document..." },
            { title: "Analyzing pages...", sub: "Using LangChain loaders to process contents..." },
            { title: "Generating summary...", sub: "Asking Mistral AI to draft key takeaways and insights..." },
            { title: "Finalizing markdown...", sub: "Formatting the response for clean readability..." }
        ];

        let index = 0;
        loaderStatusText.textContent = statuses[index].title;
        loaderSubText.textContent = statuses[index].sub;

        loadingInterval = setInterval(() => {
            if (index < statuses.length - 1) {
                index++;
                // Smooth transition
                loaderStatusText.style.opacity = 0;
                loaderSubText.style.opacity = 0;
                
                setTimeout(() => {
                    loaderStatusText.textContent = statuses[index].title;
                    loaderSubText.textContent = statuses[index].sub;
                    loaderStatusText.style.opacity = 1;
                    loaderSubText.style.opacity = 1;
                }, 200);
            }
        }, 3500);
    }

    // Render summary result
    function renderSummaryResult(data) {
        loadingSection.style.display = 'none';
        resultSection.style.display = 'block';

        resultDocTitle.textContent = data.filename;
        resultPageCount.textContent = `${data.pages} ${data.pages === 1 ? 'Page' : 'Pages'}`;
        
        rawSummaryText = data.summary;
        // Parse markdown to HTML using marked.js
        summaryOutput.innerHTML = marked.parse(data.summary);
    }

    // Error handler
    function showError(message) {
        loadingSection.style.display = 'none';
        uploadCard.style.display = 'none';
        resultSection.style.display = 'none';
        
        errorCard.style.display = 'flex';
        errorMessage.textContent = message;
    }

    // Error Back Button
    errorBackBtn.addEventListener('click', () => {
        errorCard.style.display = 'none';
        uploadCard.style.display = 'flex';
        resetUploadState();
    });

    // Copy Summary Button
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(rawSummaryText).then(() => {
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fa-solid fa-check" style="color: var(--accent)"></i> Copied!';
            copyBtn.style.borderColor = 'var(--accent)';
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.style.borderColor = '';
            }, 2000);
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    });

    // New Document Button
    newDocBtn.addEventListener('click', () => {
        resultSection.style.display = 'none';
        uploadCard.style.display = 'flex';
        resetUploadState();
    });
});
