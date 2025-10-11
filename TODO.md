# TODO: Add Notifications Page

## Steps to Complete
- [x] Create app/types/Notification.ts (interfaces for Notification, Stats, ModalType)
- [x] Create models/Notification.ts (Mongoose schema)
- [x] Create app/api/notifications/route.ts (GET all, POST create)
- [x] Create app/api/notifications/[id]/route.ts (GET/PUT/DELETE single)
- [x] Create components/notifications/NotificationStats.tsx (stats cards)
- [x] Create components/notifications/NotificationTable.tsx (table with search/filter/pagination)
- [x] Create components/notifications/NotificationActionModals.tsx (modals for view/edit/delete/create)
- [x] Create app/notifications/page.tsx (main page component)
- [x] (Optional) Create hooks/useNotificationManagement.ts (if complex logic needed)
- [x] Add Notifications link to dashboard navigation (check DashboardLayout)
- [x] Test locally: Run dev server, navigate to /notifications, verify functionality

# TODO: Fix 500 Error on POST /api/notifications

## Steps to Complete
- [x] Update models/Notification.ts: Add 'status' field (enum ['draft', 'sent', 'failed'], default 'sent')
- [x] Update app/api/notifications/route.ts: Fix POST handler field names (audience -> target_audience, targetId -> target_ids, additional -> additional_field), include is_active/expires_at, set status; fix GET stats and response mapping (createdAt -> created_at)
- [x] Update app/api/notifications/[id]/route.ts: Fix PUT handler field names and response mapping
- [ ] Test: Run dev server, send a notification, verify no 500 error and correct data saved
