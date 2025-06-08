# 🚀 AMD Stable Diffusion Speed Troubleshooting Guide

## 🎯 **Target Performance**: 3-5 seconds per step (down from 20s/step)

## 🔍 **Step 1: Verify Your Installation Type**

### Check if you have the RIGHT version:
```bash
# Look for this file in your SD directory:
G:\stable-diffusion-webui-directml\
```

**❌ WRONG**: `stable-diffusion-webui` (NVIDIA version)  
**✅ CORRECT**: `stable-diffusion-webui-directml` (AMD version)

If you have the wrong version, download the correct one:
- **AMD Users**: https://github.com/lshqqytiger/stable-diffusion-webui-directml
- **NOT**: https://github.com/AUTOMATIC1111/stable-diffusion-webui

## 🔧 **Step 2: Replace Your webui-user.bat**

Replace your current `webui-user.bat` with the new `webui-user-amd-optimized.bat` file.

### Key AMD DirectML flags that MUST be present:
```bat
--use-directml          # Essential for AMD GPU acceleration
--opt-sdp-attention     # Memory optimization
--opt-sub-quad-attention # Speed optimization  
--medvram              # Memory management for AMD
--no-half-vae          # Prevents AMD crashes
--precision full       # AMD compatibility
```

## 🖥️ **Step 3: Hardware Verification**

### Check your AMD GPU:
1. Open **Device Manager**
2. Expand **Display adapters**
3. Verify you see your AMD GPU (RX 5000/6000/7000 series work best)

### Check DirectML installation:
```powershell
# Run in PowerShell as Administrator
Get-WindowsCapability -Online | Where-Object Name -like "*DirectML*"
```

If not installed:
```powershell
Add-WindowsCapability -Online -Name "DirectML~~~~"
```

## ⚙️ **Step 4: Model Optimization**

### Use smaller, faster models for pixel art:
- **SD 1.5 base models** (2GB) instead of SDXL (6GB+)
- **Pruned models** when available
- **Specialized pixel art models** (usually smaller)

### Current Oracle models status:
```
✅ oracle-pristine.safetensors [b568a22e42] - Good size
✅ oracle-cryptic.safetensors [7adffa28d4] - Good size  
✅ oracle-glitched.safetensors - Check size
✅ oracle-forbidden.safetensors - Check size
```

## 🎮 **Step 5: Optimal Settings for Pixel Art**

### In WebUI interface, use these settings:
```
Sampling method: DPM++ SDE
Sampling steps: 8-12 (not 20-30!)
CFG Scale: 6.0 (not 7.5+)
Width: 512
Height: 512
Batch count: 1
Batch size: 1
```

## 🩺 **Step 6: Performance Diagnostics**

### Test with minimal settings:
1. **Start WebUI** with new optimized bat file
2. **Use simple prompt**: `"pixel art robot"`
3. **Settings**: 8 steps, DPM++ SDE, 512x512
4. **Expected time**: 30-60 seconds total (3-7s per step)

### If still slow, check:

#### Memory Issues:
- **Task Manager** → **Performance** → **GPU**
- AMD GPU should show usage during generation
- If 0% GPU usage = DirectML not working

#### CPU Fallback (BAD):
- If CPU usage is 100% during generation = GPU not being used
- This causes 20s/step performance

## 🚨 **Step 7: Common AMD Issues & Fixes**

### Issue: "DirectML device not found"
**Fix**: Update AMD drivers to latest version

### Issue: Still using CPU instead of GPU  
**Fix**: 
```bat
# Add these to webui-user.bat:
set DML_VISIBLE_DEVICES=0
set DIRECTML_DEVICE=0
```

### Issue: Out of memory errors
**Fix**: Use `--lowvram` flag (already in optimized bat)

### Issue: Model loading errors
**Fix**: Use `--no-half-vae --precision full` (already in optimized bat)

## 📊 **Expected Performance Benchmarks**

| Hardware | Steps/Time | Total (12 steps) |
|----------|------------|------------------|
| **Target AMD** | 3-5s/step | 36-60 seconds |
| **Your Current** | 20s/step | 240 seconds |
| **Improvement** | **4-6x faster** | **4-6x faster** |

## 🔄 **Step 8: Restart Process**

1. **Close** current Stable Diffusion WebUI
2. **Replace** webui-user.bat with the optimized version
3. **Restart** WebUI and test with simple prompt
4. **Monitor** task manager for GPU usage
5. **Time** the generation and report results

## 🧪 **Test Protocol**

After optimization, test with:
```
Prompt: "cyberpunk oracle pixel art"
Steps: 12
Sampler: DPM++ SDE  
Size: 512x512
CFG: 6.0
```

**Expected**: 60-90 seconds total generation time
**Previous**: 240+ seconds

## 📞 **Report Back**

After trying the optimized bat file, please share:
1. ✅ Total generation time for 12 steps
2. ✅ Time per step average  
3. ✅ GPU usage % during generation
4. ✅ Any error messages
5. ✅ AMD GPU model from Device Manager 