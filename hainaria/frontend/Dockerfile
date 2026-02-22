# ===============================
# BUILD STAGE
# ===============================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Define build argument for the backend API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the Vite/React application
RUN npm run build

# ===============================
# PRODUCTION STAGE (NGINX)
# ===============================
FROM nginx:alpine

# Copy the built React app to Nginx's web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace the default Nginx config with our SPA-friendly config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
