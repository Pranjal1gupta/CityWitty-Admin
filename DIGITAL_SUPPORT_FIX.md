# Digital Support Asset Status Update - Fix Documentation

## Issue
When updating digital support asset status (Graphics, Reels, Weblogs, Podcasts) in the Add Digital Support Assets modal, the system was returning a **400 Bad Request** error:

```
api/merchants/[id]/digital-support: Failed to load resource: the server responded with a status of 400 (Bad Request)
Error updating graphic status: Error: Failed to update graphic status in database
```

## Root Cause
**Mismatch between component request format and API endpoint expectation:**

- **Component (MerchantActionModals.tsx)** was sending individual item update requests:
  ```json
  {
    "type": "graphic",
    "itemId": "GR001",
    "status": "completed",
    "completionDate": "2024-01-15T10:30:00.000Z"
  }
  ```

- **API endpoint** (`/api/merchants/[id]/digital-support`) only accepted:
  ```json
  {
    "digitalSupportData": {
      "ds_graphics": [...],
      "ds_reel": [...],
      "ds_weblog": [...],
      "podcastLog": [...]
    }
  }
  ```

The API was rejecting the individual update format because it expected `digitalSupportData` object, which was missing, returning a 400 error.

## Solution
Updated the API endpoint to support **both** request formats:

### 1. Individual Item Status Updates (for quick updates)
- Format: `{ type, itemId, status, completionDate/completeDate }`
- Use case: Updating single item status without affecting others
- Processes: Finds merchant → locates item in array → updates status → persists

### 2. Full Digital Support Data Updates (for bulk/complete updates)
- Format: `{ digitalSupportData: { ds_graphics, ds_reel, ds_weblog, podcastLog } }`
- Use case: Updating entire digital support structure
- Processes: Replaces entire arrays with new data

## Changes Made

### 1. API Endpoint: `/app/api/merchants/[id]/digital-support/route.ts`

**PATCH handler improvements:**
- Detects request type based on provided fields
- If `type`, `itemId`, and `status` are present → individual update
- If `digitalSupportData` is present → full update
- Validates merchant exists before attempting update
- Converts date strings to proper Date objects
- Returns helpful error messages for debugging

**Key logic:**
```typescript
if (type && itemId && status !== undefined) {
  // Individual item update - locate and update specific item
} else if (digitalSupportData) {
  // Full object update - replace entire arrays
} else {
  // Invalid request
}
```

### 2. Component: `/components/merchants/MerchantActionModals.tsx`

**Enhanced error handling:**
- Retrieves detailed error messages from API response
- Logs API status code and error data for debugging
- Displays meaningful error messages to user instead of generic ones

**Updated functions:**
- `updateGraphicStatus()` - handles graphic status changes
- `updateReelStatus()` - handles reel status changes
- `updatePodcastStatus()` - handles podcast status changes
- `updateWeblogStatus()` - handles weblog status changes

## Testing the Fix

### Test Case 1: Update Single Graphic Status
1. Navigate to Add Digital Support Assets modal
2. Add a graphic with ID "GR001"
3. Change its status to "completed"
4. Expected: Status updates successfully with toast notification

### Test Case 2: Verify Date Handling
1. Update graphic status to "completed"
2. Verify `completionDate` is set to current ISO date
3. Update back to "pending"
4. Verify `completionDate` is cleared

### Test Case 3: Error Messages
1. Attempt to update non-existent graphic
2. Expected: Specific error message displayed to user

## API Response Examples

### Successful Individual Update
```json
{
  "message": "Digital support assets updated successfully",
  "data": {
    "_id": "...",
    "ds_graphics": [{
      "graphicId": "GR001",
      "status": "completed",
      "completionDate": "2024-01-15T10:30:00.000Z",
      ...
    }]
  }
}
```

### Error Response
```json
{
  "error": "Item not found or no updates made"
}
```

## Backward Compatibility
✅ The fix maintains full backward compatibility:
- Existing full-update functionality continues to work
- New individual-update functionality is additive
- No breaking changes to existing API contracts

## Future Improvements
Consider these enhancements:
1. Add rate limiting for status update endpoints
2. Implement audit logging for all status changes
3. Add batch update endpoint for multiple items
4. Implement optimistic locking to prevent concurrent updates