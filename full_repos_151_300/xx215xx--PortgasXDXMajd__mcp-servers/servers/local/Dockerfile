FROM python:3.13.3-alpine

WORKDIR /app

RUN pip install uv

COPY requirements.txt .

RUN uv venv

RUN pip install -r requirements.txt

COPY . .

EXPOSE 8002

CMD ["uv", "run", "main.py"]