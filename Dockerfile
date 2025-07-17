# Use a glibc-based Node.js image
FROM node:18-slim AS builder

WORKDIR /app
COPY package*.json ./

# Install dependencies including devDependencies (needed for build)
RUN npm ci

COPY . .
RUN npm run build

# Use lightweight nginx image to serve the built files
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
