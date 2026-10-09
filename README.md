# MediVault - Patient-Controlled Medical Record Sharing Platform

## Overview

MediVault is a secure, patient-controlled medical record sharing platform enabling patients to:
- Store health records across multiple hospitals
- Share records via time-limited, password-manager-friendly private keys
- Maintain control over data access
- Receive emergency access with full audit trails

## What's Been Implemented

### Backend (FastAPI + PostgreSQL - COMPLETE)
- Database models for users, hospitals, private keys, visits, cases, consent, emergency, audit
- API routes for auth, keys, hospitals, visits/records, emergency, audit
- Security utilities: password hashing, JWT, crypto
- Audit logging for every security event

### Frontend (React + Tailwind - IN PROGRESS)
- TypeScript types, API client, authentication context
- UI components: Button, Input, Select, PrivateKeyCard, ProfileSetup
- Configuration files for Vite, Tailwind, TypeScript

## Quick Start

```bash
# Backend
cd backend && pip install -r requirements.txt
python -m uvicorn app.main:app --reload

# Frontend  
cd frontend && npm install && npm run dev
```

### Google OAuth Setup
1. Create credentials in Google Cloud Console
2. Add redirect URIs: `http://localhost:5173`, `http://localhost:8000/auth/google/callback`
3. Update `backend/app/core/config.py` with CLIENT_ID, CLIENT_SECRET

## Core Security Rules ✓
1. Patient ID/QR NOT login - Uses Google OAuth
2. Explicit consent for sharing
3. Read-only scope, time-limited, revocable
4. Emergency requires reason + audit + notification
5. Authorization required before any data exposure
6. Full audit trail for every action

## Tech Stack
- Backend: FastAPI, PostgreSQL, SQLAlchemy, Pydantic, JWT
- Frontend: React 18, TypeScript, Vite, Tailwind CSS

## Files Created
- Backend: 21 files (models, schemas, routes, services, core config)
- Frontend: 11 files (types, contexts, components, config)
