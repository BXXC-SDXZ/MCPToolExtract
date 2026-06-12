export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  
  return Response.json({
    resource: `${origin}`,
    authorization_servers: [`${origin}/.well-known/oauth-authorization-server`],
    // scopes_supported: [],
    resource_name: "MCP Server",
    resource_documentation: `${origin}/docs`
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Content-Type': 'application/json',
    }
  });
} 