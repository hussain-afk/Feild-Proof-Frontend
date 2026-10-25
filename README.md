# FieldProof

**Field work verification platform** — GPS check-ins, photo proof, manager review, and real-time team workflows.

FieldProof helps managers assign site tasks, workers prove attendance with location + photos, and teams review work in one place.

Built with the **MERN stack** (MongoDB, Express, React, Node.js), **Socket.IO**, and **JWT** cookie auth.

---

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [User roles](#user-roles)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API overview](#api-overview)
- [Real-time events](#real-time-events)
- [Project structure](#project-structure)
- [Security notes](#security-notes)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

FieldProof is designed for **field teams** (construction, inspections, deliveries, site visits):

1. A **manager** creates a task (optional site pin + radius, due date, assigned workers).
2. A **worker** checks in / out with **GPS** and a **proof photo**.
3. The **manager** reviews verification (approve / reject with reason).
4. **Admins** manage users, manager requests, activity, and platform maintenance.

Workers join a manager’s team through an **invite → accept** flow (no public `managerId` on register).

---

## Features

### Authentication & accounts

- Email + password registration and login
- JWT stored in **httpOnly cookie**
- Roles: `admin`, `manager`, `worker`, `pending_manager`
- Email verification flow (OTP / code)
- Profile update (name, phone, avatar, password, etc.)
- Payment / payout details on profile (manual; not a billing gateway)
- Ban support and banned landing page
- Logout with token handling

### Manager workflow

- Create and manage **field tasks**
- Optional **site location** (lat/lng + radius in meters)
- Assign one or more **workers** from your team
- Task statuses: pending → in progress → completed (derived from worker progress)
- **Verification queue**: review check-in / check-out proofs
- Approve or **reject** with a required reason
- View **approved / rejected** history
- **Available workers** list (unassigned workers)
- **Send invites** to free workers
- **Pending invites** sent by the manager
- Real-time updates when workers join, tasks change, or proofs arrive

### Worker workflow

- Register **without** a manager (free worker)
- **My invites** — accept or reject manager invitations
- Until a team is joined: dashboard routes stay locked; invites + profile available
- After joining a manager:
  - **My tasks** list
  - **Check-in** with GPS + photo
  - **Check-out** with GPS + photo
  - Geofence check when the task has a site location
  - View **reviewed** (approved / rejected) history
- Notifications for new assignments and review outcomes

### Admin workflow

- Platform **overview** / activity log
- **All users** management
- **Manager requests** — approve (`pending_manager` → `manager`) or reject
- Ban / update users
- **Maintenance mode** — toggle platform availability and message
- Admin-only routes protected on the server

### Maps & location

- Leaflet + OpenStreetMap (no paid Google Maps required)
- Location picker for task sites
- Support for coordinates / map search patterns used in the app
- Client geolocation for check-in / check-out
- Server-side distance checks (Haversine) when a site is configured

### Real-time (Socket.IO)

- Live task assignment and updates
- Verification updates for managers
- Invitation events (`invite_received`, `invite_updated`, team list refresh)
- Notifications
- Maintenance status broadcast
- User-room based delivery (server-controlled rooms)

### Platform UX

- Role-based dashboards and sidebars
- Dark, modern UI (Tailwind CSS)
- Loading states and toasts
- Landing page
- Responsive layouts (mobile + desktop sidebars)
- Maintenance page for non-admin users when the platform is locked

### Team model

- A **manager** acts as the company (no separate Organization model)
- Each worker has at most **one** `managerId`
- Linking happens only via **invitation accept**, not open registration

---

## User roles

| Role | Description |
|------|-------------|
| **Admin** | Full platform control: users, manager requests, maintenance, activity |
| **Manager** | Tasks, team invites, verification review, own workers only |
| **Worker** | Joins one manager, completes assigned tasks with GPS + photo proof |
| **Pending manager** | Requested manager access; waits for admin approval |

---

## Tech stack

### Frontend

- React (Vite)
- React Router
- Tailwind CSS
- Lucide React icons
- Axios (cookie credentials)
- Socket.IO client
- React Hot Toast
- Context API for global app state
- GSAP (landing page animations)
- Leaflet / OSM for maps

### Backend

- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT (httpOnly cookie)
- bcrypt password hashing
- Image uploads (e.g. ImageKit or similar, as configured)
- Nodemailer / email provider for verification mail

### Typical hosting

- Frontend: Vercel (or similar)
- Backend: Render (or similar)
- Database: MongoDB Atlas

---

## Architecture

```text
┌─────────────────┐     HTTPS + cookies      ┌──────────────────┐
│  React (Vite)   │ ◄──────────────────────► │  Express API     │
│  Tailwind UI    │                          │  JWT middleware  │
│  Context state  │     Socket.IO            │  Mongoose models │
└────────┬────────┘ ◄──────────────────────► │  Socket server   │
         │                                   └────────┬─────────┘
         │                                            │
         │                                            ▼
         │                                   ┌──────────────────┐
         │                                   │    MongoDB       │
         └──────────────────────────────────►│  Users, Tasks,   │
                                             │  Verifications…  │
                                             └──────────────────┘
