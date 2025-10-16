# Auto-Logout Session Timeout Implementation

## Overview
This document explains the auto-logout functionality with a countdown timer that automatically logs out users after 10 minutes of inactivity.

## Features Implemented

### 1. **AuthContext Updates** (`contexts/AuthContext.tsx`)
- **Session Timeout**: 10 minutes (600 seconds)
- **Warning Threshold**: 1 minute remaining
- **Activity Detection**: Tracks user interactions (mouse, keyboard, scroll, touch, click)
- **Auto-Reset**: Session timer resets with each user activity
- **State Exports**:
  - `timeRemaining`: Displays remaining session time in seconds
  - `isWarning`: Boolean flag when time is less than 1 minute

### 2. **DashboardLayout Updates** (`components/layout/DashboardLayout.tsx`)
- **Session Timer Bar**: Added a footer bar to the navbar showing:
  - Clock icon with session expiration time in `MM:SS` format
  - Dynamic color coding:
    - Gray: Normal state (> 3 minutes)
    - Orange: Warning state (< 3 minutes)
    - Red + Pulse: Critical state (< 1 minute)
  - Warning message when session is about to expire

### 3. **Timeout Behavior**
- **On Activity**: Session timer resets to 10 minutes
- **On Inactivity**: Timer counts down, no resets occur
- **On Timeout**: 
  - User is logged out automatically
  - Toast notification: "Session expired due to inactivity. Please log in again."
  - Redirected to login page

## How It Works

### Activity Detection Flow
```
User Action (mouse/keyboard/scroll) 
    ↓
resetInactivityTimer() called
    ↓
Clear old timers
    ↓
Reset timeRemaining to 600 seconds
    ↓
Set new 10-minute timeout
    ↓
Start countdown from 600 to 0
```

### Warning System
- At 60 seconds remaining: 
  - `isWarning` becomes `true`
  - Toast warning displayed: "Your session will expire in 1 minute..."
  - Timer turns red and pulses
  - Warning message appears in navbar

### Auto-Logout
- When `timeRemaining` reaches 0:
  - `handleAutoLogout()` is triggered
  - User data cleared from state and localStorage
  - Session cookies cleared
  - Error toast displayed
  - Redirect to `/login` page

## Visual Indicators

### Session Timer Bar
Located at the bottom of the navbar, showing:
```
🕐 Session expires in: 09:45 | Move your mouse to stay logged in (when warning)
```

### Color States
- **Normal** (> 3 min): Gray text
- **Warning** (< 3 min): Orange text
- **Critical** (< 1 min): Red text with pulse animation

## Configuration

To adjust the timeout settings, modify these constants in `AuthContext.tsx`:

```typescript
const SESSION_TIMEOUT = 10 * 60;  // Change 10 to desired minutes
const WARNING_THRESHOLD = 60;      // Change 60 to desired warning seconds
```

## Files Modified

1. **`contexts/AuthContext.tsx`**
   - Added session timeout logic
   - Added activity detection listeners
   - Added countdown timer mechanism
   - Exported `timeRemaining` and `isWarning`

2. **`components/layout/DashboardLayout.tsx`**
   - Uncommented and updated layout component
   - Added session timer display bar
   - Integrated `useAuth()` hook for timer data
   - Added `formatTime()` utility function
   - Added color-coded timer display

## Testing

### Test Inactivity Timeout
1. Log in to the admin dashboard
2. Observe the timer in the navbar (bottom)
3. Wait without any interaction for 10 minutes
4. Should be automatically logged out and redirected to login

### Test Activity Reset
1. Log in to the admin dashboard
2. Observe the timer
3. Move mouse or type on keyboard
4. Timer should reset to 10 minutes

### Test Warning Message
1. Log in to the admin dashboard
2. Wait without interaction for 9 minutes
3. At 9:00 remaining (1 minute left), warning should appear:
   - Toast notification
   - Red pulsing timer
   - Warning message in navbar

## Browser Compatibility
- Works with all modern browsers (Chrome, Firefox, Safari, Edge)
- Activity detection uses standard DOM events
- LocalStorage used for session persistence

## Security Notes
- Session timeout applies per tab/window
- Clearing browser data will clear the session
- Activity detection is client-side (activity must occur in the browser window)
- After auto-logout, sensitive data is cleared from localStorage

## Future Enhancements
- Add "Stay Logged In" button in warning modal
- Backend session validation
- Device/IP-based session invalidation
- Multiple device session management