# Project Geometry Awakening - TODO List

## P0: Core Functionality (跑通)
- [x] Integrate Gemini 1.5 Flash for vision recognition.
- [x] Integrate DeepSeek (V3/R1) for logical reasoning.
- [x] Implement error handling and rate limiting (429 backoff).
- [x] Stabilize development environment (fixed port 3000).
- [x] Implement "Chen Laoshi" persona in AI responses.

## P1: Experience (体验)
- [x] Minimalist iPad-style UI.
- [x] Interactive diagnostic flow (ask parent "where is the struggle?").
- [ ] Refine "Chen Laoshi" tone for better empathy.
- [ ] Add smooth transitions between upload and report.

## P2: Optimization (优化)
- [x] Server-side image scaling to reduce token cost.
- [x] Singleton request queue to prevent concurrent API collisions.
- [x] Mock Mode for development and testing.
- [ ] Analytics for common geometry "stuck points".
