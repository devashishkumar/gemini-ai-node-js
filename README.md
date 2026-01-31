# Gemini AI Node.js App

A Node.js application integrating Google's Gemini AI for various AI-powered functionalities including text generation, image processing, code execution, RAG (Retrieval-Augmented Generation) and more.

## Features

- **Text Generation**: Generate responses from text prompts
- **Image Processing**: Analyze images and extract information
- **Streaming Responses**: Real-time streaming of AI responses
- **Interactive Chat**: Create conversational interfaces
- **Code Execution**: Generate and execute code using AI
- **File Operations**: Comprehensive Node.js file system operations
- **Git Integration**: Clone repositories programmatically
- **OCR**: Extract text from images using Tesseract
- **RAG Implementation**: Search and retrieve information from PDF documents
- **Multi-PDF Processing**: Process multiple PDFs in parallel for RAG

## Prerequisites

- Node.js (v14 or higher)
- npm
- Google Gemini AI API Key

## Installation

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd gemini-ai-node-js
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Install nodemon globally (for development):
   ```sh
   npm install -g nodemon
   ```

## Configuration

1. Create a Google Gemini AI API Key at [Google AI Studio](https://aistudio.google.com/app/apikey)

2. Create a `.env` file in the root directory:
   ```
   GEMINI_AI_API_KEY=your_api_key_here
   ```

## Usage

### Starting the Application

```sh
npm start
```

Or for development with auto-restart:
```sh
nodemon start
```

### RAG Features

#### Single PDF Processing
```sh
# Using npm script
npm run ragrun -- "How does garbage collection work in C#?" "C#.pdf"

# Or directly
node gemini/RAG.js "How does GC work in C#?" "C#.pdf"
```

#### Multiple PDF Processing
```sh
# Process multiple specific PDFs
node gemini/Rag-Multiple-Files.js "How does garbage collection work in C#?" "C#.pdf" "Python-Programming.pdf"

# Process all PDFs in a directory
node gemini/Rag-Multiple-Files.js "Any relevant info about Python memory management?" ./pdfs
```

If no files are specified, the script uses default sample PDFs.

Note: Files will be read in parallel to speed up indexing; errors loading any single file won't stop the whole job — they're logged to the console.

Debugging tip: we can run in "dry-run" mode to verify which chunks are retrieved without calling the AI model:

```sh
# Dry run example (no API key required)
node gemini/Rag-Multiple-Files.js "How does GC work in C#?" "C#.pdf" --dry

# Or using npm script
npm run ragrun-multi -- "How does GC work in C#?" "C#.pdf" -- --dry
```

## API Examples

The application provides various Gemini AI integrations:

### Text Generation
- Generate responses from text prompts
- Configure text generation parameters

### Image Processing
- Pass image URLs to extract information
- Analyze images for content understanding

### Code Execution
- Generate code snippets
- Execute generated code

### File System Operations
- Read/write files synchronously and asynchronously
- Create directories and zip files
- Download files from URLs
- Stream file operations

### Git Operations
- Clone repositories using Node.js

### OCR (Optical Character Recognition)
- Extract text from images using Tesseract.js

## Project Structure

```
├── app.js                 # Main Express application
├── bin/www               # Server startup script
├── gemini/               # AI integration modules
│   ├── gemini.js         # Core Gemini AI functionality
│   ├── ImageProcessing.js # Image analysis
│   ├── CodeExecution.js  # Code generation and execution
│   ├── RAG.js            # Single PDF RAG
│   ├── Rag-Multiple-Files.js # Multi-PDF RAG
│   └── ...               # Other feature modules
├── routes/               # Express routes
├── views/                # Jade templates
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## Dependencies

Key dependencies include:
- `@google/generative-ai`: Google Gemini AI SDK
- `express`: Web framework
- `langchain`: AI framework for RAG
- `chromadb`: Vector database for embeddings
- `pdf-parse`: PDF text extraction
- `tesseract.js`: OCR functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request