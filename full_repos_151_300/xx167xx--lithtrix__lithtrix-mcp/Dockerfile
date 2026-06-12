FROM node:20-slim

WORKDIR /app

# Install lithtrix-mcp globally
RUN npm install -g lithtrix-mcp

# LITHTRIX_API_KEY must be provided at runtime
ENV LITHTRIX_API_KEY=test

CMD ["lithtrix-mcp"]
