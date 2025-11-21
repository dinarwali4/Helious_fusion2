# Helios - Fusion Energy Explorer

A 3D interactive journey into the future of clean energy. Visualize fusion reactions, explore reactor designs, and track the industry leaders with AI-powered insights.

## Features

- **Interactive 3D Visualizer**: Explore Tokamaks, Stellarators, and Inertial Confinement systems.
- **AI Expert (Helios)**: Chat with a specialized AI agent about fusion physics using the Google Gemini API.
- **Industry Tracker**: Real-time updates on major fusion companies.
- **Educational Modules**: Interactive charts and physics explainers.

## Tech Stack

- React 18
- TypeScript
- Three.js / React Three Fiber (3D)
- Google Gemini API (AI)
- Tailwind CSS (Styling)
- Vite (Build Tool)

## Setup

### 1. Open Terminal and Navigate to Folder
**Important:** You must be inside the project folder before running commands.
```bash
cd "helios-fusion-explorer"
```
*(If your folder has a different name, replace `helios-fusion-explorer` with your folder name)*

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create a file named `.env` in this folder and add your API Key:
```
API_KEY=your_actual_api_key_here
```

### 4. Run Locally
```bash
npm run dev
```
Open the link shown (usually http://localhost:5173).

## GitHub Setup
If you haven't initialized git yet:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
# Replace with your own repository URL
git remote add origin https://github.com/YOUR_USERNAME/helios-fusion.git
git push -u origin main
```
