#!/usr/bin/env python3
import csv
import json
from collections import Counter
from pathlib import Path

BASE = Path('/Users/syt/Documents/CodexForMe/MCP可选项研究/tool_extract_github_payload')
OUT = BASE / 'manual_validation_151_300_full'
CHUNKS = OUT / 'chunks'
MANIFEST = BASE / 'full_repos_151_300' / 'repo_manifest_151_300.json'

STATUS_MAP = {
    'ok': 'TOOL_SERVER_SOURCE_CONFIRMED',
    'reviewed': 'TOOL_SERVER_SOURCE_CONFIRMED',
    'tools_found': 'TOOL_SERVER_SOURCE_CONFIRMED',
    'ok_tools_extracted': 'TOOL_SERVER_SOURCE_CONFIRMED',
    'ok_example_tools_extracted_external_handlers': 'TOOL_SERVER_SOURCE_CONFIRMED',
    'ok_static_proxy_tools_extracted': 'TOOL_SERVER_SOURCE_CONFIRMED',
    'ok_tools_extracted_default_registry': 'TOOL_SERVER_SOURCE_CONFIRMED',
    'tools_found_nonstandard_mcp_like_handler': 'NONSTANDARD_TOOL_SURFACE',
    'tools_found_nonstandard_http_protocol': 'NONSTANDARD_TOOL_SURFACE',
    'reviewed_no_tools': 'NO_MCP_TOOL_SOURCE_FOUND',
    'no_mcp_tool_registration_found': 'NO_MCP_TOOL_SOURCE_FOUND',
    'NO_SOURCE_TOOL_REGISTRATION_FOUND': 'NO_MCP_TOOL_SOURCE_FOUND',
    'NO_SOURCE_OR_README_ONLY': 'NO_MCP_TOOL_SOURCE_FOUND',
    'no_server_source': 'NO_MCP_TOOL_SOURCE_FOUND',
    'CLONE_EMPTY_OR_FAILED': 'NO_SOURCE_AVAILABLE',
    'clone_failed_no_source': 'NO_SOURCE_AVAILABLE',
    'clone_failed_incomplete_directory': 'NO_SOURCE_AVAILABLE',
    'NO_WORKTREE_SOURCE': 'NO_SOURCE_AVAILABLE',
    'NO_SOURCE_AVAILABLE_TIMEOUT': 'NO_SOURCE_AVAILABLE',
    'NO_SERVER_SOURCE_TOOLS_FOUND': 'NO_MCP_TOOL_SOURCE_FOUND',
    'no_mcp_tool_registration': 'NO_MCP_TOOL_SOURCE_FOUND',
    'ok_tools_extracted_dynamic_decorated_methods': 'TOOL_SERVER_SOURCE_CONFIRMED_DYNAMIC',
    'ok_tools_extracted_duplicate_deduped': 'TOOL_SERVER_SOURCE_CONFIRMED',
    'ok_tools_extracted_clone_status_failed_but_source_present': 'TOOL_SERVER_SOURCE_CONFIRMED',
    'ok_tools_extracted_stdio_server': 'TOOL_SERVER_SOURCE_CONFIRMED',
}



def norm_status(status, tool_count):
    if status in STATUS_MAP:
        return STATUS_MAP[status]
    if status:
        return status
    return 'TOOL_SERVER_SOURCE_CONFIRMED' if tool_count else 'NO_MCP_TOOL_SOURCE_FOUND'


def main():
    records = []
    manifest_rows = json.loads(MANIFEST.read_text(encoding='utf-8')) if MANIFEST.exists() else []
    manifest_by_id = {m['repo_id']: m for m in manifest_rows}
    chunk_paths = sorted(CHUNKS.glob('chunk_*_*.json'))
    for path in chunk_paths:
        data = json.loads(path.read_text(encoding='utf-8'))
        for rec in data:
            tools = rec.get('tool') or []
            rid3 = f"{int(rec['repo_id']):03d}"
            # Normalize names to the validation/manifest convention used by the prior 1-150 output.
            if rid3 in manifest_by_id:
                rec['repo_name'] = f"{manifest_by_id[rid3]['owner']}__{manifest_by_id[rid3]['repo']}"
            rec['source'] = 'github_full_clone'
            rec['status_raw'] = rec.get('status')
            rec['status'] = norm_status(rec.get('status'), len(tools))
            records.append(rec)
    records.sort(key=lambda r: int(r['repo_id']))
    ids = [int(r['repo_id']) for r in records]
    missing = [i for i in range(151, 301) if i not in ids]
    dup_ids = sorted(k for k, v in Counter(ids).items() if v > 1)
    if missing or dup_ids:
        raise SystemExit(f'missing={missing} dup_ids={dup_ids}')
    tool_ids = []
    for rec in records:
        for tool in rec.get('tool') or []:
            tool_ids.append(tool.get('tool_id'))
    dup_tools = sorted(k for k, v in Counter(tool_ids).items() if v > 1)
    if dup_tools:
        raise SystemExit(f'duplicate tool_id: {dup_tools[:20]}')

    (OUT / 'mcp_tool_metadata_records_151_300_full.json').write_text(
        json.dumps(records, ensure_ascii=False, indent=2), encoding='utf-8'
    )

    manifest = manifest_by_id
    with (OUT / 'repo_summary_151_300_full.csv').open('w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, fieldnames=['repo_id','repo_name','clone_status','tool_count','status','status_raw','notes'])
        w.writeheader()
        for rec in records:
            rid = f"{int(rec['repo_id']):03d}"
            w.writerow({
                'repo_id': rec['repo_id'],
                'repo_name': rec.get('repo_name'),
                'clone_status': (manifest.get(rid) or {}).get('clone_status'),
                'tool_count': len(rec.get('tool') or []),
                'status': rec.get('status'),
                'status_raw': rec.get('status_raw'),
                'notes': rec.get('notes'),
            })

    notes = []
    notes.append('# Full-source manual validation 151-300')
    notes.append('')
    notes.append(f'- Repo records: {len(records)}')
    notes.append(f'- Tool records: {len(tool_ids)}')
    notes.append(f'- Repos with tools: {sum(1 for r in records if r.get("tool"))}')
    notes.append(f'- Tool IDs unique: {len(tool_ids) == len(set(tool_ids))}')
    notes.append('')
    notes.append('## Status Counts')
    for status, count in Counter(r.get('status') for r in records).most_common():
        notes.append(f'- {status}: {count}')
    notes.append('')
    notes.append('## Clone Status Counts')
    for status, count in Counter((manifest.get(f"{int(r['repo_id']):03d}") or {}).get('clone_status') for r in records).most_common():
        notes.append(f'- {status}: {count}')
    notes.append('')
    notes.append('## Tools By Repo')
    for rec in records:
        tc = len(rec.get('tool') or [])
        if tc:
            notes.append(f'- {rec["repo_id"]} {rec.get("repo_name")}: {tc}')
    (OUT / 'full_review_summary_151_300.md').write_text('\n'.join(notes) + '\n', encoding='utf-8')

    print('records', len(records))
    print('tools', len(tool_ids))
    print('tool_repos', sum(1 for r in records if r.get('tool')))
    print('statuses', Counter(r.get('status') for r in records))

if __name__ == '__main__':
    main()
