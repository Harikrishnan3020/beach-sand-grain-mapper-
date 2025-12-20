# SandGrainMapper

A production-ready web-based application for AI-powered sand grain analysis, serving students, researchers, and engineers in coastal engineering, geology, and environmental monitoring.

## Features

- **Animated Login Interface** - Modern React-based authentication with smooth animations
- **Multi-Input Support** - Image upload and live camera detection
- **AI-Powered Analysis** - YOLOv8 integration for grain detection and classification
- **Comprehensive Reports** - Auto-generated scientific reports with PDF export
- **Real-time Dashboard** - Interactive visualizations and analysis results
- **Mineral Composition** - AI-based estimation with confidence percentages
- **Environmental Context** - Location type inference and microbial presence indicators

## Tech Stack

- **Frontend**: React, HTML5, CSS3, Chart.js
- **Backend**: FastAPI, YOLOv8, OpenCV
- **Analysis**: Computer Vision, AI Inference
- **Export**: PDF generation, CSV/JSON data export

## Quick Start

```bash
# Install dependencies
npm install
pip install -r requirements.txt

# Start development servers
npm run dev          # Frontend (port 3000)
python main.py       # Backend (port 8000)
```

## Project Structure

```
sandgrainmapper/
├── frontend/          # React application
├── backend/           # FastAPI server
├── models/            # YOLOv8 models
└── docs/             # Documentation
```