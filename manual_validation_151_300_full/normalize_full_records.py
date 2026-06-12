#!/usr/bin/env python3
import ast
import json
import re
from pathlib import Path

BASE = Path('/Users/syt/Documents/CodexForMe/MCP可选项研究/tool_extract_github_payload')
OUT = BASE / 'manual_validation_151_300_full'
RECORDS = OUT / 'mcp_tool_metadata_records_151_300_full.json'
MANIFEST = BASE / 'full_repos_151_300' / 'repo_manifest_151_300.json'

manifest = {m['repo_id']: m for m in json.loads(MANIFEST.read_text(encoding='utf-8'))}


def default_annotations():
    return {'readOnlyHint': None, 'destructiveHint': None, 'idempotentHint': None, 'openWorldHint': None}


def default_constraints():
    return {'minimum': None, 'maximum': None, 'pattern': None, 'additionalProperties': None}


def schema_to_params(raw):
    if not isinstance(raw, dict):
        return []
    props = raw.get('properties') or {}
    req = set(raw.get('required') or [])
    params = []
    if isinstance(props, dict):
        for name, prop in props.items():
            if not isinstance(prop, dict):
                prop = {}
            params.append({
                'name': name,
                'type': prop.get('type') or 'unknown',
                'required': name in req,
                'default': prop.get('default'),
                'description': prop.get('description'),
                'enum': prop.get('enum'),
                'constraints': {
                    'minimum': prop.get('minimum'),
                    'maximum': prop.get('maximum'),
                    'pattern': prop.get('pattern'),
                    'additionalProperties': prop.get('additionalProperties'),
                },
            })
    return params


def infer_sdk(path, text=''):
    ext = Path(path).suffix.lower()
    t = text[:4000]
    if ext == '.py': return 'python-sdk'
    if ext in {'.ts', '.tsx', '.js', '.mjs', '.cjs'}: return 'typescript-sdk'
    if ext == '.java': return 'java-sdk'
    if ext == '.go': return 'go-sdk'
    if ext == '.swift': return 'swift-sdk'
    if ext == '.rs': return 'rust-sdk'
    return 'unknown'


def read_lines(rid, rel):
    rid3=f'{int(rid):03d}'
    d=Path(manifest[rid3]['clone_dir'])
    p=d/rel
    if not p.exists():
        return [], p
    return p.read_text(encoding='utf-8', errors='ignore').splitlines(), p


def find_python_block(lines, start_line):
    if not lines: return start_line, start_line
    i=max(0,start_line-1)
    # if line is decorator, include following def; if line is def, include preceding contiguous decorators
    def_idx=i
    for j in range(i, min(len(lines), i+8)):
        if re.match(r'\s*(async\s+def|def)\s+', lines[j]):
            def_idx=j; break
    start=def_idx
    while start>0 and lines[start-1].lstrip().startswith('@'):
        start-=1
    base_indent=len(lines[def_idx])-len(lines[def_idx].lstrip()) if def_idx < len(lines) else 0
    end=def_idx+1
    while end < len(lines):
        line=lines[end]
        if line.strip()=='' or line.lstrip().startswith('#'):
            end+=1; continue
        indent=len(line)-len(line.lstrip())
        if indent<=base_indent and not line.lstrip().startswith((')',']','}')):
            break
        end+=1
    return start+1, min(end, len(lines))


def balanced_block(lines, start_line, max_lines=220):
    if not lines: return start_line, start_line
    start=max(1,start_line)
    depth=0; seen=False; quote=None; esc=False
    for idx in range(start-1, min(len(lines), start-1+max_lines)):
        line=lines[idx]
        for ch in line:
            if quote:
                if esc: esc=False
                elif ch=='\\': esc=True
                elif ch==quote: quote=None
            else:
                if ch in '"\'`': quote=ch
                elif ch in '([{': depth+=1; seen=True
                elif ch in ')]}': depth-=1
        if seen and depth<=0 and idx>=start-1:
            return start, idx+1
    return start, min(len(lines), start+max_lines-1)


def extract_content(rid, rel, line):
    lines, path = read_lines(rid, rel)
    if not lines: return line, line, ''
    ext=Path(rel).suffix.lower()
    if ext == '.py':
        s,e=find_python_block(lines,line)
    else:
        s,e=balanced_block(lines,line)
    return s,e,'\n'.join(lines[s-1:e]) + ('\n' if e>=s else '')


def function_name_from_content(content, fallback):
    for pat in [r'(?:async\s+def|def)\s+([A-Za-z_][\w]*)', r'(?:function\s+)([A-Za-z_$][\w$]*)', r'(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=']:
        m=re.search(pat, content)
        if m: return m.group(1)
    return fallback


def parse_tool_id(tool_id):
    # repo::tool::file:line, tool name may not contain :: in our generated IDs
    parts=tool_id.split('::',2)
    rid=parts[0] if parts else None
    name=parts[1] if len(parts)>1 else None
    file_line=parts[2] if len(parts)>2 else ''
    if ':' in file_line:
        file, line_s = file_line.rsplit(':',1)
        try: line=int(line_s)
        except Exception: line=1
    else:
        file=file_line; line=1
    return rid,name,file,line


def normalize_tool(rec, tool):
    rid, name_from_id, file_from_id, line_from_id = parse_tool_id(tool.get('tool_id',''))
    rid = rec['repo_id']
    name = (tool.get('metadata') or {}).get('name') if isinstance(tool.get('metadata'), dict) else None
    if not name: name = tool.get('name') or name_from_id or 'unknown'
    desc = None
    md_old = tool.get('metadata') if isinstance(tool.get('metadata'), dict) else {}
    if isinstance(md_old, dict): desc = md_old.get('description')
    desc = tool.get('description') or desc
    raw_schema = None
    if isinstance(md_old.get('inputSchema'), dict):
        raw_schema = md_old['inputSchema'].get('raw') or md_old['inputSchema']
    raw_schema = tool.get('input_schema') or tool.get('inputSchema') or raw_schema
    if not isinstance(raw_schema, dict):
        raw_schema = {'type':'object','properties':{},'required':[]}
    params = schema_to_params(raw_schema)
    annotations = default_annotations()
    if isinstance(md_old.get('annotations'), dict): annotations.update({k: md_old['annotations'].get(k) for k in annotations if k in md_old['annotations']})
    if isinstance(tool.get('annotations'), dict): annotations.update({k: tool['annotations'].get(k) for k in annotations if k in tool['annotations']})
    if isinstance(md_old.get('annotations'), dict) and 'readOnlyHint' in md_old['annotations']:
        pass
    elif isinstance(md_old.get('metadata'), dict) and isinstance(md_old['metadata'].get('annotations'), dict):
        annotations.update({k: md_old['metadata']['annotations'].get(k) for k in annotations if k in md_old['metadata']['annotations']})
    # Agent-specific metadata sometimes stores annotations nested inside metadata dict itself.
    if isinstance(md_old.get('annotations'), dict):
        annotations.update({k: md_old['annotations'].get(k) for k in annotations if k in md_old['annotations']})

    code_old = tool.get('code') if isinstance(tool.get('code'), dict) else {}
    ep_old = code_old.get('entry_point') if isinstance(code_old.get('entry_point'), dict) else {}
    file = ep_old.get('file') or file_from_id or code_old.get('file') or md_old.get('implementation_file') or md_old.get('registration_file')
    line = ep_old.get('line_start') or line_from_id or md_old.get('implementation_line') or md_old.get('registration_line') or 1
    try: line=int(line)
    except Exception: line=1
    content = ep_old.get('function_content') or code_old.get('handler') or code_old.get('function_content') or ''
    line_start = ep_old.get('line_start') or line
    line_end = ep_old.get('line_end') or line
    if file:
        s,e,src = extract_content(rid, file, line)
        if src:
            # Prefer actual source file snippet over compact signature-only handler strings.
            content = src
            line_start, line_end = s, e
    fn = ep_old.get('function_name') or function_name_from_content(content, name)
    handler_resolution = code_old.get('handler_resolution')
    if not handler_resolution:
        reg = code_old.get('registration')
        if reg:
            handler_resolution = f"registration `{reg}` resolved to handler/function `{fn}`"
        else:
            handler_resolution = md_old.get('registration_style') or 'source-located tool registration/handler'
    sdk = tool.get('sdk') or infer_sdk(file or '', content)
    meta_extra = {}
    for k,v in md_old.items():
        if k not in {'name','title','description','icons','inputSchema','outputSchema','annotations','execution','_meta'}:
            meta_extra[k]=v
    return {
        'tool_id': tool.get('tool_id') or f"{rid}::{name}::{file}:{line_start}",
        'sdk': sdk,
        'metadata': {
            'name': name,
            'title': md_old.get('title'),
            'description': desc,
            'icons': md_old.get('icons') if isinstance(md_old.get('icons'), list) else [],
            'inputSchema': {
                'raw': raw_schema,
                'schema_dialect': (md_old.get('inputSchema') or {}).get('schema_dialect') if isinstance(md_old.get('inputSchema'), dict) else 'unknown',
                'parameters': params,
            },
            'outputSchema': md_old.get('outputSchema') if isinstance(md_old.get('outputSchema'), dict) else {'raw': None, 'schema_dialect': 'absent'},
            'annotations': annotations,
            'execution': md_old.get('execution') if isinstance(md_old.get('execution'), dict) else {'taskSupport': 'absent', 'extra_fields': {}},
            '_meta': md_old.get('_meta') if isinstance(md_old.get('_meta'), dict) else {'raw': None, 'extra_fields': meta_extra},
        },
        'code': {
            'entry_point': {
                'file': file,
                'line_start': int(line_start) if line_start else line,
                'line_end': int(line_end) if line_end else line,
                'function_name': fn,
                'function_content': content,
            },
            'handler_resolution': handler_resolution,
        }
    }


def main():
    data=json.loads(RECORDS.read_text(encoding='utf-8'))
    for rec in data:
        rec['tool']=[normalize_tool(rec,t) for t in rec.get('tool',[])]
    RECORDS.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    print('normalized', len(data), 'records', sum(len(r.get('tool',[])) for r in data), 'tools')

if __name__=='__main__': main()
