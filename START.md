# 🚀 Smartphone-as-a-Service Demo - Setup Guide

## ✅ Prerequisites

1. **Python 3.8+** installed
2. **ADB (Android Debug Bridge)** installed and in PATH
3. **Android phone** connected via USB with USB debugging enabled
4. **Cloudflare account** (free) - for tunnel

---

## 🔧 Setup (One-time)

### Step 1: Install Python Dependencies

```powershell
cd backend
pip install -r requirements.txt
```

### Step 2: Verify ADB Connection

```powershell
adb devices
```

You should see your device listed (not "unauthorized").

### Step 3: Install Cloudflare Tunnel

Download from: https://github.com/cloudflare/cloudflared/releases

Or using winget:
```powershell
winget install --id Cloudflare.cloudflared
```

---

## 🎯 Running the Demo

### Option A: Quick Tunnel (Fast, but URL changes each time)

**Terminal 1 - Start Backend:**
```powershell
cd backend
python main.py
```
Wait for: `Uvicorn running on http://127.0.0.1:8000`

**Terminal 2 - Start Cloudflare Tunnel:**
```powershell
cloudflared tunnel --url http://localhost:8000
```

You'll see output like:
```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable): |
|  https://random-name-1234.trycloudflare.com                                                |
+--------------------------------------------------------------------------------------------+
```

**Copy that URL** and update `index.html`:
```javascript
const BACKEND = "https://random-name-1234.trycloudflare.com";
```

**Terminal 3 - Serve Frontend:**
```powershell
# Simple way - open index.html directly in browser
# Or deploy to Vercel/Netlify/GitHub Pages
```

---

## ⭐ Option B: Named Tunnel (Stable URL - Recommended for Demo)

### One-time Setup:

1. **Login to Cloudflare:**
```powershell
cloudflared tunnel login
```
(Opens browser - authorize)

2. **Create Named Tunnel:**
```powershell
cloudflared tunnel create smartphone-demo
```

Copy the Tunnel ID from output.

3. **Create config file** `C:\Users\<YourUser>\.cloudflared\config.yml`:

```yaml
tunnel: <YOUR-TUNNEL-ID>
credentials-file: C:\Users\<YourUser>\.cloudflared\<YOUR-TUNNEL-ID>.json

ingress:
  - hostname: smartphone-demo.your-domain.com
    service: http://localhost:8000
  - service: http_status:404
```

Or use a Cloudflare-provided domain (free):

```yaml
tunnel: <YOUR-TUNNEL-ID>
credentials-file: C:\Users\<YourUser>\.cloudflared\<YOUR-TUNNEL-ID>.json

ingress:
  - service: http://localhost:8000
```

4. **Route your tunnel** (if using custom domain):
```powershell
cloudflared tunnel route dns smartphone-demo smartphone-demo.your-domain.com
```

Or get the auto-generated URL:
```powershell
cloudflared tunnel info smartphone-demo
```

### Running with Named Tunnel:

**Terminal 1 - Backend:**
```powershell
cd backend
python main.py
```

**Terminal 2 - Named Tunnel:**
```powershell
cloudflared tunnel run smartphone-demo
```

**Update index.html:**
```javascript
const BACKEND = "https://smartphone-demo.your-domain.com";
```

---

## 🐛 Troubleshooting

### Error 1033: Tunnel Not Resolved

**Why it happens:**
- Quick tunnels expire after inactivity (~5-10 minutes)
- DNS propagation delay for new tunnels
- Cloudflare edge caching issues

**Solutions:**
1. Use named tunnels (Option B) - they're stable
2. For quick tunnels: restart and get new URL
3. Wait 30-60 seconds after starting tunnel before accessing

### NetworkError / CORS Error

**Check:**
1. Backend is running (`http://localhost:8000` should respond)
2. Cloudflare tunnel is active
3. BACKEND URL in index.html is correct (no trailing slash)
4. Browser console for specific errors

### ADB Not Found

```powershell
# Add ADB to PATH or use full path
$env:PATH += ";C:\path\to\platform-tools"
```

### Device Not Authorized

- Check phone screen for USB debugging prompt
- Run: `adb kill-server` then `adb start-server`

---

## 📦 Deploy Frontend (Optional)

### GitHub Pages (Free):
```powershell
git add .
git commit -m "Add frontend"
git push
# Enable in repo Settings > Pages
```

### Vercel (Free):
```powershell
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify (Free):
- Drag & drop `index.html` to https://app.netlify.com/drop

---

## 🎬 Production Tips

1. **Use named tunnels** - stable URLs
2. **Update CORS** in production to only allow your frontend domain:
   ```python
   allow_origins=["https://your-frontend-domain.com"]
   ```
3. **Add authentication** for production use
4. **Monitor tunnel** with systemd/PM2/Windows Service
5. **Use environment variables** for configuration

---

## 📊 Architecture

```
[Android Phone] <-USB/ADB-> [FastAPI Backend] <-Tunnel-> [Cloudflare Edge] <-HTTPS-> [Frontend]
    (Local)                    (localhost:8000)            (Public URL)              (Browser)
```

**Why this works:**
- Backend stays local (ADB requires USB)
- Cloudflare tunnel creates secure HTTPS endpoint
- Frontend can be hosted anywhere (static files)
- CORS allows cross-origin requests

---

## ✅ Success Checklist

- [ ] Backend responds at `http://localhost:8000/health`
- [ ] Tunnel shows "Connection established" in logs
- [ ] Frontend loads and shows "✅ Connected to backend!"
- [ ] Reserve button returns `{"status": "reserved"}`
- [ ] ADB commands execute (Run Test opens browser on phone)

