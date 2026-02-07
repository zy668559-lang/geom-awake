# Acceptance Guide

## Startup Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Environment Variables (.env.local)
```env
GEMINI_API_KEY=your_key
DEEPSEEK_API_KEY=your_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
# Toggle Mock Mode for rapid UI testing
MOCK_MODE=true 
```

## Verification Steps
1. **Server Access**: Visit `http://localhost:3000`. Ensure it doesn't drift to 3001.
2. **Flow Test**:
   - Upload a geometry problem image.
   - Click "Diagnosis".
   - **Check**: Observe DevTools Network tab. Only **ONE** request to `/api/analyze` should appear.
   - **Check**: Button remains disabled until completion.
3. **Logic Verification**:
   - Ensure the report uses "Chen Laoshi" tone (encouraging, neighborly).
   - Ensure a 3-day plan is generated.
4. **Stability**:
   - (Manual) Rapidly trigger requests. Backend logs should show sequential processing.
