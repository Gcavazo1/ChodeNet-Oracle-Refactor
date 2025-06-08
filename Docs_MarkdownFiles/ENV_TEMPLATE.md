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
VITE_KIE_AI_API_KEY=your-kie-ai-api-key       # Cost-effective option
VITE_OPENAI_API_KEY=your-openai-api-key       # For DALL-E 3

# Audio Generation
VITE_ELEVENLABS_API_KEY=your-elevenlabs-api-key

# Image Provider Selection
VITE_IMAGE_GENERATION_PROVIDER=kie_ai          # or 'dalle'
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

---

## 🚀 **MUCH SIMPLER SETUP!**

### **No More Complex Pica Configuration!**

Instead of managing multiple connection keys and dealing with third-party orchestration, we now use **direct API calls**:

✅ **Groq** - Direct API for fast AI text generation  
✅ **Kie AI** - Direct API for cost-effective image generation  
✅ **DALL-E 3** - Direct OpenAI API for high-quality images  
✅ **ElevenLabs** - Direct API for text-to-speech  

### **Setup Instructions**

1. **Get Groq API Key**
   - Sign up at [https://groq.com](https://groq.com)
   - Create API key in dashboard
   - Add to `VITE_GROQ_API_KEY`

2. **Get Image Generation API Key**
   - **Kie AI**: Sign up at [https://kieai.com](https://kieai.com) → Add to `VITE_KIE_AI_API_KEY`
   - **OR DALL-E**: Use OpenAI account → Add to `VITE_OPENAI_API_KEY`

3. **Get ElevenLabs API Key** (Optional)
   - Sign up at [https://elevenlabs.io](https://elevenlabs.io)
   - Add to `VITE_ELEVENLABS_API_KEY`

4. **Set Image Provider**
   - `VITE_IMAGE_GENERATION_PROVIDER=kie_ai` (recommended for development)
   - `VITE_IMAGE_GENERATION_PROVIDER=dalle` (for production quality)

### **Benefits of Direct Integration**

✅ **Simpler**: No complex orchestration layer  
✅ **More Reliable**: Direct API calls with better error handling  
✅ **Easier Debugging**: Clear error messages from each service  
✅ **Better Performance**: No additional network hops  
✅ **Well Documented**: Each API has excellent documentation  
✅ **More Control**: Fine-tune parameters for each service  

### **Cost Comparison**

| Provider | Cost | Quality | Best For |
|----------|------|---------|----------|
| **Kie AI** | 💰 Low | 🌟🌟🌟 Good | Development, Testing |
| **DALL-E 3** | 💰💰 Medium | 🌟🌟🌟🌟🌟 Excellent | Production, Marketing |
| **Groq** | 💰 Very Low | 🌟🌟🌟🌟 Fast | All text generation |
| **ElevenLabs** | 💰💰 Medium | 🌟🌟🌟🌟🌟 Natural | Voice narration |

---

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

# Option 2: KieAI (Paid service)
VITE_KIE_AI_API_KEY=your_kie_ai_api_key_here

# Option 3: OpenAI DALL-E (Paid service)  
VITE_OPENAI_API_KEY=your_openai_api_key_here

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

### **Quick Setup Guide:**

1. **Install AUTOMATIC1111 WebUI:**
```bash
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui
cd stable-diffusion-webui
```

2. **Enable API mode by default:**
```bash
echo set COMMANDLINE_ARGS=--api --listen --port 7860 > webui-user.bat
```

3. **Download Oracle-specific models:**
Place these in `models/Stable-diffusion/`:
- `oracle-pristine.safetensors` (DreamShaper or Realistic Vision)
- `oracle-cryptic.safetensors` (Dark Sushi Mix)  
- `oracle-glitched.safetensors` (Cyber Realistic)
- `oracle-forbidden.safetensors` (Deliberate v2)

4. **Start the WebUI:**
```bash
webui-user.bat
```

5. **Configure Oracle:**
```bash
VITE_USE_LOCAL_SD=true
VITE_LOCAL_SD_URL=http://127.0.0.1:7860
```

### **Model Recommendations by Corruption Level:**

**Pristine (Clean Oracle):**
- DreamShaper v8
- Realistic Vision v6.0
- Anything v5

**Cryptic (Dark Mystical):**
- Dark Sushi Mix
- Deliberate v2
- AbyssOrangeMix3

**Glitched/Flickering (Cyberpunk):**
- Cyber Realistic
- Neon Punk
- Synthwave

**Forbidden Fragment (Horror):**
- Deliberate v2
- Dark Sushi Mix
- Horror themed models

### **Your AMD RX 6800 XT Performance:**
- **VRAM:** 16GB (Excellent for SD)
- **Expected Speed:** 2-4 seconds per image
- **Batch Size:** Can handle 2-4 images simultaneously
- **Resolution:** 512x512 optimal, 768x768 possible

## 🎯 **Testing Your Setup:**

1. Start AUTOMATIC1111 WebUI
2. Set environment variables
3. Use the Oracle's "🧪 Test APIs" button
4. Generate a test prophecy image

## 🔧 **Troubleshooting:**

**Local SD not connecting?**
- Ensure WebUI is running with `--api` flag
- Check URL: http://127.0.0.1:7860
- Verify firewall isn't blocking port 7860

**Models not loading?**
- Place `.safetensors` files in `models/Stable-diffusion/`
- Restart WebUI after adding models
- Check WebUI logs for errors

**Slow generation?**
- Reduce steps to 20-25
- Use DPM++ 2M Karras sampler
- Stick to 512x512 resolution initially

