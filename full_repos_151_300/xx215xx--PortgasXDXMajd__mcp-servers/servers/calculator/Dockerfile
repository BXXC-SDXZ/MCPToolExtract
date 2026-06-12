FROM python:3.13.3-alpine

# Set the working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev libffi-dev

# Install uv
RUN pip install uv

# Copy project files
COPY . .

# Install dependencies using uv
RUN uv venv
RUN uv pip install --upgrade pip
RUN uv pip install -r requirements.txt

# Expose the desired port
EXPOSE 8001

# Define the default command to run your application
CMD ["uv", "run", "main.py"]
