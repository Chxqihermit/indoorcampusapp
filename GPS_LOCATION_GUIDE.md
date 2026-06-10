# GPS Location Setup Guide

## Overview

The "📍 My Location" button in CampusNav allows you to automatically set your current GPS location as the navigation start point. This guide helps you troubleshoot any issues.

---

## How to Use GPS Location

There are **three ways** to set your current GPS location as the starting point:

### Method 1: Click the GPS Button (Easiest)
1. **Open the Campus Map** - Navigate to the main dashboard
2. **Look for the blue button** - "📍 Use My Current Location" (prominent blue button below the start location input)
3. **Click the button** - Your device will request permission to access your location
4. **Grant Permission** - When prompted, click "Allow" to share your location
5. **Wait for location** - Button shows "📍 Locating…" while acquiring GPS signal
6. **Route will auto-start** - Once location is acquired, it's set as your starting point and map centers on you

### Method 2: Press "G" Keyboard Shortcut
1. **Open the Campus Map**
2. **Press the "G" key** - This instantly triggers GPS location detection
3. **Grant Permission** (if first time) - Allow location access when prompted
4. **Done!** - Your location will be automatically set and map will center on you

### Method 3: Manual Map Click (Backup)
1. Click "Set Start" button
2. Click on the map where you are
3. Use this if GPS is unavailable

---

## ⚡ Quick Tips

- **Fastest way to use GPS?** Press the **"G" key** - one keypress!
- **On mobile?** Use the blue **"📍 Use My Current Location"** button
- **GPS not working?** Move outdoors to open area with clear sky
- **Outdoor button not visible?** Scroll down in the control panel if needed
- **Want manual control?** Use "Set Start" button to click anywhere on map

---

### Browser Requirements
- ✓ Chrome/Chromium (v50+)
- ✓ Firefox (v3.5+)
- ✓ Safari (v6+)
- ✓ Edge (all versions)

**Not supported:** Internet Explorer

### Device Requirements
- ✓ GPS/Location capability (smartphone, tablet, laptop with GPS)
- ✓ WiFi or cellular data
- ✓ GPS enabled on your device
- ✓ Clear line of sight to sky (outdoors works best)

### Connection Requirements
- ✓ HTTPS connection (secure)
- ✓ OR localhost/127.0.0.1 (local development)

## 🎮 Keyboard Shortcuts

| Key | Action | Notes |
|-----|--------|-------|
| **G** | Use Current GPS Location | Instantly triggers GPS location detection |
| Shift + ↑ | Increase 3D pitch | Tilt view upward |
| Shift + ↓ | Decrease 3D pitch | Tilt view downward |
| Shift + ← | Rotate counterclockwise | Rotate map left |
| Shift + → | Rotate clockwise | Rotate map right |

---

### Problem 1: "Permission Denied" Error

**What happens:** Error message says "Permission denied" or GPS button does nothing after clicking.

**Solution:**

#### For Chrome/Edge:
1. Click the **🔒 lock icon** in the address bar (left of URL)
2. Find **"Location"** in the list
3. Change setting to **"Allow"**
4. Refresh the page (F5 or Ctrl+R)
5. Try the GPS button again

#### For Firefox:
1. Click the **🔒 lock icon** in the address bar
2. Click the arrow next to "Permissions"
3. Find **"Access Your Location"**
4. Change to **"Allow"**
5. Refresh the page and try again

#### For Safari (macOS/iOS):
1. Go to **Preferences** → **Privacy** → **Location Services**
2. Enable Location Services
3. Find Safari in the list and set to **"Allow"**
4. Refresh the page and try again

---

### Problem 2: "Location Unavailable" Error

**What happens:** Error message says "Your device could not determine your location."

**Solution:**

1. **Enable GPS:**
   - On phone: Settings → Location → Turn ON
   - On laptop: Ensure you have a GPS module or use WiFi triangulation
   
2. **Go outside or near a window:**
   - GPS works better with clear sky visibility
   - Indoors, move to a window or open area
   
3. **Wait for GPS lock:**
   - GPS can take 30-60 seconds to acquire a signal
   - The button timeout is 30 seconds - if it fails, try again
   
4. **Restart your location service:**
   - On phone: Toggle Location OFF and back ON
   - On laptop: Try a different browser

---

### Problem 3: "Request Timed Out" Error

**What happens:** Takes longer than 30 seconds and fails.

**Solution:**

1. **Move to a location with better GPS signal:**
   - Get closer to the building edges
   - Avoid large structures blocking sky view
   - Open parking lots work best

2. **Try again:**
   - GPS signal acquisition can be intermittent
   - Click the button multiple times if needed

3. **Use a different device:**
   - Try a phone with better GPS hardware
   - Some laptops have weak or no GPS

---

### Problem 4: "Geolocation Not Supported" Error

**What happens:** Error says geolocation is not supported.

**Solution:**

1. **Check your browser:**
   - Use Chrome, Firefox, Safari, or Edge
   - Update to the latest version
   - Avoid Internet Explorer

2. **Check your connection:**
   - Ensure you're on HTTPS (lock icon in address bar)
   - OR access from localhost (http://localhost:8000)
   - NOT plain HTTP on a remote server

3. **Check your device:**
   - Your device might not have GPS capability
   - Virtual machines may not support geolocation
   - Try on a smartphone instead

---

### Problem 5: No "My Location" Button Visible

**What happens:** Can't find the GPS button on the map.

**Solution:**

1. **Look in the right place:**
   - Button is in the **Start Location** section
   - Near the text input field
   - Has emoji: **📍**

2. **Check zoom level:**
   - Make sure the map has fully loaded
   - Wait 2-3 seconds after opening the map

3. **Check browser console for errors:**
   - Press F12 to open Developer Tools
   - Click "Console" tab
   - Look for red error messages
   - Screenshot and share error details if stuck

---

### Problem 6: Location Not Accurate or Wrong Position

**What happens:** GPS location is off campus or very inaccurate.

**Solution:**

1. **Accuracy is ±15-50m normally:**
   - Urban areas: ±15-30m
   - Open campus: ±20-40m
   - Indoor/dense area: ±50-100m
   - This is normal GPS accuracy!

2. **Improve accuracy:**
   - Move to an open area away from buildings
   - Wait 30-60 seconds for signal to lock
   - Disable WiFi (sometimes WiFi location is less accurate)
   - Update your device's GPS/location database

3. **Manual adjustment:**
   - Use GPS as approximate location
   - Fine-tune start point by clicking on the map directly
   - Or use the search/building name feature

---

## 🔍 Debug Information

### Checking Browser Console Logs

If GPS isn't working, check the debug logs:

1. **Open Developer Tools:** Press `F12`
2. **Go to Console tab**
3. **Look for messages starting with:**
   - `✓ GPS location acquired:` - Success!
   - `Geolocation error code:` - Error details
   - `Geolocation API not available` - Browser issue
   - `Geolocation requires HTTPS` - Connection issue

### Error Codes Reference

| Error | Meaning | Fix |
|-------|---------|-----|
| **PERMISSION_DENIED (1)** | User rejected permission | Grant permission in browser settings |
| **POSITION_UNAVAILABLE (2)** | Device can't get GPS signal | Move outdoors, enable GPS, try again |
| **TIMEOUT (3)** | GPS took too long to respond | Try in area with better signal |
| **Unknown** | Browser/system issue | Check console, update browser |

---

## 🚀 Testing GPS

### Quick Test (No Map Needed)

Go to: **https://www.whatsmyposition.com/**

This tests if your device's GPS is working at all.

### Full Test on CampusNav

1. Open CampusNav on your device
2. Click "📍 My Location" button
3. You should see your location on the map
4. Check accuracy shown (e.g., "±25m")

---

## 💡 Tips for Best Results

1. **Best times:**
   - Outdoors with clear sky
   - Away from buildings
   - In open areas (parking lot, quad, etc.)

2. **Avoid:**
   - Indoors or under trees
   - Tunnels or covered areas
   - Between tall buildings
   - Underground parking

3. **If all else fails:**
   - Click "Set Start" manually on the map
   - Use building name search
   - Select a known campus location

---

## 📞 Still Having Issues?

### Collect Debug Information

If you need help, please provide:

1. **Browser & Version:** (e.g., Chrome 120.0)
2. **Device:** (e.g., iPhone 14, Windows Laptop)
3. **Location:** (e.g., NUST Campus, Windhoek)
4. **Error message:** (exact text from alert)
5. **Console logs:** (open F12, copy relevant messages)
6. **Screenshot:** (of the error message)

### Check These Resources

- [MDN Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Can I Use Geolocation](https://caniuse.com/geolocation)
- [Browser Support Matrix](https://caniuse.com/geolocation)

---

## 🔐 Privacy & Security

- ✓ GPS data is **only used on your device**
- ✓ Location is **never stored** on the server
- ✓ Location is **never shared** with third parties
- ✓ You can **revoke permission** anytime in browser settings
- ✓ Each session requires fresh permission grant

---

## Recent Improvements (v1.2)

- ✅ **Prominent GPS Button** - Blue "Use My Current Location" button is now clearly visible in the control panel
- ✅ **Keyboard Shortcut** - Press "G" to instantly use GPS location (no clicking needed!)
- ✅ **Increased timeout** from 10s to 30s (more reliable)
- ✅ **Better error messages** with specific instructions for each error type
- ✅ **HTTPS/localhost detection** with helpful warnings
- ✅ **Shows accuracy** (±Xm) when location is acquired
- ✅ **Auto-centers map** on your location
- ✅ **Better visual feedback** (opacity change + "Locating…" text while loading)
- ✅ **Console logging** for debugging

---

**Last Updated:** June 2025
**Version:** 1.1
