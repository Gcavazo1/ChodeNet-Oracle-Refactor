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