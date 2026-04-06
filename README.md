# SaaS Analytics Dashboard

A modern, multi-tenant SaaS Analytics Dashboard built with Next.js 16, Prisma, and NextAuth.js.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v20+)
- External PostgreSQL Database
- Docker & Docker Compose (optional, for production-like deployment)

### 2. Environment Setup
Copy the example environment file and fill in the values:
```bash
cp .env.example .env # If .env.example exists, otherwise create .env
```
Key variables required:
- `DATABASE_URL`: Connection string for PostgreSQL.
- `NEXTAUTH_SECRET`: Secret for session encryption.
- `NEXTAUTH_URL`: Base URL of the application.
- `GMAIL_USER`: Your Gmail address.
- `GMAIL_PASS`: Your Google App Password.

### 3. Local Development (Host Machine)
To run the project locally using your external PostgreSQL database:
```bash
# Install dependencies
pnpm install

# Setup database schema
pnpm prisma generate
pnpm prisma db push

# Start the development server
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) for the application.

---

## 🐳 Docker Deployment

To deploy the application and reverse proxy (App + Nginx) using Docker:

### Build and Start
```bash
docker compose up -d --build
```
This will start:
- **app**: Next.js application (Multi-tenant logic).
- **nginx**: Reverse proxy handling requests on port 80.

### Useful Docker Commands
- `docker compose stop`: Stops the running services.
- `docker compose restart`: Restarts all services.
- `docker compose logs -f`: Tails logs for all services.
- `docker compose ps`: Lists status of all services.

---

## 🛠 Tech Stack & Architecture

- **Framework**: Next.js 16 (App Router)
- **Authentication**: NextAuth.js (Credentials Provider)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS & Shadcn UI
- **Multi-tenancy**: Organization-based data isolation via slugs (e.g., `/dashboard/[slug]`)
- **Proxy**: Nginx for production-grade routing and header management

## 📦 Project Structure
- `src/app`: Next.js 16 App Router pages and API routes.
- `src/components`: UI components (Shadcn + custom).
- `src/lib`: Core utilities (Prisma client, Auth options, slugs).
- `prisma`: Database schema definition.
- `nginx`: Configuration for the Nginx reverse proxy.

## ⚠️ Important Notes
> [!IMPORTANT]
> The current Next.js version (16.2.2) uses the `App Router`. 
>
> [!WARNING]
> Ensure your `DATABASE_URL` in the `.env` file points to your external PostgreSQL database.

---

## 📄 License
MIT
