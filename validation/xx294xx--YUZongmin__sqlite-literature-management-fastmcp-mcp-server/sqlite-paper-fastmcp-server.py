"""Compatibility entrypoint for the modular sqlite_lit_server package."""

import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from sqlite_lit_server import (
    DB_PATH,
    EntityRelations,
    SQLiteConnection,
    SourceIdentifiers,
    SourceStatus,
    SourceTypes,
    add_identifiers,
    add_notes,
    add_sources,
    describe_table,
    get_database_info,
    get_entity_sources,
    get_source_entities,
    get_sources_details,
    get_table_stats,
    link_to_entities,
    list_tables,
    mcp,
    read_query,
    remove_entity_links,
    search_sources,
    update_entity_links,
    update_status,
    vacuum_database,
)

__all__ = [
    "DB_PATH",
    "EntityRelations",
    "SQLiteConnection",
    "SourceIdentifiers",
    "SourceStatus",
    "SourceTypes",
    "add_identifiers",
    "add_notes",
    "add_sources",
    "describe_table",
    "get_database_info",
    "get_entity_sources",
    "get_source_entities",
    "get_sources_details",
    "get_table_stats",
    "link_to_entities",
    "list_tables",
    "mcp",
    "read_query",
    "remove_entity_links",
    "search_sources",
    "update_entity_links",
    "update_status",
    "vacuum_database",
]


if __name__ == "__main__":
    mcp.run()
