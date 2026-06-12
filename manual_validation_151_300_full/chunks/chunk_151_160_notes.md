# Manual validation notes: repos 151-160

## 151 JoshuaSiraj__mcp_auto_register

- Status: ok_example_tools_extracted_external_handlers

- Tools extracted: 2

- Notes: Core source is a helper library that dynamically scans caller-selected external Python packages and calls FastMCP.tool(name=...)(func) in src/mcp_auto_register/register.py:50 and :94. The scipy example has fixed source-level filter ['eigh', 'inv'], so those two example-server tools are recorded with external-handler notes; nba_api example registers a dynamic external class set and was not enumerated.

- Tool names: eigh, inv



## 152 josx__mcp_demo

- Status: ok_tools_extracted

- Tools extracted: 3

- Notes: server.py creates FastMCP('Demo') and runs it over SSE; only @mcp.tool decorators were extracted, resources/prompts were ignored.

- Tool names: echo_tool, add, fetch_u



## 153 jsonresume__mcp

- Status: ok_tools_extracted

- Tools extracted: 3

- Notes: index.ts registers ListToolsRequestSchema/CallToolRequestSchema. The branch for github_hello_tool is not exposed because src/tools.ts tools array only contains three GitHub/jsonresume tools, so it was not recorded.

- Tool names: github_analyze_codebase, github_check_resume, github_enhance_resume_with_project



## 154 juergenkoller-software__nemeton-mcp

- Status: ok_static_proxy_tools_extracted

- Tools extracted: 49

- Notes: Swift stdio bridge exposes a baked-in tools/list snapshot (49 tools) and proxies live JSON-RPC to a local Nemeton HTTP app. No per-tool Swift handler exists in the clone; handler_resolution notes the proxy boundary.

- Tool names: list_vms, get_vm, create_vm, update_vm, clone_vm, delete_vm, reorder_vms, stop_all, start_vm, stop_vm, force_stop_vm, pause_vm, resume_vm, suspend_vm, get_suspend_status, list_snapshots, create_snapshot, restore_snapshot, delete_snapshot, send_console, read_console, console_execute, take_screenshot, vm_ip, ssh_execute, file_upload, file_download, file_list, gui_launch, gui_windows, vscode_command, select_vm, clipboard_read, clipboard_write, get_host_info, get_metrics, resize_disk, export_vm, import_vm, list_distros, fullscreen_enter, fullscreen_exit, fullscreen_toggle, list_webhooks, register_webhook, delete_webhook, vm_runtime, vm_errors, list_downloads



## 155 Karlheinzniebuhr__MCP-Server-Client-Demo-with-Gemini

- Status: ok_tools_extracted

- Tools extracted: 2

- Notes: weather_tool_server.py creates FastMCP('weather') and runs stdio; two weather tools were extracted.

- Tool names: get_alerts, get_forecast



## 156 kattatzu-resources__mcp-server

- Status: ok_tools_extracted

- Tools extracted: 2

- Notes: src/tools/index.ts returns SumTool and PingTool. Resources/prompts exist but were not recorded as tools.

- Tool names: ping, sum



## 157 kesslerio__attio-mcp-server

- Status: ok_tools_extracted_default_registry

- Tools extracted: 43

- Notes: Default runtime exposes TOOL_DEFINITIONS for UNIVERSAL + lists + workspace members (registry.ts:78-86, 103-111). Legacy resource-specific configs are present but gated behind DISABLE_UNIVERSAL_TOOLS=true, so they are not included in this default tools/list extraction.

- Tool names: aaa-health-check, smithery_debug_config, search_records, get_record_details, create_company, update_company, create_deal, update_deal, create_record, update_record, delete_record, get_record_attributes, discover_record_attributes, get_record_attribute_options, get_record_info, create_note, list_notes, get_record_interactions, search_records_advanced, search_records_by_relationship, search_records_by_content, search_records_by_timeframe, batch_records, batch_search_records, search, fetch, get-lists, get-record-list-memberships, get-list-details, get-list-entries, filter-list-entries, advanced-filter-list-entries, add-record-to-list, remove-record-from-list, update-list-entry, manage-list-entry, filter-list-entries-by-parent, filter-list-entries-by-parent-id, create-list, update-list-configuration, list-workspace-members, search-workspace-members, get-workspace-member



## 158 Khamel83__argus

- Status: ok_tools_extracted

- Tools extracted: 13

- Notes: argus/mcp/server.py defines serve_mcp() and registers FastMCP tools inside it. Admin health/budget/provider/cookie tools are conditionally exposed when transport is stdio (the default) or remote auth is enabled.

- Tool names: search_web, recover_url, expand_links, extract_content, valyu_answer, argus_paths, recover_dead_article, capture_site, build_research_pack, search_health, search_budgets, test_provider, cookie_health



## 159 kiseki-technologies__kiseki-labs-readwise-mcp

- Status: ok_tools_extracted

- Tools extracted: 8

- Notes: server.py creates FastMCP('Kiseki-Labs-Readwise-MCP') and registers eight Readwise tools. The greeting resource at lines 254-258 was ignored.

- Tool names: find_readwise_documents_by_names, list_readwise_documents_by_filters, get_readwise_highlights_by_document_ids, get_readwise_highlights_by_filters, get_readwise_tags, add_readwise_tag, update_readwise_tag, delete_readwise_tag



## 160 Kristos123__MCP-server

- Status: no_server_source

- Tools extracted: 0

- Notes: Clone contains README.md and git metadata only; no MCP server source file or tool registration was present.


