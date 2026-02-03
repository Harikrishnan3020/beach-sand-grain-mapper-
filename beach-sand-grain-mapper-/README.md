# SandGrainMapper

A production-ready web-based application for AI-powered sand grain analysis, serving students, researchers, and engineers in coastal engineering, geology, and environmental monitoring.

## Features

- **Animated Interface** - Modern React-based UI with smooth animations.
- **AI-Powered Analysis** - Uses Google's Gemini/Generative AI models to analyze sand/soil images for type, texture, and grain characteristics.
- **Geological Insights** - Identifies likely real-world locations and provides detailed geological analysis (origin, composition, engineering properties).
- **Interactive Maps** - Visualizes estimated locations using Leaflet maps.
- **Voice Chat** - Integrated voice-to-text (Groq) and AI response (Gemini) for interactive queries.
- **Reporting** - Generates comprehensive structured data and text reports.

## Tech Stack

- **Frontend**: React.js, Chart.js, Framer Motion, Leaflet
- **Backend**: Node.js, Express.js
- **AI/ML**: Google Gemini (Generative AI) for vision and text analysis, Groq for voice transcription
- **Styling**: Modern CSS3

## Quick Start

### Prerequisites

- Node.js installed on your machine.
- API Keys for Google Gemini and Groq.

### Installation

1.  **Clone the repository**

    ```bash
    git clone <repository-url>
    cd beach-sand-grain-mapper-
    ```

2.  **Backend Setup**

    Navigate to the backend directory, install dependencies, and configure environment variables.

    ```bash
    cd backend
    npm install
    
    # Create .env file from example
    cp .env.example .env
    ```

    *Open `.env` and add your API keys:*
    ```env
    GEMINI_API_KEY=your_google_gemini_key
    GROQ_API_KEY=your_groq_api_key
    ```

3.  **Frontend Setup**

    Open a new terminal, navigate to the frontend directory, and install dependencies.

    ```bash
    cd ../frontend
    npm install
    ```

### Running the Application

1.  **Start the Backend Server**

    ```bash
    cd backend
    npm start
    ```
    The server will run on `http://127.0.0.1:8000`.

2.  **Start the Frontend Client**

    ```bash
    cd frontend
    npm start
    ```
    The application will open in your browser at `http://localhost:3000`.

## Project Structure

```
beach-sand-grain-mapper-/
├── frontend/          # React application (UI, Maps, Charts)
├── backend/           # Express server & API proxy
│   ├── server.js      # Main server logic (Gemini/Groq integration)
│   └── ...
├── README.md          # Project documentation
└── ...
```

## Usage

1.  **Upload Image**: Upload a photo of sand or soil.
2.  **Analyze**: Click analysis to get detailed breakdown of soil type, location estimates, and key geological features.
3.  **Voice Chat**: Use the voice feature to ask questions about the analysis or geology.
4.  **Explore**: View the results on the interactive dashboard.

<!-- Updated -->
