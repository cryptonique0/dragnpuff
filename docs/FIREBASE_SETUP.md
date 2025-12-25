# Firebase Setup Guide

## Prerequisites
- Node.js 18+
- Firebase CLI: `npm install -g firebase-tools`
- Google Cloud Project

## Installation

### 1. Initialize Firebase
```bash
firebase init
```

Select the following options:
- Firestore
- Functions
- Hosting
- Storage

### 2. Configure Functions
```bash
cd firebase/functions
npm install
```

### 3. Configure Environment
Create `firebase/functions/.env` with:
```
PROJECT_ID=your_project_id
DATABASE_URL=your_database_url
```

## Deployment

### Deploy Everything
```bash
firebase deploy
```

### Deploy Specific Services
```bash
firebase deploy --only functions
firebase deploy --only hosting
firebase deploy --only firestore:rules
```

## Firestore Rules

Update security rules in `firebase/firestore.rules`:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Cloud Functions

Functions are organized in `firebase/functions/dragn/`:
- `index.js` - Main function exports
- `actions.js` - Game action handlers
- `util.js` - Utility functions

## Emulator

Start local emulator:
```bash
firebase emulators:start
```

## Debugging

View function logs:
```bash
firebase functions:log
```

Set debug environment:
```bash
firebase functions:config:set debug.enabled=true
```
