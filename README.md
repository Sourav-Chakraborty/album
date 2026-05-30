# 📸 Album - High-Performance Full-Stack Media Gallery

A modern, high-fidelity full-stack media gallery application featuring secure authentication and high-resiliency chunked uploading for large media files (up to 1GB). Built from the ground up with a custom design system, dark-mode integration, and clean separation of concerns.

---

## ✨ Features

- **🔐 Secure Authentication**
  - Robust JWT-based authentication flow (Register, Login, Logout).
  - Secure session tracking using `HttpOnly` cookie parser validation (`authToken`).
  - Seamless state persistence across reloads via Redux Persist.

- **🚀 Resilient Chunked Uploads**
  - Multi-part media chunking (5 MB blocks) managed by React/Redux frontend.
  - Generates secure session UUIDs (`crypto.randomUUID()`) to organize and track uploads.
  - Resilient backend processing where segments are written to a temporary workspace and merged sequentially using Node.js stream pipelines.
  - Support for massive media files up to 1 GB (JPEG, PNG, WebP, and multiple video formats like MP4, MOV, MKV, AVI, WEBM, etc.).

- **🎨 Modern Aesthetic Design System**
  - Fully hand-crafted vanilla CSS design system utilizing dynamic HSL custom variables.
  - Native, seamless support for OS-level Light and Dark modes.
  - Glassmorphic panels, rich shadows, and micro-interactive elements.
  - Fluid layouts and typography scale utilizing CSS `clamp()`.

- **📁 Prisma DB Management**
  - Schema relationship models (one-to-many relationship between `User` and `Media`).
  - Out-of-the-box support for MySQL / MariaDB via Prisma Client.
  - Simplified database migrations and seeding.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 & TypeScript 6
- **Build Tool:** Vite 8 (optimized HMR)
- **State & API Management:** Redux Toolkit & RTK Query
- **Styling:** Custom Vanilla CSS with variables and dark-mode media queries
- **Routing:** React Router v7

### Backend
- **Framework:** Express 5 & TypeScript 6
- **Database ORM:** Prisma
- **Database Driver:** MariaDB / MySQL
- **File Upload Middleware:** Multer
- **Token Signatures:** JSONWebToken (JWT) & Cookie Parser

---

## 📂 Project Architecture

```filepath
album/
├── album-backend/              # Express API Server (TypeScript)
│   ├── prisma/                 # Database migrations and Prisma schema
│   │   ├── migrations/
│   │   └── schema.prisma       # MariaDB/MySQL models
│   ├── src/
│   │   ├── lib/                # Shared clients (Prisma)
│   │   ├── middleware/         # isAuthenticate, Multer disk config
│   │   ├── routes/             # auth, user, and fileUpload routes
│   │   ├── services/           # Chunks merger logic
│   │   └── index.ts            # App entry point
│   ├── .env.example            # Backend environmental configuration
│   ├── tsconfig.json           # TS Compiler settings
│   └── package.json
│
└── album-frontend/             # React SPA Client (Vite + TS)
    ├── public/                 # Static SVG icons/favicons
    ├── src/
    │   ├── assets/             # Images and design templates
    │   ├── components/         # Login, Dashboard, ImagePreview, UploadPreviewModals
    │   ├── store/              # Redux store, auth slices, RTK Query base and API slices
    │   ├── App.css / index.css # Premium design sheets & CSS tokens
    │   ├── main.tsx            # DOM initialization
    │   └── router.tsx          # Client-side routing configuration
    ├── .env.example            # Frontend environmental configuration
    ├── tsconfig.json
    └── package.json
```

---

## ⚙️ Development Setup

Follow these steps to get both the backend and frontend up and running locally.

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **MariaDB** or **MySQL** server running locally or in a container.

---

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd album-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables. Duplicate the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   Provide the following parameters:
   - `PORT`: Port for the API server (e.g., `3000`)
   - `JWT_SECRET`: A secret string for signing JWT tokens
   - `DATABASE_URL`: Connection string to MariaDB/MySQL database (`mysql://user:password@host:port/database_name`)
   - `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `DATABASE_HOST`, `DATABASE_PORT`: Prisma configurations
   - `FRONTEND_URL`: URL of the React client (e.g., `http://localhost:5173`)

4. Run database migrations to prepare your schema:
   ```bash
   npx prisma migrate dev
   ```

5. Start the backend in development (watch) mode:
   ```bash
   npm run dev
   ```

The backend server is now running and listening on your configured `PORT`.

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd album-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables. Duplicate the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   Assign your backend server's URL to:
   - `VITE_API_BASE_API` (e.g., `http://localhost:3000/api/v1`)

4. Launch the Vite development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`.

---

## ⚡ Technical deep dive: Resilient Chunked Uploads

The file uploading engine is designed specifically to handle large assets gracefully by splitting them client-side and pipeline-merging them server-side:

```mermaid
sequenceDiagram
    actor Client as React Client (Dashboard)
    participant Server as Express Server (FileUploadController)
    participant Disk as Local File Storage
    participant DB as MariaDB / MySQL (Prisma)

    Note over Client: User drops/selects media file
    Client->>Client: Slice file into 5 MB Blobs & generate UUID uploadId
    
    loop For each chunk (Index: 0 to N-1)
        Client->>Server: POST /api/v1/file/chunk (chunk, uploadId, chunkIndex)
        Server->>Disk: Save chunk in uploads/temp/{uploadId}/chunk-{index}
        Server-->>Client: 200 Chunk uploaded successfully
    end

    Client->>Server: POST /api/v1/file/upload (uploadId, totalChunks, extension)
    Note over Server: mergeFileChunks()
    Server->>Disk: Create WriteStream for final file
    loop Stream merge
        Server->>Disk: pipeline(chunkReadStream, writeStream)
        Server->>Disk: Delete chunk-{index} file
    end
    Server->>DB: prisma.media.create({ name: uploadId.extension, userId })
    Server-->>Client: 200 File merged successfully
```

### Flow Breakdown:
1. **Client-side Chunking:** Files are sliced inside `Dashboard.tsx` utilizing standard HTML5 `File.prototype.slice`. Each chunk represents a 5 MB payload uploaded inside a `FormData` envelope containing the `uploadId` key.
2. **Dynamic Workspaces:** On the backend, `uploadFileChunk` creates a workspace folder dynamically at `uploads/temp/${uploadId}` and moves chunks there sequentially under corresponding names (`chunk-0`, `chunk-1`, etc.).
3. **Pipelined Stream Merging:** Once all chunks are received, the frontend invokes `/upload`. The backend service `mergeChunks.ts` reads the segment directories, streams the binary information into a final `fs.WriteStream` at `uploads/merged/`, and garbage-collects all temporarily stored segments.
4. **Database Registration:** The record metadata is committed to the database, referencing the newly merged media name alongside the authenticated `User` account ID.

---

## 🔒 Security

- Passwords are encrypted before database insertion using a secure hashing algorithm (`bcrypt`).
- API requests are protected against session leaks through HTTP-only credentials.
- Input validation safeguards the server from non-supported mime-types, allowing safe multi-format processing.
