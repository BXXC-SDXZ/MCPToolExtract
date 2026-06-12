function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.byteLength !== bb.byteLength) return false;
  return crypto.subtle.timingSafeEqual(ab, bb);
}

export function requireInternalAuth(request: Request, secret: string): Response | null {
  const provided = request.headers.get("X-Internal-Secret") ?? "";
  if (!timingSafeEqual(provided, secret)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
