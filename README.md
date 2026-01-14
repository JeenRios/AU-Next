# AU-Next Trading Platform

Advanced automated trading platform built with Next.js, Node.js, PostgreSQL, and Redis.

## 🏗️ Architecture

This is a **hybrid microservices** setup with Docker Compose:

- **Frontend**: Next.js 14 (Port 3001)
- **API**: Node.js/Express (Port 3002)
- **Database**: PostgreSQL 16 (Port 5432)
- **Cache**: Redis 7 (Port 6379)

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Node.js 18+ (for local development)

### Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up --build -d
```

### Access the Application

- **Frontend**: http://localhost:3001
- **API**: http://localhost:3002
- **API Health**: http://localhost:3002/health

## 📁 Project Structure

```
AU-Next/
├── app/                    # Next.js frontend
├── api/                    # Node.js backend API
│   ├── src/
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
├── database/
│   └── init.sql           # Database initialization
├── docker-compose.yml     # Orchestration
├── Dockerfile             # Frontend container
└── README.md
```

## 🔧 Development

### Run Frontend Only (Local)
```bash
npm run dev
# Visit http://localhost:3000
```

### Run API Only (Local)
```bash
cd api
npm install
npm run dev
# API runs on http://localhost:3002
```

## 🌐 API Endpoints

- `GET /health` - Health check
- `GET /api/trades` - Get all trades
- `POST /api/trades` - Create new trade
- `GET /api/stats` - Get trading statistics (cached)

## 📦 Deployment

### Deploy to Dokploy

1. Push to GitHub
2. In Dokploy, create new application
3. Select "Docker Compose" as build type
4. Dokploy will use docker-compose.yml
5. Add port mappings in Advanced settings
   git push origin main
   ```

2. **In Dokploy Dashboard:**
   - Click "Create Application"
   - Select "Docker" as build type
   - Connect your Git repository
   - Set the following configuration:

3. **Build Configuration:**
   - **Build Method:** Dockerfile
   - **Dockerfile Path:** `./Dockerfile`
   - **Port:** `3000`
   - **Health Check Path:** `/` (optional)

4. **Environment Variables (optional):**
   ```
   NODE_ENV=production
   NEXT_TELEMETRY_DISABLED=1
   ```

5. **Deploy:**
   - Click "Deploy"
   - Dokploy will build and deploy your application

### Docker Build Locally (Optional)

Test the Docker build locally before deploying:

```bash
# Build the image
docker build -t au-next .

# Run the container
docker run -p 3000:3000 au-next
```

## Project Structure

```
AU-Next/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── public/              # Static files
├── Dockerfile           # Docker configuration
├── .dockerignore        # Docker ignore rules
├── next.config.js       # Next.js configuration
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json         # Dependencies and scripts
```

## Configuration

### Next.js Configuration

The `next.config.js` is configured with:
- **Standalone output** - Optimized for Docker deployment
- **React Strict Mode** - Enabled for better development experience

### Docker Configuration

The Dockerfile uses a multi-stage build:
- **Builder stage:** Installs dependencies and builds the application
- **Runner stage:** Minimal production image with only necessary files

## Technologies

- [Next.js](https://nextjs.org/) - React framework
- [React](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Docker](https://www.docker.com/) - Containerization

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Dokploy Documentation](https://docs.dokploy.com/)
- [Docker Documentation](https://docs.docker.com/)

## License

MIT
