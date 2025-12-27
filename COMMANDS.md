# Command Reference - Copy & Paste

## 🚀 Quick Start (3 Commands)

### Terminal 1: Start Backend
```powershell
cd backend
pip install -r requirements.txt
python main.py
```
**Wait for**: `INFO:     Uvicorn running on http://127.0.0.1:8000`

---

### Terminal 2: Start Quick Tunnel
```powershell
cloudflared tunnel --url http://localhost:8000
```
**Copy the URL** that appears: `https://xxxxx-yyyyy-zzzzz.trycloudflare.com`

---

### Terminal 3: Update Frontend
```powershell
# Edit index.html line ~38:
# const BACKEND = "YOUR_CLOUDFLARE_TUNNEL_URL_HERE";
# Replace with the URL from Terminal 2

# Then open index.html in browser
start index.html
```

---

## 🎯 Named Tunnel Setup (Production - One Time)

### Step 1: Login
```powershell
cloudflared tunnel login
```

### Step 2: Create Tunnel
```powershell
cloudflared tunnel create smartphone-demo
```
**Save the Tunnel ID from output!**

### Step 3: Create Config
```powershell
# Create: C:\Users\<YourName>\.cloudflared\config.yml

# Copy this content:
tunnel: YOUR-TUNNEL-ID-FROM-STEP-2
credentials-file: C:\Users\<YourName>\.cloudflared\YOUR-TUNNEL-ID.json

ingress:
  - service: http://localhost:8000
```

### Step 4: Run Named Tunnel
```powershell
cloudflared tunnel run smartphone-demo
```

### Step 5: Get Permanent URL
```powershell
cloudflared tunnel info smartphone-demo
```
**Use this URL in index.html** - it never changes!

---

## 🧪 Testing Commands

### Test Backend Locally
```powershell
curl http://localhost:8000/health
```
**Expected**: `{"status":"healthy","device_connected":true,...}`

### Test Backend via Tunnel
```powershell
curl https://your-tunnel-url.com/health
```
**Expected**: Same as above

### Test ADB Connection
```powershell
adb devices
```
**Expected**: Your device listed (not "unauthorized")

### Test ADB Command
```powershell
adb shell getprop ro.product.model
```
**Expected**: Your phone model name

---

## 🔧 Troubleshooting Commands

### Restart Backend
```powershell
# In Terminal 1, press Ctrl+C to stop
# Then:
python main.py
```

### Restart Tunnel
```powershell
# In Terminal 2, press Ctrl+C to stop
# Then (quick tunnel):
cloudflared tunnel --url http://localhost:8000

# Or (named tunnel):
cloudflared tunnel run smartphone-demo
```

### Clear ADB Server
```powershell
adb kill-server
adb start-server
adb devices
```

### Check Python Version
```powershell
python --version
```
**Need**: 3.8 or higher

### Check Installed Packages
```powershell
pip list
```
**Look for**: `fastapi`, `uvicorn`

---

## 📦 Frontend Deployment

### Deploy to Vercel
```powershell
npm install -g vercel
vercel
```

### Deploy to Netlify (Manual)
1. Go to: https://app.netlify.com/drop
2. Drag `index.html` onto the page
3. Done!

### Deploy to GitHub Pages
```powershell
git add .
git commit -m "Add smartphone service demo"
git push origin main

# Then enable Pages in repo settings:
# Settings → Pages → Source: main / (root)
```

---

## 🐛 Debug Commands

### Check if Port 8000 is in Use
```powershell
netstat -ano | findstr :8000
```

### Kill Process on Port 8000
```powershell
# Get PID from netstat output above, then:
taskkill /PID <PID> /F
```

### View Backend Logs (Verbose)
```powershell
cd backend
python main.py --log-level debug
```

### View Tunnel Logs (Verbose)
```powershell
cloudflared tunnel run smartphone-demo --loglevel debug
```

---

## 🔍 Verification Commands

### Full Health Check
```powershell
# 1. Backend
curl http://localhost:8000/health

# 2. Tunnel
curl https://your-tunnel-url/health

# 3. ADB
adb devices

# 4. All three should succeed ✅
```

---

## 📊 Useful ADB Commands (for Demo)

### Open Browser on Phone
```powershell
adb shell am start -a android.intent.action.VIEW -d https://example.com
```

### Get Battery Info
```powershell
adb shell dumpsys battery
```

### Get Device Model
```powershell
adb shell getprop ro.product.model
```

### Get Android Version
```powershell
adb shell getprop ro.build.version.release
```

### Take Screenshot
```powershell
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png
```

### List Apps
```powershell
adb shell pm list packages
```

---

## 🎬 Demo Script Commands (Run in Order)

```powershell
# Before demo:
# 1. Start backend (Terminal 1)
cd backend
python main.py

# 2. Start tunnel (Terminal 2)
cloudflared tunnel run smartphone-demo  # Or quick tunnel

# 3. Open frontend
start index.html

# During demo:
# Just use the web UI buttons!
# Reserve → Run Test → Metrics → Release
```

---

## 💾 Git Commands

### Check Status
```powershell
git status
```

### Commit Changes
```powershell
git add .
git commit -m "Update smartphone service demo"
git push
```

### Create Branch for Demo
```powershell
git checkout -b demo-ready
git push -u origin demo-ready
```

---

## 🆘 Emergency Reset

### If Everything Breaks
```powershell
# 1. Stop everything (Ctrl+C in both terminals)

# 2. Kill all processes
taskkill /F /IM python.exe
taskkill /F /IM cloudflared.exe

# 3. Restart ADB
adb kill-server
adb start-server

# 4. Start fresh
cd backend
python main.py

# New terminal:
cloudflared tunnel --url http://localhost:8000

# 5. Update index.html with new URL
# 6. Test: curl http://localhost:8000/health
```

---

## 📝 Quick Reference

| Command | Purpose |
|---------|---------|
| `python main.py` | Start backend |
| `cloudflared tunnel --url http://localhost:8000` | Quick tunnel |
| `cloudflared tunnel run smartphone-demo` | Named tunnel |
| `curl http://localhost:8000/health` | Test backend |
| `adb devices` | Check phone |
| `Ctrl+C` | Stop process |
| `F12` | Open browser console |
| `start index.html` | Open in default browser |

---

**Save this file for quick copy-paste during setup and demos!** 📋
