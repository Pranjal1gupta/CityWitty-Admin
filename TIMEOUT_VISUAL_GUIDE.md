# Session Timeout - Visual Guide

## 📊 Timer Display in Navbar

The session timer is displayed at the bottom of the navbar in a dedicated bar:

### Normal State (> 3 minutes remaining)
```
┌─────────────────────────────────────────────────────────────┐
│ 🕐 Session expires in: 09:45                               │
└─────────────────────────────────────────────────────────────┘
```
- Gray text color
- No warning message
- User is actively using the dashboard

### Warning State (< 3 minutes remaining, shows at 1 minute)
```
┌─────────────────────────────────────────────────────────────┐
│ 🕐 Session expires in: 00:45  [⚠️ Warning Message...]      │
└─────────────────────────────────────────────────────────────┘
```
- Orange/Red text color
- Red pulsing animation
- Warning message: "Move your mouse to stay logged in"
- Toast notification appears

### Timeline Example

**T = 0:00** (Just Logged In)
- Timer: 10:00
- Color: Gray
- Status: ✅ Active session

**T = 5:00** (User idle for 5 minutes)
- Timer: 05:00
- Color: Gray
- Status: ✅ Counting down

**T = 7:00** (User idle for 7 minutes)
- Timer: 03:00
- Color: Orange (< 3 min warning)
- Status: ⚠️ Warning state approaching

**T = 9:00** (User idle for 9 minutes)
- Timer: 01:00
- Color: Red + Pulsing
- Status: 🔴 CRITICAL - Warning shown
- Toast: "Your session will expire in 1 minute due to inactivity"

**T = 10:00** (User idle for 10 minutes - NO ACTIVITY)
- ❌ Session Expired
- Auto-logout triggered
- Redirect to login page
- Toast: "Session expired due to inactivity. Please log in again."

**If User Moves Mouse/Types at T = 7:30**
- Timer resets to: 10:00
- Color: Gray
- Status: ✅ Session extended

## 🔄 Activity Detection

The timer tracks these user interactions:
- 🖱️ Mouse movement (mousedown)
- ⌨️ Keyboard input (keydown)
- 📜 Page scroll
- 👆 Touch events
- 🖱️ Clicks

Any of these actions will:
1. Reset the timer to 10:00
2. Clear the warning state
3. Change color back to gray
4. Dismiss any warning messages

## 🎨 Color Coding Reference

| Color | State | Time Remaining | Action |
|-------|-------|-----------------|--------|
| Gray 🔘 | Normal | > 3 minutes | Continue working |
| Orange 🔘 | Caution | < 3 minutes | Increased awareness |
| Red 🔘 | Critical | < 1 minute | MOVE MOUSE TO STAY |
| Pulse 📍 | Warning | Last 60 seconds | Move to reset timer |

## 📍 Where to Find the Timer

```
┌──────────────────────────────────────────────────────────────────┐
│                     NAVBAR (Top Section)                         │
├──────────────────────────────────────────────────────────────────┤
│  [Menu] Page Title          [🔔] [👤 Admin ▼]                   │
├──────────────────────────────────────────────────────────────────┤
│  🕐 Session expires in: 09:45                                    │
├──────────────────────────────────────────────────────────────────┤
│                     PAGE CONTENT                                  │
│                                                                   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

The timer bar appears just below the main navbar, before the page content.

## 🔧 Customization Options

### Change Timeout Duration
Edit `contexts/AuthContext.tsx`:
```typescript
const SESSION_TIMEOUT = 10 * 60;  // Change 10 to desired minutes
```

Examples:
- `5 * 60` = 5 minutes
- `15 * 60` = 15 minutes
- `30 * 60` = 30 minutes

### Change Warning Threshold
Edit `contexts/AuthContext.tsx`:
```typescript
const WARNING_THRESHOLD = 60;  // Change to desired seconds
```

Examples:
- `30` = Warning at 30 seconds
- `120` = Warning at 2 minutes
- `180` = Warning at 3 minutes

## 💡 Best Practices

1. **Acknowledge the Warning**: When you see the red timer, move your mouse or type to reset
2. **Regular Activity**: The timer resets with normal dashboard usage
3. **Before Deadline**: If nearing timeout, ensure you save your work
4. **Multiple Tabs**: Session timeout is per-window/tab
5. **Security**: Automatic logout protects your account from unauthorized access

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Timer not showing | Ensure you're logged in and on a dashboard page |
| Timer not resetting | Check if mouse/keyboard events are working properly |
| Auto-logout not working | Verify browser allows setTimeout/setInterval |
| Warning not appearing | Check browser console for errors |
| Can't stay logged in | Activity detection may be blocked - try moving mouse more frequently |

## 📞 Support

For issues or questions about the session timeout feature:
1. Check browser console (F12 → Console)
2. Verify AuthContext is properly initialized
3. Check DashboardLayout is wrapping your pages
4. Ensure no browser extensions are blocking events