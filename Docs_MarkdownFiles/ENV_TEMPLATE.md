# 🔮 Environment Configuration Template

Copy this file to `.env` and fill in your actual values.

## Supabase Configuration
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## AI & Image Generation APIs (Direct Integration)
```bash
# Groq AI for fast text generation
VITE_GROQ_API_KEY=your-groq-api-key

# Image Generation Options (choose one)

VITE_GROQ_API_KEY=your-groq-api-key           # For Llama LLM generation

# Audio Generation
VITE_ELEVENLABS_API_KEY=your-elevenlabs-api-key

# Image Provider Selection
VITE_IMAGE_GENERATION_PROVIDER=kie_ai          # or 'local_sd'
VITE_ENABLE_IMAGE_GENERATION=true
```

## Game Integration
```bash
VITE_GAME_URL=/chode_tapper_game/game_demo/index.html
VITE_ENABLE_GAME_INTEGRATION=true
```

## Development Settings
```bash
VITE_ENABLE_DEBUG_PANEL=true
VITE_ENABLE_GHOST_LEGION=true
```

## Security Notes
- Never commit your `.env` file to version control
- Keep your API keys secure and rotate them regularly
- Use environment-specific keys (dev/staging/prod)


### **Setup Instructions**

1. **Get Groq API Key**
   - Sign up at [https://groq.com](https://groq.com)
   - Create API key in dashboard
   - Add to `VITE_GROQ_API_KEY`

2. **Get Image Generation API Key**
   - **Kie AI**: Sign up at [https://kieai.com](https://kieai.com) → Add to `VITE_KIE_AI_API_KEY`
   - **Text Generation**: Use Groq account → Add to `VITE_GROQ_API_KEY`

3. **Get ElevenLabs API Key** (Optional)
   - Sign up at [https://elevenlabs.io](https://elevenlabs.io)
   - Add to `VITE_ELEVENLABS_API_KEY`

4. **Set Image Provider**

   - `VITE_IMAGE_GENERATION_PROVIDER=local_sd` (for local Stable Diffusion)(OPTIONAL)


**Ready to generate prophecies with simple, reliable APIs! 🔮⚡** 

# Environment Variables Template

Copy this file to `.env` and fill in your actual values.

## Core Oracle Configuration
```bash
# Enable image generation system
VITE_ENABLE_IMAGE_GENERATION=true

# Groq API for LLM processing (REQUIRED for prophecy generation)
VITE_GROQ_API_KEY=your_groq_api_key_here

# === IMAGE GENERATION OPTIONS ===

# Option 1: Local Stable Diffusion (RECOMMENDED - FREE!)
VITE_USE_LOCAL_SD=true
VITE_LOCAL_SD_URL=http://127.0.0.1:7860



# Option 3: Groq Llama for Text Generation (Free tier available)
VITE_GROQ_API_KEY=your_groq_api_key_here

# === AUDIO GENERATION (Optional) ===
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

## 🔮 **LOCAL STABLE DIFFUSION SETUP (RECOMMENDED)**

### **Why Local SD is Perfect for Oracle:**
- ✅ **FREE** unlimited generations after setup
- ✅ **FAST** with your 16GB VRAM (2-4 second generations)
- ✅ **CORRUPTION-SPECIFIC** models for different Oracle states
- ✅ **FULL CONTROL** over prompts and styles
- ✅ **PRIVACY** - no data sent to external APIs


VITE_USE_LOCAL_SD=true
VITE_LOCAL_SD_URL=http://127.0.0.1:7860

## Required Environment Variables

### Core API Keys
```bash
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GROQ_API_KEY=your-groq-api-key          # For Llama LLM generation
VITE_KIE_AI_API_KEY=your-kie-ai-api-key      # For AI image generation
VITE_ELEVENLABS_API_KEY=your-elevenlabs-key  # For TTS generation (optional)
```

### Image Generation Configuration
```bash
# Choose your image generation provider
VITE_USE_LOCAL_SD=true                       # Use local Stable Diffusion
# OR use KieAI cloud service with VITE_KIE_AI_API_KEY above
```
