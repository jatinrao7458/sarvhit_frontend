# Event Publishing - Debugging & Testing Guide

## Quick Start Test

### Step 1: Verify Servers Are Running

**Terminal 1 - Backend Server:**
```bash
cd Sarvhit/server
npm start
```
Expected output: `Server running on port 5005`

**Terminal 2 - Frontend Server:**
```bash
cd Sarvhit/client
npm run dev
```
Expected output: `VITE v... ready in ... ms` and `➜  Local: http://localhost:5174`

---

## Step 2: Browser Console Debugging

Open your browser and go to http://localhost:5174

1. **Open Developer Tools:** Press `F12` or `Ctrl+Shift+I`
2. **Go to Console Tab:** Click the "Console" tab
3. **Look for Auth Context Initialization Logs:**
   ```
   === AUTH CONTEXT INITIALIZED ===
   API_BASE_URL: http://localhost:5005/api
   VITE_API_URL from .env: http://localhost:5005/api
   Environment: development
   ```

If you don't see these logs, the frontend hasn't reloaded with the new .env file. **Hard refresh:** Press `Ctrl+F5` or `Cmd+Shift+R`

---

## Step 3: Clear Browser Cache & Local Storage

3. In DevTools, go to **Application** tab
4. Click **Storage** → **Local Storage** → Select localhost:5174
5. **Clear all** (or just clear token and user data)
6. Close DevTools

---

## Step 4: Test NGO Event Creation

1. **Login as NGO User**
   - Email: `ngo@example.com`
   - Password: `password123`
   - If this doesn't work, sign up as a new NGO user

2. **Navigate to Create Event**
   - Click on your NGO profile or find "Create Event" button
   - Fill in the form:
     - **Event Title:** "Test Event for Debugging"
     - **Description:** "Testing event publishing"
     - **Cause:** "Education"
     - **Date:** Pick any future date
     - **Time:** Pick any time
     - **Location:** "Test Location"
     - **Spots:** 50
     - **Organization Name:** Should be auto-filled

3. **Click "Publish Event"**

---

## Step 5: Check Console Logs During Publishing

When you click "Publish Event", you should see logs appear:

### Expected Success Logs:
```
=== EVENT SERVICE: CREATE EVENT ===
API_BASE_URL: http://localhost:5005/api
Full URL: http://localhost:5005/api/events
Token present: true
Event data: {title: "Test Event...", ...}
Response status: 201
Response statusText: Created
Response ok: true
Event created successfully: {success: true, event: {...}}
Event created successfully: {success: true, ...}
```

### If You See an Error:

#### Error 1: "Cannot connect to server"
```
Error message: Failed to fetch
```
**Solution:**
- Check if backend is running on port 5005
- Run: `npm start` in server folder
- Check firewall settings

#### Error 2: "Invalid token"
```
Error message: Invalid token
```
**Solution:**
- You're logged out
- Log back in and try again

#### Error 3: CORS Error in Console
```
Access to XMLHttpRequest at 'http://localhost:5005/api/events' from origin 'http://localhost:5174' 
has been blocked by CORS policy
```
**Solution:**
- Backend CORS isn't configured correctly
- Run: `npm start` to restart backend with correct CORS settings

---

## Step 6: Verify in Backend Logs

Open the terminal running the backend server. You should see:

### Expected Backend Logs:
```
2024-03-19T15:30:45.123Z - POST /api/events
Creating event: {title: "Test Event for Debugging", isPublished: true, organizerId: "..."}
Event saved successfully: 65f8c9a1b2c3d4e5f6g7h8i9 true
```

If you don't see the POST request, the frontend request isn't reaching the backend.

---

## Step 7: Database Verification

1. Open MongoDB (locally or via MongoDB Atlas)
2. Navigate to: `database_name` → `events` collection
3. Look for your newly created event
4. Verify fields:
   - `title`: Your event title
   - `isPublished`: `true`
   - `organizerId`: Your user ID
   - `createdAt`: Recent timestamp

---

## Complete Troubleshooting Checklist

### ✓ Prerequisites
- [ ] Node.js and npm installed
- [ ] Backend running on port 5005
- [ ] Frontend running on port 5174
- [ ] MongoDB connected

### ✓ Configuration
- [ ] `.env` file exists in `client/` folder
- [ ] `.env` contains: `VITE_API_URL=http://localhost:5005/api`
- [ ] Frontend has been restarted after creating `.env`
- [ ] Browser console shows correct API_BASE_URL logs

### ✓ Authentication
- [ ] Logged in as NGO user
- [ ] Token exists in localStorage
- [ ] Token is valid (not expired)

### ✓ Network
- [ ] No firewall blocking port 5005
- [ ] Backend server responding to requests
- [ ] CORS configured to allow port 5174

### ✓ Browser
- [ ] No ad blockers interfering
- [ ] JavScriptEnabled
- [ ] No console errors before publishing

### ✓ Form Validation
- [ ] All required fields filled
- [ ] Event date is in the future (or current date)
- [ ] Spots is a number > 0
- [ ] No special characters causing issues

---

## Quick Test Command

Copy the exact curl command below and run it in a terminal to test if your backend is responding to event creation:

```bash
curl -X POST http://localhost:5005/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token_here" \
  -d '{
    "title":"Test Event",
    "cause":"Education",
    "date":"2024-03-25",
    "time":"10:00",
    "location":"Test Location",
    "description":"Test Description",
    "orgName":"Test NGO",
    "spots":50
  }'
```

**Expected Response:**
```json
{"success":true,"message":"Event created successfully","event":{...}}
```

**Error Response:**
```json
{"error":"Invalid token"}
```

Replace `your_token_here` with your actual JWT token from localStorage.

---

## Common Issues & Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| Backend not running | "Cannot connect to server" | Run `npm start` in server folder |
| Wrong port | API calls fail silently | Verify backend is on 5005, frontend references 5005 |
| Stale .env | API URL still points to old port | Restart frontend with `npm run dev` |
| Token expired | "Invalid token" error | Log out and log back in |
| Database not connected | Backend errors | Check MongoDB connection, restart backend |
| Browser cache | Old code running | Hard refresh: `Ctrl+F5` |
| CORS issue | "Not allowed by CORS" | Check server.js CORS config, restart backend |

---

## Need More Help?

If the event still doesn't publish:

1. **Check Backend Logs:** What errors appear when you try to create an event?
2. **Check Browser Console:** Press F12 and look for red error messages
3. **Check Network Tab:** Go to DevTools → Network → Try creating event → Look for failed/red requests

Share the exact error messages and we can debug further!
