"""
You.com search provider.

API: https://api.you.com/search
Independent index with vertical search (News, Healthcare, Legal).
"""

import time
from typing import List, Tuple

import httpx

from argus.config import ProviderConfig
from argus.logging import get_logger
from argus.models import (
    ProviderName,
    ProviderStatus,
    ProviderTrace,
    SearchResult,
    SearchQuery,
)
from argus.providers.base import BaseProvider

logger = get_logger("providers.you")

YOU_API_BASE = "https://api.you.com/v1/search"


class YouProvider(BaseProvider):
    def __init__(self, config: ProviderConfig):
        self._config = config

    @property
    def name(self) -> ProviderName:
        return ProviderName.YOU

    def is_available(self) -> bool:
        return self._config.enabled and bool(self._config.api_key)

    def status(self) -> ProviderStatus:
        if not self._config.enabled:
            return ProviderStatus.DISABLED_BY_CONFIG
        if not self._config.api_key:
            return ProviderStatus.UNAVAILABLE_MISSING_KEY
        return ProviderStatus.ENABLED

    async def search(self, query: SearchQuery) -> Tuple[List[SearchResult], ProviderTrace]:
        start = time.monotonic()

        if not self.is_available():
            return [], ProviderTrace(
                provider=self.name,
                status="skipped",
                error="You.com provider not configured",
            )

        headers = {
            "X-API-Key": self._config.api_key,
        }
        params = {
            "query": query.query,
            "count": query.max_results,
            "safesearch": "off",
        }

        try:
            async with httpx.AsyncClient(timeout=self._config.timeout_seconds) as client:
                resp = await client.get(YOU_API_BASE, params=params, headers=headers)
                resp.raise_for_status()
                data = resp.json()

            web_results = data.get("results", {}).get("web", [])
            results = self._normalize(web_results)
            latency_ms = int((time.monotonic() - start) * 1000)

            trace = ProviderTrace(
                provider=self.name,
                status="success",
                results_count=len(results),
                latency_ms=latency_ms,
            )
            return results, trace

        except Exception as e:
            latency_ms = int((time.monotonic() - start) * 1000)
            logger.warning("You.com search failed: %s", e)
            trace = ProviderTrace(
                provider=self.name,
                status="error",
                latency_ms=latency_ms,
                error=str(e),
            )
            return [], trace

    def _normalize(self, raw_results: list) -> List[SearchResult]:
        results = []
        for i, item in enumerate(raw_results):
            url = item.get("url") or ""
            if not url:
                continue
            # You.com returns snippets as a list; join the first one
            snippets = item.get("snippets", [])
            snippet = snippets[0] if snippets else item.get("description", "")
            results.append(SearchResult(
                url=url,
                title=item.get("title", ""),
                snippet=snippet,
                domain=self._extract_domain(url),
                provider=self.name,
                score=0.0,
                raw_rank=i,
            ))
        return results

    @staticmethod
    def _extract_domain(url: str) -> str:
        try:
            from urllib.parse import urlparse
            return urlparse(url).netloc
        except Exception:
            return ""
