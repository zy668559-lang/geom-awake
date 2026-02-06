# Maintenance & Troubleshooting Guide

## 🚨 Emergency: Server Won't Start / Port Occupied
If you encounter "Port 3000 is in use" or the development server hangs/fails to start.

### 1. Kill Lingering Node Processes
The most common cause is a previous `next dev` process that didn't close properly.

**Command (CMD):**
```cmd
taskkill /F /IM node.exe
```

**Command (PowerShell):**
```powershell
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
```

### 2. Clear Next.js Lock File
Sometimes the lock file remains after a crash.

**Check/Delete:**
- Delete the file: `.next/dev/lock`

### 3. Verification
After running the above:
1. Run `npm run dev` again.
2. Confirm it starts on `localhost:3000`.
