# FluentOS 🎙️

> **Speak freely. Fluent forever.**  
> A minimalist, voice-first AI English conversation partner powered by Google's Gemini 2.5 Flash.

[![Live Demo](https://img.shields.io/badge/demo-live%20app-yellow?style=for-the-badge&logo=vercel)](https://your-project-name.vercel.app) 
[![License](https://img.shields.io/badge/license-MIT-black?style=for-the-badge)](LICENSE)

---

## 🎥 Demo

![FluentOS Demo](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzN0Zmd4bnZzb3V4ZGR4ZmF4ZmF4ZmF4ZmF4ZmF4ZmF4ZmF4dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKz9bX9v9v9v9v9/giphy.gif)

*(Replace the link above with a GIF of your actual application running!)*

## 🚀 About

**FluentOS** is a real-time voice AI application designed to help users practice English conversation in a judgment-free environment. It uses the latest **Gemini Multimodal Live API** to provide ultra-low latency voice interactions, simulating a real human conversation partner.

### ✨ Features

-   **Real-time Voice Conversation**: Talk naturally with interruptions and back-and-forth dialogue.
-   **Dynamic Visualizer**: A beautiful, breathing abstract blob that reacts to audio volume and state.
-   **Personalized Topics**: Choose your topic (Job Interview, Travel, Daily Life) and difficulty level.
-   **Instant Feedback**: Receive a summary of your vocabulary and flow after the session.
-   **Zero-UI Interface**: Designed to be voice-first, keeping the screen distraction-free.

---

## 🛠️ Tech Stack

-   **Frontend**: React 19, TypeScript, Vite
-   **AI Model**: Google Gemini 2.5 Flash (Multimodal Live API)
-   **Styling**: Tailwind CSS
-   **Audio**: Web Audio API (AudioWorklets, ScriptProcessor)
-   **Icons**: Lucide React

---

## ⚡ Getting Started

### Prerequisites

-   Node.js 18+ installed.
-   A Google Cloud Project with an API Key for **Gemini API**.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/fluent-os.git
    cd fluent-os
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    API_KEY=your_google_gemini_api_key_here
    ```

4.  **Run Locally**
    ```bash
    npm start
    ```
    Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

---

## 🌐 Deployment

This project is optimized for deployment on **Vercel**.

1.  Push your code to GitHub.
2.  Import the project into Vercel.
3.  **Critical Step**: Add your `API_KEY` in the Vercel **Environment Variables** settings.
4.  Deploy!

---

## 👨‍💻 Developed By

**Md Emon Mosahk**

-   [GitHub Profile](https://github.com/yourusername)
-   [LinkedIn](https://linkedin.com/in/yourusername)

---

*Note: This project uses the experimental Multimodal Live API. Ensure you are in a region where Google AI Studio is supported.*
