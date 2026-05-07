# Security Specification: Physical AI Motion Coach

## 1. Data Invariants
- A user can only access their own profile.
- A user can only access and write their own workout records (`userId` must match `request.auth.uid`).
- `timestamp` must be `request.time`.
- `exerciseName` and `category` are required and must be within valid enums.

## 2. The Dirty Dozen Payloads
1. **Identity Spoofing**: Attempt to create a workout for another user.
2. **Key Poisoning**: Injecting large strings into `userId` or `workoutId`.
3. **Shadow Fields**: Adding `isAdmin: true` to a user profile.
4. **Invalid Categories**: Setting `category` to `cheating`.
5. **Time Spoofing**: Sending a manual `timestamp` from the past/future.
6. **Cross-User Read**: Trying to `list` another user's workout subcollection.
7. **Negative Count**: Writing a workout with `count: -100`.
8. **Orphaned Writes**: Creating a workout without a valid user document.
9. **Field Locking Bypass**: Attempting to change `email` after creation.
10. **Admin Escalation**: Writing to the `admins` collection directly.
11. **Huge Payloads**: Sending a 1MB string in `condition`.
12. **Status Skipping**: Skipping intermediate states (if any).

## 3. Test Runner (Draft)
```typescript
// firestore.rules.test.ts logic
// - Expect PERMISSION_DENIED for all dirty dozen.
// - Expect SUCCESS for valid owner writes.
```
