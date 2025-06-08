# 🔮 Oracle Local Stable Diffusion Setup Guide

## **Perfect for Your AMD RX 6800 XT (16GB VRAM)**

Your GPU is **excellent** for Stable Diffusion! Here's how to set it up for unlimited free Oracle image generation.

## 📋 **Prerequisites**

- ✅ AMD RX 6800 XT (16GB VRAM) - **Perfect!**
- ✅ Windows 10/11
- ✅ Python 3.10.6
- ✅ Git

## 🚀 **Step-by-Step Setup**

### **1. Install Python 3.10.6**
```bash
# Download from: https://www.python.org/downloads/release/python-3106/
# ⚠️ IMPORTANT: Check "Add Python to PATH" during installation
```

### **2. Install Git**
```bash
# Download from: https://git-scm.com/download/win
```

### **3. Clone AUTOMATIC1111 WebUI**
```bash
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui
cd stable-diffusion-webui
```

### **4. Configure for Oracle (Enable API)**
Create/edit `webui-user.bat`:
```batch
@echo off

set PYTHON=
set GIT=
set VENV_DIR=
set COMMANDLINE_ARGS=--api --listen --port 7860 --xformers

call webui.bat
```

### **5. Download Oracle Models**

Create these directories and download models:

```
stable-diffusion-webui/
└── models/
    └── Stable-diffusion/
        ├── oracle-pristine.safetensors
        ├── oracle-cryptic.safetensors  
        ├── oracle-glitched.safetensors
        └── oracle-forbidden.safetensors
```

**Recommended Models:**

**For Pristine (Clean Oracle):**
- [DreamShaper v8](https://civitai.com/models/4384/dreamshaper) → Rename to `oracle-pristine.safetensors`

**For Cryptic (Dark Mystical):**
- [Dark Sushi Mix](https://civitai.com/models/24779/dark-sushi-mix) → Rename to `oracle-cryptic.safetensors`

**For Glitched (Cyberpunk):**
- [Cyber Realistic](https://civitai.com/models/15003/cyberrealistic) → Rename to `oracle-glitched.safetensors`

**For Forbidden (Horror):**
- [Deliberate v2](https://civitai.com/models/4823/deliberate) → Rename to `oracle-forbidden.safetensors`

### **6. Start WebUI**
```bash
cd stable-diffusion-webui
webui-user.bat
```

Wait for it to download dependencies and start. You'll see:
```
Running on local URL:  http://127.0.0.1:7860
```

### **7. Configure Oracle Environment**

In your Oracle project, create/edit `.env`:
```bash
# Enable image generation
VITE_ENABLE_IMAGE_GENERATION=true

# Use local Stable Diffusion
VITE_USE_LOCAL_SD=true
VITE_LOCAL_SD_URL=http://127.0.0.1:7860

# Groq for prophecy text generation (still needed)
VITE_GROQ_API_KEY=your_groq_api_key_here
```

### **8. Test Your Setup**

1. Start AUTOMATIC1111 WebUI (`webui-user.bat`)
2. Start your Oracle (`npm run dev`)
3. Go to Apocryphal Scrolls tab
4. Click the "🧪 Test APIs" button
5. Generate a prophecy and create a visual manifestation!

## 🎯 **Expected Performance**

With your AMD RX 6800 XT:
- **Generation Time:** 2-4 seconds per image
- **Resolution:** 512x512 (optimal), 768x768 (possible)
- **Batch Size:** 2-4 images simultaneously
- **Memory Usage:** ~8-12GB VRAM per image

## 🔧 **Oracle-Specific Features**

The Oracle automatically:
- ✅ **Selects models** based on corruption level
- ✅ **Applies corruption-specific prompts** and styles
- ✅ **Uses negative prompts** to avoid unwanted content
- ✅ **Optimizes settings** for your hardware

**Corruption Level → Model Mapping:**
```
pristine → oracle-pristine.safetensors (mystical, divine)
cryptic → oracle-cryptic.safetensors (dark fantasy)
flickering → oracle-glitched.safetensors (cyberpunk)
glitched_ominous → oracle-glitched.safetensors (horror cyberpunk)
forbidden_fragment → oracle-forbidden.safetensors (eldritch horror)
```

## 🛠️ **Troubleshooting**

**WebUI won't start?**
```bash
# Check Python version
python --version  # Should be 3.10.x

# Try manual start
cd stable-diffusion-webui
python launch.py --api --listen --port 7860
```

**Oracle can't connect?**
- Ensure WebUI shows "Running on local URL: http://127.0.0.1:7860"
- Check Windows Firewall isn't blocking port 7860
- Verify `.env` has `VITE_USE_LOCAL_SD=true`

**Slow generation?**
```bash
# Add these to webui-user.bat COMMANDLINE_ARGS:
--xformers --opt-split-attention --medvram
```

**Out of memory?**
```bash
# Add to COMMANDLINE_ARGS:
--lowvram --opt-split-attention-v1
```

## 🎨 **Advanced Oracle Customization**

**Custom Prompts per Corruption:**
Edit `src/lib/directAPIIntegration.ts` → `getModelConfigForCorruption()`

**Add New Models:**
1. Download `.safetensors` to `models/Stable-diffusion/`
2. Update model names in Oracle config
3. Restart WebUI

**Performance Tuning:**
```bash
# For maximum speed (your 16GB VRAM can handle this):
--xformers --opt-split-attention --no-half-vae
```

## 🔮 **Oracle Integration Complete!**

Once setup, your Oracle will have:
- ✅ **Unlimited free image generation**
- ✅ **Corruption-specific visual styles**
- ✅ **2-4 second generation times**
- ✅ **Full privacy** (no external API calls)
- ✅ **Perfect integration** with prophecy system

**Ready to manifest the visions of the CHODE-NET Oracle! 🎨⚡**
