/// <reference path="../../pb_data/types.d.ts" />

// Minimal OpenAPI spec — served as static JSON string
// to avoid Goja engine issues with complex object construction.

routerAdd('GET', '/api/todoless/openapi.json', (c) => {
  var spec = {
    openapi: "3.0.3",
    info: {
      title: "Todoless API",
      version: "1.0.0",
      description: "Todoless — self-hosted multi-user task and grocery manager.",
    },
    servers: [{ url: "/api", description: "Proxy (port 7070)" }],
    paths: {
      "/todoless/hook-health": {
        get: { tags: ["System"], summary: "Health check", responses: { "200": { description: "OK" } } },
      },
      "/todoless/setup-status": {
        get: { tags: ["System"], summary: "Setup status", responses: { "200": { description: "Setup status" } } },
      },
      "/todoless/openapi.json": {
        get: { tags: ["System"], summary: "OpenAPI spec", responses: { "200": { description: "OpenAPI spec" } } },
      },
      "/todoless/docs": {
        get: { tags: ["System"], summary: "Swagger UI", responses: { "200": { description: "Swagger UI HTML" } } },
      },
    },
  };
  return c.json(200, spec);
});
