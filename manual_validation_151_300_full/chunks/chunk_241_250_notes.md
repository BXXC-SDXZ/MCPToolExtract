# Manual validation notes: repos 241-250

## 241 Sabastua__mcp-server

- Status: no_server_source

- Tools extracted: 0

- Notes: Full clone is present but contains README.md plus git metadata only; no MCP server source or tool registration was found.

- Tool names: (none)

## 242 Sachin-Bhat__stela-mcp

- Status: ok_tools_extracted

- Tools extracted: 14

- Notes: src/stela_mcp/server.py registers low-level @self.server.list_tools() and @self.server.call_tool() handlers. list_tools_impl returns 14 static filesystem/shell tools; call_tool dispatches by tool_name to same-named LocalSystemServer methods.

- Tool names: read_file, read_multiple_files, write_file, edit_file, create_directory, list_directory, directory_tree, move_file, search_files, get_file_info, list_allowed_directories, execute_command, change_directory, show_security_rules

## 243 sahil101__mcp-server-demo

- Status: no_server_source

- Tools extracted: 0

- Notes: Full clone contains README.md plus git metadata only; no MCP server source or tool registration was found.

- Tool names: (none)

## 244 saidsef__mcp-github-pr-issue-analyser

- Status: ok_tools_extracted_dynamic_decorated_methods

- Tools extracted: 21

- Notes: src/mcp_github/issues_pr_analyser.py dynamically registers GitHubIntegration methods that have _mcp_annotations. Only decorated source methods were recorded; FastMCP provider apps/resources/skills were not treated as tools.

- Tool names: get_pr_diff, get_pr_content, add_pr_comments, add_inline_pr_comment, update_pr_description, create_pr, list_open_issues_prs, create_issue, merge_pr, update_pr_branch, update_issue, update_reviews, update_assignees, get_latest_sha, create_tag, create_release, search_user, get_user_activities, get_repo_stars_since, get_pr_linked_issues, get_pr_status_checks

## 245 sajithamma__prokerala-mcp-server

- Status: ok_tools_extracted_duplicate_deduped

- Tools extracted: 15

- Notes: coremcp.py creates FastMCP("Prokerala MCP") and has 16 @mcp.tool decorators. The duplicate exposed name get_panchang at coremcp.py:271 was skipped, leaving 15 distinct tool names.

- Tool names: get_panchang, get_kundli, get_calendar, get_auspicious_period, get_inauspicious_period, get_daily_horoscope, get_birth_details, get_kaal_sarp_dosha, get_manglik_dosha, get_chart, get_planet_positions, get_kundli_matching, get_porutham, get_papasamyam, get_mangal_dosha

## 246 Sanjay-87__simple-mcp-server

- Status: no_mcp_tool_registration

- Tools extracted: 0

- Notes: index.js is an Express/OpenAI HTTP endpoint at /mcp/context, not an MCP protocol server with tools/list or registered MCP tools; no MCP tools recorded.

- Tool names: (none)

## 247 sanskarmk__mcp_repo_c11db53a

- Status: no_server_source

- Tools extracted: 0

- Notes: Full clone contains README.md plus git metadata only; no MCP server source or tool registration was found.

- Tool names: (none)

## 248 seanmillionaire__hypnotic-meditations-mcp

- Status: ok_tools_extracted_clone_status_failed_but_source_present

- Tools extracted: 2

- Notes: Manifest clone_status is failed:128 because destination already existed, but the source directory contains index.js/server-http.js/package files and was reviewed. index.js exposes two tools through ListToolsRequestSchema and handles both in CallToolRequestSchema; duplicate HTTP server registrations were not double-counted.

- Tool names: get_recommendation, list_products

## 249 serkan-ozal__driflyte-mcp-server

- Status: ok_tools_extracted

- Tools extracted: 2

- Notes: src/server.ts creates an McpServer and registers each Tool from src/tools/index.ts with server.registerTool. Two concrete Tool classes are exported and recorded. Remote catalog/server.json entries were ignored.

- Tool names: list-topics, search

## 250 sgroy10__speclock

- Status: ok_tools_extracted_stdio_server

- Tools extracted: 51

- Notes: package.json main points to src/mcp/server.js. That stdio MCP server registers 51 tools via server.tool(...). src/mcp/http-server.js exposes a smaller remote subset and was not double-counted; public HTTP API endpoints and docs were ignored.

- Tool names: speclock_init, speclock_get_context, speclock_set_goal, speclock_add_lock, speclock_remove_lock, speclock_add_decision, speclock_add_note, speclock_set_deploy_facts, speclock_log_change, speclock_get_changes, speclock_get_events, speclock_check_conflict, speclock_session_briefing, speclock_session_summary, speclock_checkpoint, speclock_repo_status, speclock_suggest_locks, speclock_detect_drift, speclock_health, speclock_apply_template, speclock_report, speclock_audit, speclock_verify_audit, speclock_export_compliance, speclock_set_enforcement, speclock_override_lock, speclock_semantic_audit, speclock_override_history, speclock_policy_evaluate, speclock_policy_manage, speclock_telemetry, speclock_add_typed_lock, speclock_check_typed, speclock_list_typed_locks, speclock_update_threshold, speclock_compile_spec, speclock_build_graph, speclock_blast_radius, speclock_map_locks, speclock_review_patch, speclock_review_patch_diff, speclock_parse_diff, speclock_sync_rules, speclock_replay, speclock_list_sessions, speclock_drift_score, speclock_coverage, speclock_strengthen, speclock_list_sync_formats, speclock_protect, speclock_discover_rules

