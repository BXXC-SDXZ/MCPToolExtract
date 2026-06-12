FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=America/Sao_Paulo

RUN apt-get update && apt-get install -y tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

RUN apt-get update && \
    apt-get install -y python3 python3-venv python3-pip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf /tmp/*

WORKDIR /opt/mcp_server

RUN python3 -m venv /opt/mcp_server/.venv
ENV PATH="/opt/mcp_server/.venv/bin:$PATH"

COPY server.py /opt/mcp_server

RUN pip install uv && \
    uv init && \
    uv add mcp[cli]

CMD ["python","server.py"]
