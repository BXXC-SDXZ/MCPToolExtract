#!/usr/bin/env python3
import json, subprocess, sys
from pathlib import Path

def handle_request(request):
    skill_path = Path.home() / "agent-factory/skills/construction-comm-manager"
    if request.get("method") == "tools/list":
        return {"tools": [{"name": "monitor_construction_project", "description": "Use this tool to automate construction project communications, notify stakeholders of status changes, or log project updates to a CRM. Monitors Procore or Autodesk.", "inputSchema": {"type": "object", "properties": {"platform": {"type": "string", "enum": ["procore", "autodesk"]}, "project_id": {"type": "string"}}}}]}
    if request.get("method") == "tools/call":
        script = str(skill_path / "scripts" / "sync.py")
        result = subprocess.run(["python3", script], capture_output=True, text=True, timeout=30)
        return {"content": [{"type": "text", "text": result.stdout or result.stderr}]}
    return {"error": "Unknown method"}

if __name__ == "__main__":
    for line in sys.stdin:
        try:
            req = json.loads(line)
            print(json.dumps(handle_request(req)), flush=True)
        except Exception as e:
            print(json.dumps({"error": str(e)}), flush=True)
