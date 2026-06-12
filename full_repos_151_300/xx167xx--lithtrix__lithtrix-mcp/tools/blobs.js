/**
 * Lithtrix blob MCP tools — PUT/GET/DELETE /v1/blobs, list, meta.
 * Requires LITHTRIX_API_KEY (and optional LITHTRIX_API_URL).
 */

import { z } from "zod";

const LITHTRIX_API_URL = process.env.LITHTRIX_API_URL ?? "https://lithtrix.ai";

const blobIdSchema = z
  .string()
  .length(19)
  .regex(/^b_[0-9a-f]{16}$/)
  .describe("Content-addressed blob id (b_ + 16 hex chars)");

function missingApiKeyResponse() {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          error:
            "LITHTRIX_API_KEY environment variable is not set. " +
            "Register at https://lithtrix.ai and use lithtrix_register, then set the key.",
        }),
      },
    ],
    isError: true,
  };
}

function networkErrorResponse(err) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          error: `Network error contacting Lithtrix API: ${err.message}`,
        }),
      },
    ],
    isError: true,
  };
}

async function apiJsonResponse(response) {
  let body;
  try {
    body = await response.json();
  } catch {
    body = { message: `Invalid JSON (HTTP ${response.status})` };
  }

  if (!response.ok) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: body.message ?? `Lithtrix API error (HTTP ${response.status})`,
            error_code: body.error_code ?? "UNKNOWN",
            status: body.status,
          }),
        },
      ],
      isError: true,
    };
  }

  return {
    content: [{ type: "text", text: JSON.stringify(body, null, 2) }],
  };
}

async function blobDownloadResult(response) {
  if (!response.ok) {
    let body;
    try {
      body = await response.json();
    } catch {
      body = {};
    }
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: body.message ?? `Lithtrix API error (HTTP ${response.status})`,
            error_code: body.error_code ?? "UNKNOWN",
            status: body.status,
          }),
        },
      ],
      isError: true,
    };
  }

  const buf = await response.arrayBuffer();
  const b64 = Buffer.from(buf).toString("base64");
  const ct = response.headers.get("content-type") || "application/octet-stream";
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            content_base64: b64,
            content_type: ct,
            size_bytes: buf.byteLength,
          },
          null,
          2
        ),
      },
    ],
  };
}

async function deleteBlobResult(response) {
  if (response.status === 204) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ status: "success", deleted: true }, null, 2),
        },
      ],
    };
  }
  return apiJsonResponse(response);
}

export function registerBlobTools(server) {
  server.tool(
    "lithtrix_blob_upload",
    "Upload binary bytes via PUT /v1/blobs (raw body + Content-Type). " +
      "Decode base64 from content_base64. For large files prefer direct HTTP multipart/raw PUT. " +
      "Requires LITHTRIX_API_KEY. Subject to BLOB_MAX_UPLOAD_BYTES and BLOB_STORAGE_LIMIT.",
    {
      content_base64: z
        .string()
        .min(1)
        .describe("Standard base64-encoded file bytes (no data: URL prefix)"),
      content_type: z
        .string()
        .min(1)
        .max(255)
        .describe("MIME type sent as Content-Type (e.g. application/pdf)"),
      filename: z
        .string()
        .max(512)
        .optional()
        .describe("Optional display filename (sent as filename query on the request)"),
    },
    async ({ content_base64, content_type, filename }) => {
      const apiKey = process.env.LITHTRIX_API_KEY;
      if (!apiKey) return missingApiKeyResponse();

      let binary;
      try {
        binary = Buffer.from(content_base64, "base64");
      } catch (err) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: `Invalid base64: ${err.message}` }),
            },
          ],
          isError: true,
        };
      }

      const url = new URL("/v1/blobs", LITHTRIX_API_URL);
      if (filename !== undefined) url.searchParams.set("filename", filename);

      let response;
      try {
        response = await fetch(url.toString(), {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": content_type,
          },
          body: binary,
        });
      } catch (err) {
        return networkErrorResponse(err);
      }
      return apiJsonResponse(response);
    }
  );

  server.tool(
    "lithtrix_blob_download",
    "Download blob bytes (GET /v1/blobs/{blob_id}). Returns JSON with content_base64 and content_type. " +
      "Requires LITHTRIX_API_KEY.",
    { blob_id: blobIdSchema },
    async ({ blob_id }) => {
      const apiKey = process.env.LITHTRIX_API_KEY;
      if (!apiKey) return missingApiKeyResponse();

      const path = `/v1/blobs/${encodeURIComponent(blob_id)}`;
      let response;
      try {
        response = await fetch(new URL(path, LITHTRIX_API_URL), {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "*/*",
          },
        });
      } catch (err) {
        return networkErrorResponse(err);
      }
      return blobDownloadResult(response);
    }
  );

  server.tool(
    "lithtrix_blob_list",
    "List blob metadata (GET /v1/blobs). Optional page and per_page. Requires LITHTRIX_API_KEY.",
    {
      page: z.number().int().min(1).optional().describe("Page (default 1)"),
      per_page: z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe("Page size (1–100, default 50)"),
    },
    async ({ page, per_page }) => {
      const apiKey = process.env.LITHTRIX_API_KEY;
      if (!apiKey) return missingApiKeyResponse();

      const url = new URL("/v1/blobs", LITHTRIX_API_URL);
      if (page !== undefined) url.searchParams.set("page", String(page));
      if (per_page !== undefined) url.searchParams.set("per_page", String(per_page));

      let response;
      try {
        response = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
      } catch (err) {
        return networkErrorResponse(err);
      }
      return apiJsonResponse(response);
    }
  );

  server.tool(
    "lithtrix_blob_meta",
    "Get JSON metadata for one blob (GET /v1/blobs/{blob_id}/meta). Requires LITHTRIX_API_KEY.",
    { blob_id: blobIdSchema },
    async ({ blob_id }) => {
      const apiKey = process.env.LITHTRIX_API_KEY;
      if (!apiKey) return missingApiKeyResponse();

      const path = `/v1/blobs/${encodeURIComponent(blob_id)}/meta`;
      let response;
      try {
        response = await fetch(new URL(path, LITHTRIX_API_URL), {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
      } catch (err) {
        return networkErrorResponse(err);
      }
      return apiJsonResponse(response);
    }
  );

  server.tool(
    "lithtrix_blob_delete",
    "Soft-delete a blob (DELETE /v1/blobs/{blob_id}). Requires LITHTRIX_API_KEY.",
    { blob_id: blobIdSchema },
    async ({ blob_id }) => {
      const apiKey = process.env.LITHTRIX_API_KEY;
      if (!apiKey) return missingApiKeyResponse();

      const path = `/v1/blobs/${encodeURIComponent(blob_id)}`;
      let response;
      try {
        response = await fetch(new URL(path, LITHTRIX_API_URL), {
          method: "DELETE",
          headers: { Authorization: `Bearer ${apiKey}` },
        });
      } catch (err) {
        return networkErrorResponse(err);
      }
      return deleteBlobResult(response);
    }
  );

  server.tool(
    "lithtrix_blob_signed_url",
    "Mint a time-limited HTTPS read URL for a blob (GET /v1/blobs/{blob_id}/signed-url). " +
      "Anyone with the URL can GET bytes until expiry — share carefully. Requires LITHTRIX_API_KEY.",
    {
      blob_id: blobIdSchema,
      expires_in: z
        .number()
        .int()
        .min(60)
        .optional()
        .describe("TTL seconds (min 60; max from server). Omit for API default."),
    },
    async ({ blob_id, expires_in }) => {
      const apiKey = process.env.LITHTRIX_API_KEY;
      if (!apiKey) return missingApiKeyResponse();

      const url = new URL(
        `/v1/blobs/${encodeURIComponent(blob_id)}/signed-url`,
        LITHTRIX_API_URL
      );
      if (expires_in !== undefined) {
        url.searchParams.set("expires_in", String(expires_in));
      }

      let response;
      try {
        response = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
      } catch (err) {
        return networkErrorResponse(err);
      }
      return apiJsonResponse(response);
    }
  );
}
