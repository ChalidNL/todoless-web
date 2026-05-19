/// <reference path="../../pb_data/types.d.ts" />

// Minimal OpenAPI 3.0 spec — test if Goja can handle string concatenation
routerAdd('GET', '/api/todoless/openapi.json', (c) => {
  var spec = '{"openapi":"3.0.3","info":{"title":"TodoLess API","version":"1.0.0"},"paths":{}}';
  var obj = JSON.parse(spec);
  return c.json(200, obj);
});