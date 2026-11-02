# Broadtrack Documentation

Index of technical documentation for Broadtrack. For local setup and development commands, see the [root README](../README.md).

## Table of contents

- [Architecture](#architecture)
    - [System overview](./architecture/system-overview.md)
    - [Authentication and user lifecycle](./architecture/auth-lifecycle.md)
    - [Scheduled tasks](./architecture/scheduled-tasks.md)
- [Workflows](#workflows)
    - [Borrowing and equipment lifecycle](./workflows/borrowing-lifecycle.md)
- [Reference](#reference)
    - [API endpoints reference](./reference/api-endpoints.md)
    - [Backend conventions](./reference/backend-conventions.md)
    - [Database schema and models](./reference/database.md)
    - [Frontend conventions](./reference/frontend-conventions.md)
    - [Project structure](./reference/project-structure.md)
    - [Testing reference](./reference/testing.md)

## Architecture

- [System overview](./architecture/system-overview.md): System context, components and services, architecture diagram, WebSocket event broadcasting, and deployment configuration.
- [Authentication and user lifecycle](./architecture/auth-lifecycle.md): Registration, allowed email domains, verification codes, token management, password resets, and Google OAuth.
- [Scheduled tasks](./architecture/scheduled-tasks.md): Minute-level booking expiration, return reminder emails, token pruning, and unverified account cleanup.

## Workflows

- [Borrowing and equipment lifecycle](./workflows/borrowing-lifecycle.md): Booking statuses, dynamic equipment availability, conflict checking, time interval handling, and cancellation rules.

## Reference

- [API endpoints reference](./reference/api-endpoints.md): Routes under `/api/v1`, HTTP methods, role permissions, query parameters, and response structures.
- [Backend conventions](./reference/backend-conventions.md): Laravel conventions, Form Requests, policies, models, enums, locking, and Pest tests.
- [Database schema and models](./reference/database.md): Core tables, foreign key constraints, pivot schema, and Eloquent relationships.
- [Frontend conventions](./reference/frontend-conventions.md): React features, route guards, TanStack Query, shared utilities, UI components, and test commands.
- [Project structure](./reference/project-structure.md): Directory layout, backend, frontend, docs, and config files.
- [Testing reference](./reference/testing.md): Test setup, Vite Plus frontend tests, Pest backend tests, and commands.
