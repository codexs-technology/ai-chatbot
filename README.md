# AI Chatbot

A modern ChatGPT-style AI chatbot interface built with Next.js, React, TypeScript, and an optional LLM API integration.

## Features

- AI conversations
- Streaming responses
- Conversation history
- Markdown rendering
- Code highlighting
- Demo AI mode
- Optional real LLM integration
- Responsive UI
- Dark SaaS design

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide icons
- React Markdown

## Installation

```bash
npm install
```

## Environment Setup

Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

Add your OpenAI API key if needed:

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

## Run the app

```bash
npm run dev
```

The app will work in Demo AI mode without an API key. The real LLM integration is optional and only activates when a valid API key is present.

> This project was created as a portfolio demonstration and is not intended to represent a production-ready AI SaaS infrastructure.
