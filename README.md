# AU-Next Trading Platform

Modern automated trading platform built with Next.js, PostgreSQL, and Redis.

## 🏗️ Architecture

**Microservices with separate Dokploy deployments:**

- **Frontend + API**: Next.js 14 with built-in API routes (Port 3001)
- **Database**: PostgreSQL (Dokploy Database Service)
- **Cache**: Redis (Dokploy Database Service)
- **Admin UI**: NocoDB (Optional)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Dokploy instance running

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Visit http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
AU-Next/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── api/                  # API routes (to be added)
├── public/                   # Static assets
├── Dockerfile                # Production container
├── dokploy.json             # Dokploy configuration
└── package.json
```

## 🌐 API Endpoints (Coming Soon)

Will be added as Next.js API routes:
- `GET /api/health` - Health check
- `GET /api/trades` - Get all trades
- `POST /api/trades` - Create new trade
- `GET /api/stats` - Get trading statistics

## 📦 Deployment to Dokploy

### Services to Deploy:

**1. PostgreSQL Database**
- Use Dokploy Database Service
- Template: PostgreSQL
- Database: `autrading`

**2. Redis Cache**
- Use Dokploy Database Service  
- Template: Redis

**3. Next.js Application**
- Type: Application → Dockerfile
- Repository: This GitHub repo
- Port: 3001
- Environment:
  - `DATABASE_URL` - PostgreSQL connection string
  - `REDIS_URL` - Redis connection string

**4. NocoDB (Optional)**
- Use Dokploy Template
- For database admin interface
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
