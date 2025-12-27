from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import uvicorn

app = FastAPI(
    title="Smartphone-as-a-Service Demo",
    version="1.0"
)

# =========================
# CORS (ALLOW FRONT HOSTED ANYWHERE)
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # OK for demo - in production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device_reserved = False


def run_cmd(cmd: str):
    try:
        out = subprocess.check_output(
            cmd,
            shell=True,
            stderr=subprocess.STDOUT,
            timeout=10
        )
        return out.decode()
    except Exception as e:
        return str(e)


def device_connected():
    output = run_cmd("adb devices")
    # Check if any line ends with "device" (connected device)
    # Excludes "List of devices attached" line
    lines = output.strip().split('\n')
    for line in lines[1:]:  # Skip first line "List of devices attached"
        if line.strip() and '\tdevice' in line:
            return True
    return False


@app.get("/")
def root():
    return {"status": "backend alive", "message": "Smartphone-as-a-Service API"}

@app.get("/health")
def health():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "device_connected": device_connected(),
        "device_reserved": device_reserved
    }


@app.get("/reserve")
def reserve():
    global device_reserved

    if not device_connected():
        return {"error": "No phone connected"}

    if device_reserved:
        return {"status": "busy"}

    device_reserved = True
    return {"status": "reserved"}


@app.get("/run-test")
def run_test():
    if not device_reserved:
        return {"error": "Device not reserved"}

    run_cmd(
        "adb shell am start -a android.intent.action.VIEW -d https://example.com"
    )

    return {"status": "browser opened"}


@app.get("/metrics")
def metrics():
    if not device_reserved:
        return {"error": "Device not reserved"}

    return {
        "battery": run_cmd("adb shell dumpsys battery"),
        "cpu": run_cmd("adb shell top -n 1 -b"),
        "memory": run_cmd("adb shell dumpsys meminfo")
    }


@app.get("/release")
def release():
    global device_reserved
    device_reserved = False
    return {"status": "released"}


if __name__ == "__main__":
    # Run with uvicorn on port 8000
    # This ensures FastAPI runs with proper ASGI server
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
