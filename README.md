# FlowForge API

A production-ready Task & Workspace Management REST API built using Node.js, Express.js, MongoDB, JWT Authentication, and industry-standard backend architecture.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and provide MongoDB and JWT secrets.
3. Start development mode with `npm run dev`, or production mode with `npm start`.
4. Run source checks with `npm run check`.

The API listens on port `5000` by default.

## Authentication

`POST /api/v1/auth/register` and `POST /api/v1/auth/login` return an access token and set an HTTP-only refresh-token cookie. `POST /api/v1/auth/refresh` rotates that cookie and returns a new access token. `POST /api/v1/auth/logout` revokes the refresh session.

Send access tokens with `Authorization: Bearer <token>`.

## Resources

All resource endpoints require authentication:

- `GET|POST /api/v1/workspaces`
- `GET|PATCH|DELETE /api/v1/workspaces/:workspaceId`
- `POST /api/v1/workspaces/:workspaceId/members`
- `DELETE /api/v1/workspaces/:workspaceId/members/:memberId`
- `GET|POST /api/v1/workspaces/:workspaceId/projects`
- `GET|PATCH|DELETE /api/v1/projects/:projectId`
- `GET|POST /api/v1/projects/:projectId/tasks`
- `GET|PATCH|DELETE /api/v1/tasks/:taskId`

Workspace membership controls access. Owners and administrators manage membership; project managers manage projects; viewers and guests have read-only access.

## Health

`GET /api/v1/health` returns a basic API health response.