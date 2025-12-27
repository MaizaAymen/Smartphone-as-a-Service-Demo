# 📱 Smartphone-as-a-Service Demo

> Control a real Android smartphone remotely via web browser - Perfect for testing, automation, and demos.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Tunnel-F38020?logo=cloudflare)](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
[![ADB](https://img.shields.io/badge/ADB-Enabled-3DDC84?logo=android)](https://developer.android.com/tools/adb)

## 🎯 What This Does

- **Backend**: FastAPI server controlling Android phone via ADB (USB connection)
- **Frontend**: Static HTML/JS interface accessible from anywhere
- **Tunnel**: Cloudflare Tunnel exposes local backend with HTTPS (free, no port forwarding)

## 🚀 Quick Start

See **[START.md](START.md)** for detailed setup instructions.

### 1. Install Dependencies
```powershell
cd backend
pip install -r requirements.txt
```

### 2. Start Backend
```powershell
python main.py
# Or double-click: run-backend.bat
```

### 3. Start Cloudflare Tunnel
```powershell
cloudflared tunnel --url http://localhost:8000
# Or double-click: run-quick-tunnel.bat
```

### 4. Update Frontend
Copy the tunnel URL and update in [index.html](index.html):
```javascript
const BACKEND = "https://your-tunnel-url.trycloudflare.com";
```

### 5. Open Frontend
Open `index.html` in your browser or deploy to Vercel/Netlify.

## 📐 Architecture

```
┌─────────────┐     USB/ADB      ┌─────────────┐     Cloudflare      ┌─────────────┐
│   Android   │ ◄──────────────► │   FastAPI   │ ◄───────Tunnel────► │  Frontend   │
│    Phone    │                  │   Backend   │      (HTTPS)        │  (Browser)  │
└─────────────┘                  └─────────────┘                     └─────────────┘
   (Local)                        localhost:8000                       (Anywhere)
```

## 🔧 Tech Stack

- **Backend**: Python + FastAPI + ADB
- **Frontend**: Vanilla JavaScript (no frameworks)
- **Tunnel**: Cloudflare Tunnel (free, secure HTTPS)
- **Device Control**: Android Debug Bridge (ADB)

## ✨ Features

- ✅ Reserve/Release phone for testing
- ✅ Run automated browser tests
- ✅ Get real-time device metrics (battery, CPU, memory)
- ✅ CORS-enabled for remote access
- ✅ Health check endpoint
- ✅ Error handling and logging

## 🎬 Demo Use Cases

1. **Remote Testing**: Test mobile websites from any device
2. **CI/CD Integration**: Automate mobile testing in pipelines
3. **Demo/Presentation**: Show live phone control in interviews
4. **Device Lab**: Share physical devices across team

## 🛡️ Security Note

This demo uses `allow_origins=["*"]` for CORS. For production:
```python
allow_origins=["https://your-frontend-domain.com"]
```

## 📚 Documentation

- [START.md](START.md) - Complete setup guide
- [Troubleshooting](START.md#-troubleshooting) - Common issues and solutions

## 🤝 Contributing

Issues and PRs welcome!

## 📄 License

MIT - See [LICENSE](LICENSE)

---

**Made with ❤️ for DevOps demos and mobile automation**