# 🔍 Why Quick Tunnels Break & How to Fix Error 1033

## The Problem

**Quick tunnels** (`cloudflared tunnel --url`) are temporary development tools that:

1. ❌ Change URL every time you restart
2. ❌ Expire after ~10 minutes of inactivity
3. ❌ Have no guaranteed availability
4. ❌ Can't be monitored or managed
5. ❌ Cause Error 1033 when DNS hasn't propagated

## Error 1033 Explained

```
Error 1033: Argo Tunnel error
```

**Root Causes:**
1. **DNS Propagation**: New tunnel URL not yet propagated to Cloudflare's edge
2. **Tunnel Disconnected**: Backend process stopped
3. **Tunnel Expired**: Quick tunnel timed out
4. **Wrong URL**: Frontend using old/incorrect tunnel URL

## ✅ Solution: Named Tunnels (Production-Ready)

### Why Named Tunnels Are Better

| Feature | Quick Tunnel | Named Tunnel |
|---------|-------------|--------------|
| URL Stability | ❌ Changes | ✅ Permanent |
| Uptime | ❌ Limited | ✅ 24/7 |
| Configuration | ❌ None | ✅ Full control |
| Monitoring | ❌ No | ✅ Dashboard |
| Cost | Free | Free |

### Setup Named Tunnel (5 minutes)

#### Step 1: Login to Cloudflare
```powershell
cloudflared tunnel login
```
- Opens browser
- Choose your domain (or use Cloudflare's free subdomain)
- Authorize

#### Step 2: Create Tunnel
```powershell
cloudflared tunnel create smartphone-demo
```

Output:
```
Tunnel credentials written to C:\Users\YourName\.cloudflared\<TUNNEL-ID>.json
Created tunnel smartphone-demo with id <TUNNEL-ID>
```

**Save this Tunnel ID!**

#### Step 3: Configure Tunnel

Create `C:\Users\<YourName>\.cloudflared\config.yml`:

```yaml
tunnel: YOUR-TUNNEL-ID-FROM-STEP-2
credentials-file: C:\Users\YourName\.cloudflared\YOUR-TUNNEL-ID.json

ingress:
  - service: http://localhost:8000
```

Or copy from [.cloudflared/config-template.yml](.cloudflared/config-template.yml)

#### Step 4: Get Your Permanent URL

```powershell
cloudflared tunnel info smartphone-demo
```

Output will show your permanent URL like:
```
https://smartphone-demo-<random>.cfargotunnel.com
```

Or use your custom domain:
```powershell
# Setup DNS (if you own a domain)
cloudflared tunnel route dns smartphone-demo smartphone-demo.yourdomain.com
```

#### Step 5: Run Named Tunnel
```powershell
# Start backend first
cd backend
python main.py

# In another terminal
cloudflared tunnel run smartphone-demo
```

#### Step 6: Update Frontend

In [index.html](index.html):
```javascript
const BACKEND = "https://smartphone-demo-<random>.cfargotunnel.com";
// Or your custom domain:
// const BACKEND = "https://smartphone-demo.yourdomain.com";
```

## 🎯 Running Order (Important!)

### ❌ Wrong Order (Causes Errors)
```
1. Start tunnel first   ← No backend running!
2. Start backend        ← Tunnel already looking for port 8000
3. Tunnel can't connect ← Error 1033
```

### ✅ Correct Order
```
1. Start backend        → Listening on localhost:8000
2. Start tunnel         → Connects to localhost:8000
3. Test connection      → Open frontend
```

### Complete Startup Sequence

**Terminal 1 - Backend:**
```powershell
cd backend
python main.py
```
Wait for: `Uvicorn running on http://127.0.0.1:8000`

**Terminal 2 - Tunnel:**
```powershell
# Quick tunnel (testing):
cloudflared tunnel --url http://localhost:8000

# OR Named tunnel (production):
cloudflared tunnel run smartphone-demo
```
Wait for: `Connection registered` or `Registered tunnel connection`

**Terminal 3 - Test:**
```powershell
# Test locally first
curl http://localhost:8000/health

# Then test via tunnel
curl https://your-tunnel-url/health
```

**Browser:**
- Open `index.html`
- Should see: "✅ Connected to backend!"

## 🐛 Common Issues & Fixes

### Issue: "Cannot reach backend"

**Check:**
```powershell
# Is backend running?
curl http://localhost:8000/health

# Is tunnel active?
# Look for "Connection registered" in tunnel logs
```

**Fix:**
1. Restart backend first
2. Then restart tunnel
3. Wait 30 seconds
4. Reload frontend

### Issue: Error 1033 persists

**Fix:**
1. Stop tunnel: `Ctrl+C`
2. Verify backend: `curl http://localhost:8000/health`
3. Restart tunnel
4. Wait for "Connection registered" message
5. Test with curl before using frontend

### Issue: CORS Error

**Check browser console:** `F12` → Console tab

**If you see:**
```
Access to fetch at 'https://...' has been blocked by CORS policy
```

**Fix:**
1. Verify [main.py](backend/main.py) has proper CORS:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

2. Restart backend
3. Clear browser cache: `Ctrl+Shift+Delete`

### Issue: Tunnel disconnects randomly

**For Quick Tunnels:**
- Expected behavior - use named tunnels

**For Named Tunnels:**
```powershell
# Check tunnel status
cloudflared tunnel info smartphone-demo

# Check tunnel logs for errors
cloudflared tunnel run smartphone-demo --loglevel debug
```

## 📊 Tunnel Lifecycle

### Quick Tunnel
```
Start → Generate URL → Active → Idle (10min) → Expire → New URL needed
```

### Named Tunnel
```
Setup (once) → Start → Active → Stop → Resume (same URL) → Repeat
```

## 🔒 Security Best Practices

### For Demos/Development
```python
allow_origins=["*"]  # OK - any frontend can access
```

### For Production
```python
allow_origins=[
    "https://your-frontend.vercel.app",
    "https://your-frontend.netlify.app"
]  # Only specific domains
```

## 🎯 Pro Tips

1. **Test locally first**: Always verify `localhost:8000` works before using tunnel
2. **Monitor tunnel logs**: Keep terminal visible to see connection status
3. **Use health endpoint**: Check `/health` to verify everything works
4. **Save tunnel URL**: Document it in your frontend code/env vars
5. **Automate startup**: Use batch files for consistent order

## 📦 Alternative: Run as Windows Service

For permanent setup, run tunnel as a service:

```powershell
# Install as service
cloudflared service install

# Configure in: C:\Windows\System32\config\systemd\cloudflared\config.yml
```

Then tunnel runs on boot, no manual start needed.

## ✅ Verification Checklist

- [ ] Backend responds: `curl http://localhost:8000/health`
- [ ] Tunnel shows: "Connection registered"
- [ ] Public URL works: `curl https://your-tunnel/health`
- [ ] Frontend connects: See "✅ Connected" message
- [ ] No console errors: Check browser F12 Console
- [ ] Commands execute: Reserve button works

## 🆘 Still Stuck?

1. Check [START.md](START.md) for full setup
2. Review logs in both terminals
3. Test each component separately:
   - Backend: `curl localhost:8000/health`
   - Tunnel: Check for "Connection registered"
   - Frontend: Open browser console (F12)

---

**Remember**: Backend → Tunnel → Frontend (in that order!)
