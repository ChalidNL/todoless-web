// pb_hooks/routes/api-tokens.js
// CRUD API for API tokens management (create, list, revoke, toggle).
// Handles both PB session auth and Bearer token auth.

// ─── Bearer token auth middleware (PB 0.35.1: must be in each file separately) ──
function bearerAuthMiddleware(c) {
  try {
    var authHeader = c.request().header.get('Authorization');
    if (!authHeader) return null;
    var parts = String(authHeader).split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
      return c.json(401, { 'error': 'Invalid Authorization header format. Use: Bearer <token>' });
    }
    var token = parts[1].trim();
    if (!token) return c.json(401, { 'error': 'Empty token' });
    var hashed = (function(tok) { try { return $security.SHA256(tok); } catch(e) { var h=0;if(tok.length===0)return'd';for(var i=0;i<tok.length;i++){h=((h<<5)-h)+tok.charCodeAt(i);h=h&h;}return'd_'+Math.abs(h).toString(16).padStart(8,'0');} })(token);
    var tokens = $app.findRecordsByFilter('api_tokens','token_hash = "'+hashed+'"','-created',1,0);
    if (tokens.length === 0) return null;
    var tokRec = tokens[0];
    var rawEnabled = tokRec.get('enabled');
    if (rawEnabled === false || rawEnabled === 0 || rawEnabled === 'false') return c.json(401,{'error':'API token is disabled'});
    var rawExp = tokRec.get('expires_at');
    if (rawExp) { var expMs=0;if(typeof rawExp==='string')expMs=new Date(rawExp).getTime();else if(rawExp&&typeof rawExp.getTime==='function')expMs=rawExp.getTime();else if(rawExp)expMs=new Date(String(rawExp)).getTime();var nowMs=new Date().getTime();if(expMs>0&&expMs<nowMs)return c.json(401,{'error':'API token has expired'}); }
    var userId = String(tokRec.get('user')||'');
    var user = null; try { user = $app.findRecordById('users',userId); } catch(e) { return c.json(401,{'error':'Token owner not found'}); }
    if (!user) return c.json(401,{'error':'Token owner not found'});
    var rawActive = user.get('active');
    if (rawActive === false || rawActive === 0 || rawActive === 'false') return c.json(403,{'error':'Token owner account is blocked'});
    var rawPerms = tokRec.get('permissions');
    if (!rawPerms || (Array.isArray(rawPerms)&&rawPerms.length===0)) rawPerms = tokRec.get('scopes');
    var perms = []; if (Array.isArray(rawPerms)) perms=rawPerms; else if (typeof rawPerms==='string') try { perms=JSON.parse(rawPerms); } catch(e){}
    c.set('apiTokenInfo',{token_id:tokRec.id,token_name:String(tokRec.get('name')||''),user_id:user.id,user_role:String(user.get('role')||'user'),user_name:String(user.get('name')||user.get('email')||''),family_id:String(user.get('family_id')||''),permissions:perms});
    c.set('authRecord',user);
    return null;
  } catch(e) { return c.json(500,{'error':'Token auth error: '+String(e)}); }
}
function checkTokenPermission(c,required) {
  try {
    var tokInfo = c.get('apiTokenInfo'); if (!tokInfo) return true;
    var perms = tokInfo.permissions||[]; if (!Array.isArray(perms)) perms=[];
    for (var i=0;i<perms.length;i++) { var p=String(perms[i]||''); if (p===required) return true; var parts=p.split(':'); var reqParts=required.split(':'); if (parts.length===2&&parts[1]==='*'&&parts[0]===reqParts[0]) return true; if (p==='*') return true; }
    return false;
  } catch(e) { return false; }
}
function hashToken(token) {
  try { return $security.SHA256(token); } catch(e) { var h=0;if(token.length===0)return'd';for(var i=0;i<token.length;i++){h=((h<<5)-h)+token.charCodeAt(i);h=h&h;}return'd_'+Math.abs(h).toString(16).padStart(8,'0'); }
}
function generateToken(length) {
  if (typeof length === 'undefined') length = 48;
  var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var result = '';
  for (var i = 0; i < length; i++) { result += chars.charAt(Math.floor(Math.random() * chars.length)); }
  return 'tl_' + result;
}

// ─── Helper: resolve authenticated user ────────────────────────────────────
// Returns { id, role } or null. Checks both Bearer token auth and PB session auth.
function resolveAuth(c) {
  // Check Bearer token auth first
  var tokInfo = c.get('apiTokenInfo');
  if (tokInfo) {
    return { id: tokInfo.user_id, role: tokInfo.user_role, fromToken: true };
  }
  // Fall back to PB session auth
  var info = c.requestInfo();
  var auth = info.auth || c.auth;
  if (auth) {
    return { id: auth.id, role: String(auth.get('role') || 'user'), fromToken: false };
  }
  return null;
}

// ─── LIST tokens (GET) ─────────────────────────────────────────────────────
routerAdd('GET', '/api/todoless/api-tokens', (c) => {
  try {
    var ba = bearerAuthMiddleware(c);
    if (ba) return ba;

    var auth = resolveAuth(c);
    if (!auth) return c.json(401, { error: 'Unauthorized' });

    var filter = auth.role === 'admin'
      ? ''  // Admin sees all tokens
      : 'user = "' + auth.id + '"';

    var tokens = $app.findRecordsByFilter('api_tokens', filter, '-created', 0, 0);

    var result = tokens.map(function(r) {
      return {
        id: r.id,
        name: String(r.get('name') || ''),
        permissions: r.get('permissions'),
        expires_at: String(r.get('expires_at') || ''),
        enabled: r.get('enabled') !== false && r.get('enabled') !== 0,
        user: String(r.get('user') || ''),
        // NEVER return token_hash to clients
        created: String(r.get('created') || ''),
      };
    });

    return c.json(200, result);
  } catch(e) {
    return c.json(400, { error: String(e) });
  }
});

// ─── CREATE token (POST) ───────────────────────────────────────────────────
routerAdd('POST', '/api/todoless/api-tokens', (c) => {
  try {
    var ba = bearerAuthMiddleware(c);
    if (ba) return ba;

    var auth = resolveAuth(c);
    if (!auth) return c.json(401, { error: 'Unauthorized' });

    var info = c.requestInfo();
    var body = info.data || info.body || {};
    var name = String(body.name || '').trim();
    var permissions = body.permissions || [];
    var expiresAt = body.expires_at || '';

    if (!name) return c.json(400, { error: 'name is required' });
    if (!Array.isArray(permissions) || permissions.length === 0) {
      return c.json(400, { error: 'permissions array is required (min 1 permission)' });
    }

    // Validate permission format
    var validActions = ['tasks:read', 'tasks:write', 'groceries:read', 'groceries:write', 'notes:read', 'notes:write', 'admin:*'];
    for (var pi = 0; pi < permissions.length; pi++) {
      var perm = String(permissions[pi] || '');
      var valid = false;
      for (var vi = 0; vi < validActions.length; vi++) {
        if (perm === validActions[vi]) { valid = true; break; }
      }
      if (perm === '*') { valid = true; }
      // Allow wildcard format: tasks:* etc
      var pParts = perm.split(':');
      if (pParts.length === 2 && pParts[1] === '*') { valid = true; }
      if (!valid) return c.json(400, { error: 'Invalid permission: ' + perm });
    }

    // Generate token
    var rawToken = generateToken(48);

    // Hash it
    var hashed = hashToken(rawToken);

    var coll = $app.findCollectionByNameOrId('api_tokens');
    var rec = new Record(coll);

    rec.set('name', name);
    rec.set('token_hash', hashed);
    rec.set('permissions', permissions);
    rec.set('user', auth.id);

    // Try to set optional fields — ignore if collection schema doesn't have them
    try { rec.set('enabled', true); } catch(e) {}
    if (expiresAt) {
      try { rec.set('expires_at', expiresAt); } catch(e) {}
    }

    $app.save(rec);

    return c.json(201, {
      id: rec.id,
      name: name,
      token: rawToken,   // ONE-TIME return — never stored in plaintext
      permissions: permissions,
      enabled: true,
      expires_at: expiresAt || null,
      user: auth.id,
      created: new Date().toISOString(),
      message: 'Save this token — it will not be shown again.',
    });
  } catch(e) {
    return c.json(400, { error: String(e) });
  }
});

// ─── DELETE / revoke token ─────────────────────────────────────────────────
routerAdd('DELETE', '/api/todoless/api-tokens/:id', (c) => {
  try {
    var ba = bearerAuthMiddleware(c);
    if (ba) return ba;

    var auth = resolveAuth(c);
    if (!auth) return c.json(401, { error: 'Unauthorized' });

    var tokenId = c.pathParam('id') || '';
    if (!tokenId) return c.json(400, { error: 'token id required' });

    var rec = $app.findRecordById('api_tokens', tokenId);
    if (!rec) return c.json(404, { error: 'Token not found' });

    var tokenOwner = String(rec.get('user') || '');

    // Only owner or admin can delete
    if (tokenOwner !== auth.id && auth.role !== 'admin') {
      return c.json(403, { error: 'Forbidden' });
    }

    $app.delete(rec);
    return c.json(200, { ok: true, id: tokenId, message: 'Token revoked' });
  } catch(e) {
    return c.json(400, { error: String(e) });
  }
});

// ─── TOGGLE enabled/disabled ───────────────────────────────────────────────
routerAdd('PATCH', '/api/todoless/api-tokens/:id/toggle', (c) => {
  try {
    var ba = bearerAuthMiddleware(c);
    if (ba) return ba;

    var auth = resolveAuth(c);
    if (!auth) return c.json(401, { error: 'Unauthorized' });

    var tokenId = c.pathParam('id') || '';
    if (!tokenId) return c.json(400, { error: 'token id required' });

    var rec = $app.findRecordById('api_tokens', tokenId);
    if (!rec) return c.json(404, { error: 'Token not found' });

    var tokenOwner = String(rec.get('user') || '');

    // Only owner or admin can toggle
    if (tokenOwner !== auth.id && auth.role !== 'admin') {
      return c.json(403, { error: 'Forbidden' });
    }

    var info = c.requestInfo();
    var body = info.data || info.body || {};
    var enabled = body.enabled;
    if (typeof enabled !== 'boolean') {
      return c.json(400, { error: 'enabled boolean field required' });
    }

    rec.set('enabled', enabled);
    try { $app.save(rec); } catch(e) {
      // Collection might not have 'enabled' field — fallback gracefully
      return c.json(200, { ok: true, id: tokenId, enabled: enabled, note: 'Field not persisted' });
    }

    return c.json(200, {
      ok: true,
      id: tokenId,
      enabled: enabled,
    });
  } catch(e) {
    return c.json(400, { error: String(e) });
  }
});
