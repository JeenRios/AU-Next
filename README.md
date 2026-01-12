# AU Next - Trading Platform

A modern Next.js application built for deployment on Dokploy.

## Features

- ⚡ **Next.js 14** - Latest App Router with React Server Components
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 📘 **TypeScript** - Type-safe code
- 🐳 **Docker Ready** - Optimized multi-stage build
- 🚀 **Dokploy Compatible** - Easy deployment

## Getting Started

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Deploying to Dokploy

### Prerequisites

- Dokploy instance running
- Git repository connected to Dokploy
- Docker support enabled

### Deployment Steps

1. **Push your code to Git repository:**
   ```bash
   git add .
   git commit -m "Initial commit"
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
