# Cloud Meta File Storage Service

A cloud-based file storage and sharing web application inspired by the core functionality of platforms such as Google Drive.

The system allows users to securely upload, organize, search, manage, and share files with controlled access permissions. The backend is built using Java and Spring Boot, while the frontend is built using React.

---

## Overview

Cloud Meta File Storage Service is designed as an industry-oriented MVP for individuals, students, and small teams who need a simple and secure platform to manage their digital files.

The application provides:

- Secure user authentication
- File and folder organization
- File upload and download
- Nested folder management
- Controlled file sharing
- Public shareable links
- Search and filtering
- Starred files
- Trash and file restoration
- Role-based access control

The system separates file metadata from physical file storage, allowing the application to use cloud object storage such as AWS S3 or Supabase Storage.

---

## Objectives

The main objectives of the project are:

1. Build a secure cloud-based file management system.
2. Implement authentication and authorization using Spring Security.
3. Provide hierarchical folder and file organization.
4. Implement fine-grained file sharing permissions.
5. Store file metadata in PostgreSQL.
6. Store actual file objects using cloud storage.
7. Provide secure file access using signed URLs.
8. Build a responsive and user-friendly React interface.
9. Follow a scalable backend architecture suitable for future expansion.

---

## Features

### Authentication

- Email and password registration
- Secure password hashing
- JWT-based authentication
- Google OAuth2 authentication
- Authenticated user profile
- Role-based access control

### File Management

- Upload files
- Download files
- Delete files
- File metadata management
- File ownership
- File organization
- Secure file access

### Folder Management

- Create folders
- Rename folders
- Delete folders
- Nested folders
- Breadcrumb navigation
- Folder-based file organization

### File Sharing

Files can be shared with other users using different permission levels.

| Role | Permissions |
|------|-------------|
| Owner | Full access |
| Editor | Upload, modify and delete |
| Viewer | View and download |
| Public User | Access through public share link |

All permissions are validated on the backend.

### Public Share Links

Users can generate public links for files with optional controls:

- Link expiration
- Optional password protection
- Public access without requiring an account

### Search and Filtering

Users can search and filter files using metadata such as:

- File name
- File type
- Folder
- Starred status
- Date

### Starred Files

Users can mark frequently accessed files as starred for quick access.

### Trash

Deleted files use soft deletion instead of immediate permanent removal.

Users can:

- Move files to Trash
- View deleted files
- Restore files
- Permanently delete files

---

## Future Features

The following features are planned for future versions:

- File versioning
- File previews
- Image previews
- PDF previews
- Activity logs
- Tags and labels
- Storage quota
- Subscription plans
- Advanced sharing controls
- Additional OAuth providers

### Non-Goals for the MVP

The MVP does not include:

- Real-time collaborative document editing
- Desktop synchronization client
- Complex enterprise organization management

---

# System Architecture

```text
                    ┌─────────────────────┐
                    │      React Client   │
                    │                     │
                    │ React + Vite        │
                    │ Tailwind CSS        │
                    │ TanStack Query      │
                    │ Axios               │
                    └──────────┬──────────┘
                               │
                               │ HTTP / REST API
                               ▼
                    ┌─────────────────────┐
                    │   Spring Boot API   │
                    │                     │
                    │ Spring Web          │
                    │ Spring Security     │
                    │ JWT / OAuth2        │
                    │ Spring Data JPA     │
                    │ Bean Validation     │
                    └───────┬───────┬─────┘
                            │       │
                            │       │
                            ▼       ▼
                 ┌──────────────┐  ┌──────────────────┐
                 │ PostgreSQL   │  │ Cloud Object     │
                 │              │  │ Storage          │
                 │ File         │  │                  │
                 │ Metadata     │  │ AWS S3 /         │
                 │ Users        │  │ Supabase Storage │
                 │ Shares       │  │                  │
                 └──────────────┘  └──────────────────┘
