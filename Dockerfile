# Stage 1: Build frontend
FROM node:22-alpine AS frontend-builder

# Install pnpm
RUN npm install -g pnpm@10.12.1

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY src/ ./src/
COPY index.html tsconfig.json vite.config.ts ./

# Load the argument as environment variable
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL $VITE_BACKEND_URL

# Build frontend
RUN pnpm build

# Stage 2: Backend runtime with nginx
FROM python:3.12-slim AS backend

# Install system dependencies, Node.js, and nginx
RUN apt-get update && apt-get install -y \
    default-mysql-client \
    default-libmysqlclient-dev \
    curl \
    gnupg \
    pkg-config \
    build-essential \
    python3-dev \
    nginx \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm for database migrations
RUN npm install -g pnpm@10.12.1

# Set working directory
WORKDIR /app

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend source code
COPY backend/ ./backend/

# Copy database migrations and tools
COPY db/ ./db/
COPY package.json pnpm-lock.yaml ./

# Install dbmate for database migrations
RUN pnpm install --frozen-lockfile

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Create a startup script that runs both nginx and backend
RUN echo '#!/bin/bash\n\
# Wait for database to be ready\n\
echo "Waiting for database..."\n\
while ! mysqladmin ping -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" --skip-ssl; do\n\
    sleep 1\n\
done\n\
echo "Database is ready!"\n\
# Start nginx in background\n\
echo "Starting nginx..."\n\
nginx -g "daemon off;" &\n\
\n\
# Run database migrations\n\
echo "Running database migrations..."\n\
export DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"\n\
pnpm dbmate up\n\
\n\
# Start the FastAPI application\n\
echo "Starting FastAPI application..."\n\
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000\n\
' > /app/start.sh && chmod +x /app/start.sh

# Set environment variables
ENV PYTHONPATH=/app
ENV DATABASE_URL=mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}

# Expose port 80 for nginx
EXPOSE 80

# Start the application
CMD ["/app/start.sh"]
