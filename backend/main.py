from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import time

app = FastAPI(
    title="Smartphone-as-a-Service Demo",
    description="Minimal prototype for remote smartphone experimentation",
    version="1.0"
)

# ✅ CORS CONFIGURATION (IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all (OK for demo)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device_reserved = False


def run_cmd(cmd: str):
    return subprocess.getoutput(cmd)


@app.get("/reserve")
def reserve_device():
    global device_reserved

    if device_reserved:
        return {"status": "busy"}

    device_reserved = True
    return {"status": "reserved"}


@app.get("/run-test")
def run_browser_test():
    if not device_reserved:
        return {"error": "Device not reserved"}

    run_cmd(
        "adb shell am start -a android.intent.action.VIEW -d https://example.com"
    )

    return {"status": "browser test started"}


@app.get("/metrics")
def collect_metrics():
    if not device_reserved:
        return {"error": "Device not reserved"}

    battery = run_cmd("adb shell dumpsys battery")
    cpu = run_cmd("adb shell top -n 1")
    memory = run_cmd("adb shell dumpsys meminfo")

    return {
        "battery": battery,
        "cpu": cpu,
        "memory": memory
    }


@app.get("/release")
def release_device():
    global device_reserved
    device_reserved = False
    return {"status": "released"}
