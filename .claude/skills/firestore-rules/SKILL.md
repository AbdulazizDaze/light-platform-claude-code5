---
name: firestore-rules
description: Use when adding or changing Firestore collections/fields, writing security rules, or defining composite indexes. Trigger for any data-layer change, access-control question, or hard-filter query that needs an index. Enforces owner-only personal data and match visibility.
---

# Firestore Security Rules & Indexes

Every collection and field ships with its rule; any field used in a compound query ships with its
index. Never widen a rule to work around a query — fix the query or the model.

## Access model (from PRD §9.8)
- `users`, `candidate_profiles`, `chat_sessions` — **owner-only** read/write.
- `companies` — owner writes; readable by any authenticated user (for match display).
- `job_posts` — recruiter-owner writes; readable by any authenticated user.
- `matches` — readable by the involved **candidate** and the **recruiter** only; written server-side.
- `notifications` — owner-only read; written server-side.

## Rules template (firestore.rules)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {

    function signedIn() { return request.auth != null; }
    function isOwner(uid) { return signedIn() && request.auth.uid == uid; }

    match /users/{uid}            { allow read, write: if isOwner(uid); }
    match /candidate_profiles/{uid} { allow read, write: if isOwner(uid); }
    match /chat_sessions/{uid}    { allow read, write: if isOwner(uid); }

    match /companies/{uid} {
      allow read: if signedIn();
      allow write: if isOwner(uid);
    }

    match /job_posts/{jobId} {
      allow read: if signedIn();
      allow create, update, delete: if signedIn() && request.resource.data.recruiter_uid == request.auth.uid;
    }

    match /matches/{matchId} {
      allow read: if signedIn() &&
        (resource.data.candidate_uid == request.auth.uid ||
         get(/databases/$(db)/documents/job_posts/$(resource.data.job_id)).data.recruiter_uid == request.auth.uid);
      allow write: if false;   // server-side (Admin SDK) only
    }

    match /notifications/{id} {
      allow read: if signedIn() && resource.data.uid == request.auth.uid;
      allow write: if false;   // server-side only
    }
  }
}
```

## Indexes (firestore.indexes.json)
Back the hard-filter compound query for matching (city + language + job_type + work_arrangement).
Add composite indexes for any query combining equality/array-contains + ordering. Example fields:
`job_posts`: `status ASC, city ASC, job_type ASC`; `candidate_profiles`:
`preferences.cities array-contains + preferences.job_type array-contains`.

## Identity integrity
Rules complement, not replace, server-side checks. API routes still read identity from the `users`
profile, never the request body. Zod schemas reject client-supplied identity fields.

## Checklist
- [ ] New collection/field has a rule.
- [ ] `matches`/`notifications` remain server-write-only.
- [ ] No rule widened to satisfy a query.
- [ ] Compound queries have indexes.
- [ ] Rules tested against the Firestore emulator (coordinate with `qa-test-engineer`).
- [ ] PII/auth change flagged for `security-reviewer`.

## Related
`matching-algorithm` (hard-filter queries), `nitaqat-rules`, `nextjs-api-route`.
