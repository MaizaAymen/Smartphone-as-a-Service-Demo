from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import subprocess
import uvicorn
import os
import time
import re

app = FastAPI(title="Smartphone-as-a-Service Demo", version="1.4")

# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# GLOBALS
# =========================
device_reserved = False
SCREENSHOT_PATH = "screenshot.png"
BROWSER_PACKAGE = "com.sec.android.app.sbrowser"
URL_TO_OPEN = "https://portfolio-teal-nine-41.vercel.app/"
battery_before_test = None

# =========================
# UTILS
# =========================
def run_cmd(cmd: str):
    """Run a shell command with subprocess"""
    try:
        out = subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT, timeout=15)
        return out.decode()
    except Exception as e:
        return str(e)

def device_connected():
    output = run_cmd("adb devices")
    lines = output.strip().split("\n")
    for line in lines[1:]:
        if "\tdevice" in line:
            return True
    return False

def extract_launch_time(output: str):
    """Extract TotalTime from am start -W"""
    match = re.search(r"TotalTime:\s*(\d+)", output)
    return int(match.group(1)) if match else None

def get_precise_battery_mAh():
    """
    Returns battery charge in mAh (float) using multiple methods
    """
    # Method 1: Try chargeCounter from batteryproperties
    output = run_cmd("adb shell dumpsys batteryproperties")
    match = re.search(r'chargeCounter:\s*(-?\d+)', output)
    if match:
        return int(match.group(1)) / 1000  # µAh to mAh
    
    # Method 2: Try dumpsys battery
    output = run_cmd("adb shell dumpsys battery")
    match = re.search(r'Charge counter:\s*(-?\d+)', output)
    if match:
        return int(match.group(1)) / 1000  # µAh to mAh
    
    # Method 3: Try reading directly from sysfs
    output = run_cmd("adb shell cat /sys/class/power_supply/battery/charge_counter")
    if output and output.strip().isdigit():
        return int(output.strip()) / 1000  # µAh to mAh
    
    # Method 4: Estimate from capacity percentage (rough estimate)
    output = run_cmd("adb shell dumpsys battery")
    level_match = re.search(r'level:\s*(\d+)', output)
    capacity_match = re.search(r'Charge\s*counter:\s*(\d+)', output)
    
    if level_match and capacity_match:
        level = int(level_match.group(1))
        # Rough estimate assuming typical phone battery ~3000-4000 mAh
        return level * 40  # Rough approximation
    
    return None

def extract_ram(mem_output):
    """Extract TOTAL PSS in MB"""
    match = re.search(r'TOTAL\s+(\d+)', mem_output)
    return int(match.group(1)) / 1024 if match else None  # MB

# =========================
# BASIC ENDPOINTS
# =========================
@app.get("/")
def root():
    return {"status": "backend alive", "message": "Smartphone-as-a-Service API"}

@app.get("/health")
def health():
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

@app.get("/release")
def release():
    global device_reserved
    device_reserved = False
    return {"status": "released"}

# =========================
# SCREENSHOT
# =========================
@app.get("/screenshot")
def get_screenshot():
    if not device_reserved:
        return {"error": "Device not reserved"}
    run_cmd(f"adb exec-out screencap -p > {SCREENSHOT_PATH}")
    if os.path.exists(SCREENSHOT_PATH):
        return FileResponse(SCREENSHOT_PATH, media_type="image/png")
    else:
        return {"error": "Failed to capture screenshot"}

# =========================
# PERFORMANCE TEST (Battery, CPU, RAM)
# =========================
@app.get("/run-test")
def run_test():
    if not device_reserved:
        return {"error": "Device not reserved"}

    # ---- BEFORE ----
    battery_before_mAh = get_precise_battery_mAh()
    print(f"DEBUG: Battery before: {battery_before_mAh}")
    ram_before = run_cmd(f"adb shell dumpsys meminfo {BROWSER_PACKAGE}")
    cpu_before = run_cmd(f"adb shell top -n 1 -b | findstr {BROWSER_PACKAGE}")

    # ---- LAUNCH TEST ----
    launch_output = run_cmd(f"adb shell am start -W -a android.intent.action.VIEW -d {URL_TO_OPEN}")
    launch_time_ms = extract_launch_time(launch_output)
    time.sleep(3)

    # ---- AFTER ----
    battery_after_mAh = get_precise_battery_mAh()
    print(f"DEBUG: Battery after: {battery_after_mAh}")
    ram_after = run_cmd(f"adb shell dumpsys meminfo {BROWSER_PACKAGE}")
    cpu_after = run_cmd(f"adb shell top -n 1 -b | findstr {BROWSER_PACKAGE}")

    # Take screenshot
    run_cmd(f"adb exec-out screencap -p > {SCREENSHOT_PATH}")

    # ---- CALCULATE DIFFERENCES ----
    ram_before_mb = extract_ram(ram_before)
    ram_after_mb = extract_ram(ram_after)
    ram_diff_mb = round(ram_after_mb - ram_before_mb, 2) if ram_before_mb and ram_after_mb else None

    # Calculate battery drain (positive = drain, negative = charge gain)
    if battery_before_mAh and battery_after_mAh:
        battery_drain_mAh = round(battery_before_mAh - battery_after_mAh, 6)
        print(f"DEBUG: Battery drain calculated: {battery_drain_mAh}")
    else:
        battery_drain_mAh = None
        print(f"DEBUG: Could not calculate drain - before: {battery_before_mAh}, after: {battery_after_mAh}")

    return {
        "launch_time_ms": launch_time_ms,
        "battery_before_mAh": battery_before_mAh,
        "battery_after_mAh": battery_after_mAh,
        "battery_drain_mAh": battery_drain_mAh,
        "ram_before_MB": ram_before_mb,
        "ram_after_MB": ram_after_mb,
        "ram_diff_MB": ram_diff_mb,
        "cpu_before": cpu_before.strip(),
        "cpu_after": cpu_after.strip(),
        "screenshot": "available" if os.path.exists(SCREENSHOT_PATH) else "failed"
    }

# =========================
# HARDWARE DELTA (Alias for /run-test)
# =========================
@app.get("/hardware-delta")
def hardware_delta():
    """Same as /run-test but with explicit naming for hardware metrics"""
    return run_test()

# =========================
# MAIN
# =========================
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
