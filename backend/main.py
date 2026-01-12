from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import subprocess
import os
import time

# Create the app
app = FastAPI()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Settings
device_is_busy = False
screenshot_file = "screenshot.png"
test_url = "https://portfolio-teal-nine-41.vercel.app/"

# Run a command on the phone
def run_command(command):
    try:
        result = subprocess.check_output(command, shell=True, timeout=15)
        return result.decode()
    except:
        return ""

# Check if phone is connected
def phone_connected():
    output = run_command("adb devices")
    if "device" in output:
        return True
    return False

# Main page
@app.get("/")
def home():
    return {"message": "Backend is running"}

# Check status
@app.get("/health")
def check_health():
    connected = phone_connected()
    return {
        "status": "ok",
        "phone_connected": connected,
        "phone_busy": device_is_busy
    }

# Reserve the phone
@app.get("/reserve")
def reserve_phone():
    global device_is_busy
    
    if not phone_connected():
        return {"error": "No phone connected"}
    
    if device_is_busy:
        return {"status": "busy"}
    
    device_is_busy = True
    return {"status": "reserved"}

# Release the phone
@app.get("/release")
def release_phone():
    global device_is_busy
    device_is_busy = False
    return {"status": "released"}

# Take a screenshot
@app.get("/screenshot")
def take_screenshot():
    if not device_is_busy:
        return {"error": "Phone not reserved"}
    
    run_command(f"adb exec-out screencap -p > {screenshot_file}")
    
    if os.path.exists(screenshot_file):
        return FileResponse(screenshot_file, media_type="image/png")
    else:
        return {"error": "Screenshot failed"}

# Run a test
@app.get("/run-test")
def run_test(url: str = None):
    if not device_is_busy:
        return {"error": "Phone not reserved"}
    
    # Use provided URL or default
    if url:
        website = url
    else:
        website = test_url
    
    # Get battery level before
    battery_output = run_command("adb shell dumpsys battery")
    battery_before = 0
    for line in battery_output.split("\n"):
        if "level:" in line:
            battery_before = int(line.split(":")[1].strip())
    
    # Open the website
    run_command(f"adb shell am start -a android.intent.action.VIEW -d {website}")
    time.sleep(3)
    
    # Get battery level after
    battery_output = run_command("adb shell dumpsys battery")
    battery_after = 0
    for line in battery_output.split("\n"):
        if "level:" in line:
            battery_after = int(line.split(":")[1].strip())
    
    # Calculate battery change
    battery_change = battery_before - battery_after
    
    # Take screenshot
    run_command(f"adb exec-out screencap -p > {screenshot_file}")
    
    return {
        "battery_before": battery_before,
        "battery_after": battery_after,
        "battery_used": battery_change,
        "screenshot": "available" if os.path.exists(screenshot_file) else "failed"
    }

# Start the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
