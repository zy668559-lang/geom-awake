# Architecture Overview

## System Flow
```mermaid
graph TD
    A[User/Parent] -->|Upload Image| B[Next.js Frontend]
    B -->|Choose Stuck Point| C[Next.js API /api/analyze]
    C -->|Optimize Image| D[lib/gemini.ts]
    D -->|Request Queue| E[Google Gemini Vision]
    E -->|Geometry Description| C
    C -->|Context + Prompt| F[DeepSeek API]
    F -->|Persona-based Diagnosis| C
    C -->|JSON Result| B
    B -->|Display Report| G[Report Page]
```

## Key Components
1. **Frontend**: Next.js (App Router), Tailwind CSS, Framer Motion for animations.
2. **API Routes**: `/api/analyze` handles the orchestration between Vision and Reasoning.
3. **Services**:
   - `lib/gemini.ts`: Handles image optimization (sharp) and queued requests to Google.
   - `lib/deepseek.ts`: (Integrated in route) handles LLM-based diagnosis.
4. **Middleware/Logic**:
   - Singleton Request Queue to avoid 429 errors.
   - Exponential Backoff for resilient API calls.
