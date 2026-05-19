/// <reference path="../pb_data/types.d.ts" />

// PB 0.34 JS hooks: 
// - function/var declarations don't hoist into callbacks — inline helpers per handler
// - c.requestInfo() call ONCE per request
// - use info.auth NOT info.authRecord
// - path params via routerAdd(':param') don't work — use body/query for IDs

routerAdd('GET', '/api/todoless/hook-health', (c) => c.json(200, { ok: true }));

// ── OpenAPI 3.0 spec (complete, all routes) ─────────────────────────────────
routerAdd('GET', '/api/todoless/openapi.json', (c) => {
  var spec = {
    openapi: '3.0.3',
    info: { title: 'TodoLess API', version: '1.0.0', description: 'Self-hosted multi-user task and grocery manager.' },
    servers: [{ url: '/api/todoless' }],
    tags: [
      { name: 'public', description: 'No authentication required' },
      { name: 'auth', description: 'Bearer token (JWT) required' },
      { name: 'admin', description: 'Admin role required' },
      { name: 'agent', description: 'Agent API key authentication (Bearer tlsk_...)' }
    ],
    paths: {

      // ── Public ────────────────────────────────────────────────────────────
      '/hook-health': { get: { tags:['public'], summary:'Hook health check', responses:{ '200': { description:'OK', content:{'application/json':{ schema:{ type:'object', properties:{ ok:{type:'boolean'} } } } } } } } },
      '/setup-status': { get: { tags:['public'], summary:'Setup/bootstrap status', description:'Returns has_users and setup_complete for onboarding detection.', responses:{ '200': { description:'Status', content:{'application/json':{ schema:{ type:'object', properties:{ has_users:{type:'boolean'}, setup_complete:{type:'boolean'} } } } } } } } },
      '/validate-invite': { get: { tags:['public'], summary:'Validate invite code', description:'Check if an invite code is valid, unused, and not expired.', parameters:[{ name:'code', in:'query', required:true, schema:{type:'string'}, description:'6-digit invite code' }], responses:{ '200': { description:'Validation result', content:{'application/json':{ schema:{ type:'object', properties:{ status:{type:'string',enum:['valid','not_found','used','expired']}, message:{type:'string'}, invite:{ type:'object', properties:{ id:{type:'string'}, code:{type:'string'}, created_by:{type:'string'}, inviter:{ type:'object', properties:{ id:{type:'string'}, name:{type:'string'} } } } } } } } }, '400': { description:'code required' } } } },
      '/auth-with-password': { post: { tags:['public'], summary:'Authenticate with email/password', description:'Returns a PocketBase JWT token for subsequent authenticated requests.', requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ email:{type:'string',format:'email'}, password:{type:'string'} }, required:['email','password'] } } } }, responses:{ '200': { description:'Auth token + user', content:{'application/json':{ schema:{ type:'object' } } } }, '400': { description:'Invalid credentials' } } } },
      '/register': { post: { tags:['public'], summary:'Register user', description:'First user becomes admin. Subsequent users require a valid invite code (or bootstrap window).', requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ email:{type:'string',format:'email'}, password:{type:'string',minLength:8}, passwordConfirm:{type:'string'}, name:{type:'string'}, firstName:{type:'string'}, lastName:{type:'string'}, family_name:{type:'string'}, invite_code:{type:'string'}, user_type:{type:'string',enum:['family_member','family_assistant']} }, required:['email','password','passwordConfirm'] } } } }, responses:{ '201':{ description:'User created', content:{'application/json':{ schema:{ type:'object', properties:{ user:{ type:'object', properties:{ id:{type:'string'}, email:{type:'string'}, name:{type:'string'}, first_name:{type:'string'}, last_name:{type:'string'}, role:{type:'string'}, family_id:{type:'string'} } } } } } }, '400':{ description:'Validation error' } } } },

      // ── Authenticated: Entries ─────────────────────────────────────────────
      '/entries': { get: { tags:['auth'], summary:'Unified entries feed', description:'Returns combined tasks and groceries for the user/family, with optional filters.', security:[{ bearerAuth: [] }], parameters:[ { name:'type', in:'query', schema:{type:'string',enum:['task','grocery']} }, { name:'status', in:'query', schema:{type:'string'} }, { name:'assignee_id', in:'query', schema:{type:'string'} }, { name:'label', in:'query', schema:{type:'string'} }, { name:'shop_id', in:'query', schema:{type:'string'} } ], responses:{ '200':{ description:'Entries list', content:{'application/json':{ schema:{ type:'array', items:{ type:'object' } } } } }, '401':{ description:'Unauthorized' } } } },

      // ── Authenticated: Unified API Dispatcher ──────────────────────────────
      '/api': { post: { tags:['auth'], summary:'Unified action dispatcher', description:'Single endpoint for all CRUD and admin actions: list, create, update, complete, assign, delete, filters, set_role, set_user_block, delete_user.', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ action:{type:'string',enum:['list','create','update','complete','assign','delete','filters','set_role','set_user_block','delete_user']}, data:{type:'object'} }, required:['action'] } } } }, responses:{ '200':{ description:'Action result' }, '201':{ description:'Created' }, '400':{ description:'Invalid request' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' } } } },

      // ── Tasks ─────────────────────────────────────────────────────────────
      '/tasks': {
        get: { tags:['auth'], summary:'List tasks', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} }, { name:'status', in:'query', schema:{type:'string',enum:['backlog','todo','done']} } ], responses:{ '200':{ description:'Task list' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create task', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ title:{type:'string'}, status:{type:'string',default:'todo'}, blocked:{type:'boolean'}, blocked_comment:{type:'string'}, priority:{type:'string'}, horizon:{type:'string'}, due_date:{type:'string',format:'date-time'}, repeat_interval:{type:'string'}, labels:{type:'array',items:{type:'string'}}, is_private:{type:'boolean'}, archived:{type:'boolean'}, flag:{type:'boolean'}, assigned_to:{type:'string'}, sprint_id:{type:'string'}, linked_to:{type:'string'}, linked_type:{type:'string'}, linked_item_ids:{type:'array',items:{type:'string'}}, linked_note_ids:{type:'array',items:{type:'string'}}, completed_at:{type:'string',format:'date-time'} } } } }, responses:{ '201':{ description:'Task created' }, '401':{ description:'Unauthorized' } } }
      },
      '/tasks/{id}': {
        get: { tags:['auth'], summary:'Get task', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Task record' }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } },
        patch: { tags:['auth'], summary:'Update task', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], requestBody:{ content:{'application/json':{ schema:{ type:'object' } } } }, responses:{ '200':{ description:'Updated' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } },
        delete: { tags:['auth'], summary:'Delete task', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Deleted' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } }
      },
      '/tasks/{id}/archive': { post: { tags:['auth'], summary:'Archive task', description:'Archive a completed task. Optional retention days query param.', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }, { name:'retention', in:'query', schema:{type:'string'}, description:'Days before auto-delete (default 30)' }], responses:{ '200':{ description:'Archived' }, '401':{ description:'Unauthorized' } } } },
      '/tasks/archive-done': { post: { tags:['auth'], summary:'Archive all done tasks', security:[{ bearerAuth: [] }], responses:{ '200':{ description:'Batch archive result', content:{'application/json':{ schema:{ type:'object', properties:{ archived:{type:'array',items:{type:'string'}}, count:{type:'integer'} } } } } }, '401':{ description:'Unauthorized' } } } },
      '/tasks/{id}/convert-to-item': { post: { tags:['auth'], summary:'Convert task to grocery item', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Converted', content:{'application/json':{ schema:{ type:'object', properties:{ message:{type:'string'}, item_id:{type:'string'} } } } } }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } } },
      '/tasks/{id}/move': { post: { tags:['auth'], summary:'Move task to status', description:'Move a task to backlog, todo, or done.', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], requestBody:{ content:{'application/json':{ schema:{ type:'object', properties:{ status:{type:'string',enum:['backlog','todo','done']} }, required:['status'] } } } }, responses:{ '200':{ description:'Moved' }, '400':{ description:'Invalid status' }, '401':{ description:'Unauthorized' } } } },
      '/tasks/uncheck-all-done': { post: { tags:['auth'], summary:'Reset all done tasks to todo', security:[{ bearerAuth: [] }], responses:{ '200':{ description:'Reset result', content:{'application/json':{ schema:{ type:'object', properties:{ updated:{type:'array',items:{type:'string'}}, count:{type:'integer'} } } } } }, '401':{ description:'Unauthorized' } } } },

      // ── Items (Grocery) ───────────────────────────────────────────────────
      '/items': {
        get: { tags:['auth'], summary:'List grocery items', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} }, { name:'completed', in:'query', schema:{type:'string',enum:['true','false']} } ], responses:{ '200':{ description:'Item list' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create grocery item', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ title:{type:'string'}, completed:{type:'boolean'}, quantity:{type:'integer'}, labels:{type:'array',items:{type:'string'}}, is_private:{type:'boolean'}, shop_id:{type:'string'}, priority:{type:'string'}, assigned_to:{type:'string'}, due_date:{type:'string',format:'date-time'} } } } }, responses:{ '201':{ description:'Item created' }, '401':{ description:'Unauthorized' } } }
      },
      '/items/{id}': {
        get: { tags:['auth'], summary:'Get grocery item', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Item record' }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } },
        patch: { tags:['auth'], summary:'Update grocery item', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], requestBody:{ content:{'application/json':{ schema:{ type:'object' } } } }, responses:{ '200':{ description:'Updated' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } },
        delete: { tags:['auth'], summary:'Delete grocery item', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Deleted' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } }
      },
      '/items/{id}/convert-to-task': { post: { tags:['auth'], summary:'Convert grocery item to task', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Converted', content:{'application/json':{ schema:{ type:'object', properties:{ message:{type:'string'}, task_id:{type:'string'} } } } } }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } } },
      '/items/uncheck-all-done': { post: { tags:['auth'], summary:'Reset all completed items to incomplete', security:[{ bearerAuth: [] }], responses:{ '200':{ description:'Reset result', content:{'application/json':{ schema:{ type:'object', properties:{ updated:{type:'array',items:{type:'string'}}, count:{type:'integer'} } } } } }, '401':{ description:'Unauthorized' } } } },

      // ── Calendar ──────────────────────────────────────────────────────────
      '/calendar': {
        get: { tags:['auth'], summary:'List calendar events', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} }, { name:'start', in:'query', schema:{type:'string',format:'date'}, description:'ISO date (e.g. 2025-01-01)' }, { name:'end', in:'query', schema:{type:'string',format:'date'}, description:'ISO date' } ], responses:{ '200':{ description:'Calendar events' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create calendar event', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ title:{type:'string'}, description:{type:'string'}, all_day:{type:'boolean'}, start_time:{type:'string',format:'date-time'}, end_time:{type:'string',format:'date-time'}, task_id:{type:'string'} } } } }, responses:{ '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } }
      },
      '/calendar/{id}': {
        get: { tags:['auth'], summary:'Get calendar event', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Event' }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } },
        patch: { tags:['auth'], summary:'Update calendar event', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], requestBody:{ content:{'application/json':{ schema:{ type:'object' } } } }, responses:{ '200':{ description:'Updated' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } },
        delete: { tags:['auth'], summary:'Delete calendar event', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Deleted' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } }
      },

      // ── Invites ───────────────────────────────────────────────────────────
      '/invites': {
        get: { tags:['auth'], summary:'List invite codes', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} } ], responses:{ '200':{ description:'Invite list' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create invite record', security:[{ bearerAuth: [] }], requestBody:{ content:{'application/json':{ schema:{ type:'object', properties:{ code:{type:'string'}, expires_at:{type:'string',format:'date-time'} } } } } }, responses:{ '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } }
      },
      '/invites/generate': { post: { tags:['auth'], summary:'Generate 6-digit invite code', description:'Creates a random 6-digit code valid for 1 hour.', security:[{ bearerAuth: [] }], responses:{ '201':{ description:'Generated code', content:{'application/json':{ schema:{ type:'object', properties:{ id:{type:'string'}, code:{type:'string'}, expires_at:{type:'string',format:'date-time'} } } } } }, '401':{ description:'Unauthorized' } } } },
      '/invites/{id}': { get: { tags:['auth'], summary:'Get invite code', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Invite' }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } } },
      '/invites/{id}/use': { post: { tags:['auth'], summary:'Consume invite code', description:'Mark an invite as used by the authenticated user.', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Consumed' }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' }, '409':{ description:'Already used' }, '410':{ description:'Expired' } } } },
      '/invites/create': { post: { tags:['auth','admin'], summary:'Create invite code (server-side)', description:'Admin-only: generates a unique 6-digit code valid for 24 hours, bypassing PB API rules.', security:[{ bearerAuth: [] }], responses:{ '201':{ description:'Created' }, '401':{ description:'Unauthorized' }, '403':{ description:'Admin only' } } } },
      '/invites/{id}': { delete: { tags:['auth'], summary:'Delete invite code', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Deleted' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } } },

      // ── Labels ───────────────────────────────────────────────────────────
      '/labels': {
        get: { tags:['auth'], summary:'List labels', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} } ], responses:{ '200':{ description:'Label list' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create label', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ name:{type:'string'}, color:{type:'string',default:'#6366f1'}, is_private:{type:'boolean'} } } } }, responses:{ '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } }
      },
      '/labels/{id}': {
        get: { tags:['auth'], summary:'Get label', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Label' }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } },
        patch: { tags:['auth'], summary:'Update label', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], requestBody:{ content:{'application/json':{ schema:{ type:'object', properties:{ name:{type:'string'}, color:{type:'string'}, is_private:{type:'boolean'} } } } }, responses:{ '200':{ description:'Updated' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } },
        delete: { tags:['auth'], summary:'Delete label', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Deleted' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } }
      },

      // ── Shops ─────────────────────────────────────────────────────────────
      '/shops': {
        get: { tags:['auth'], summary:'List shops', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} } ], responses:{ '200':{ description:'Shop list' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create shop', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ name:{type:'string'}, color:{type:'string',default:'#6366f1'} } } } } }, responses:{ '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } }
      },
      '/shops/{id}': {
        get: { tags:['auth'], summary:'Get shop', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Shop' }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } },
        patch: { tags:['auth'], summary:'Update shop', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], requestBody:{ content:{'application/json':{ schema:{ type:'object', properties:{ name:{type:'string'}, color:{type:'string'} } } } } }, responses:{ '200':{ description:'Updated' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } },
        delete: { tags:['auth'], summary:'Delete shop', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Deleted' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } }
      },

      // ── Families ──────────────────────────────────────────────────────────
      '/families': {
        get: { tags:['auth'], summary:'List families', description:"Returns the user's own family, or families they created.", security:[{ bearerAuth: [] }], responses:{ '200':{ description:'Family list' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create family', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ name:{type:'string'} }, required:['name'] } } } }, responses:{ '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } }
      },
      '/families/{id}': { get: { tags:['auth'], summary:'Get family', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Family' }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } } },
      '/families/join/{id}': { post: { tags:['auth'], summary:'Join family', description:"Set the user's family_id to the given family.", security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'}, description:'Family ID' }], responses:{ '200':{ description:'Joined', content:{'application/json':{ schema:{ type:'object', properties:{ message:{type:'string'}, family_id:{type:'string'} } } } } }, '401':{ description:'Unauthorized' }, '404':{ description:'Family not found' } } } },
      '/families/leave': { post: { tags:['auth'], summary:'Leave family', description:"Clear the user's family_id.", security:[{ bearerAuth: [] }], responses:{ '200':{ description:'Left', content:{'application/json':{ schema:{ type:'object', properties:{ message:{type:'string'} } } } } }, '401':{ description:'Unauthorized' } } } },

      // ── Rewards ──────────────────────────────────────────────────────────
      '/rewards': {
        get: { tags:['auth'], summary:'List rewards', description:'Rewards are visible to all authenticated users.', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} } ], responses:{ '200':{ description:'Reward list' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create reward', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ title:{type:'string'}, points:{type:'integer'}, earned_by:{type:'string'}, earned_at:{type:'string',format:'date-time'}, reason:{type:'string'}, task_id:{type:'string'} } } } }, responses:{ '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } }
      },
      '/rewards/{id}': { get: { tags:['auth'], summary:'Get reward', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Reward' }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } } },
      '/rewards/{id}': { delete: { tags:['auth'], summary:'Delete reward', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Deleted' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } } },

      // ── Goals ─────────────────────────────────────────────────────────────
      '/goals': {
        get: { tags:['auth'], summary:'List goals', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} } ], responses:{ '200':{ description:'Goal list' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create goal', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ title:{type:'string'}, description:{type:'string'}, points_required:{type:'integer'}, points_current:{type:'integer'}, completed:{type:'boolean'}, target_user:{type:'string'}, completed_at:{type:'string',format:'date-time'} } } } }, responses:{ '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } }
      },
      '/goals/{id}': {
        get: { tags:['auth'], summary:'Get goal', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Goal' }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } },
        patch: { tags:['auth'], summary:'Update goal', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], requestBody:{ content:{'application/json':{ schema:{ type:'object' } } } }, responses:{ '200':{ description:'Updated' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } },
        delete: { tags:['auth'], summary:'Delete goal', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Deleted' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } }
      },

      // ── Reminders ────────────────────────────────────────────────────────
      '/reminders': {
        get: { tags:['auth'], summary:'List reminders', description:'Returns pending reminders by default. Use ?include_fired=true to include fired/dismissed.', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} }, { name:'include_fired', in:'query', schema:{type:'string',enum:['true']} } ], responses:{ '200':{ description:'Reminder list' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create reminder', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ title:{type:'string'}, message:{type:'string'}, reminder_time:{type:'string',format:'date-time'}, repeat_interval:{type:'string'}, linked_type:{type:'string'}, linked_to:{type:'string'} } } } }, responses:{ '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } }
      },
      '/reminders/{id}': {
        patch: { tags:['auth'], summary:'Update reminder', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], requestBody:{ content:{'application/json':{ schema:{ type:'object', properties:{ title:{type:'string'}, message:{type:'string'}, reminder_time:{type:'string',format:'date-time'}, fired:{type:'boolean'}, dismissed:{type:'boolean'}, repeat_interval:{type:'string'} } } } }, responses:{ '200':{ description:'Updated' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } },
        delete: { tags:['auth'], summary:'Delete reminder', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Deleted' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } }
      },

      // ── Projects ─────────────────────────────────────────────────────────
      '/projects': {
        get: { tags:['auth'], summary:'List projects', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} }, { name:'status', in:'query', schema:{type:'string'} } ], responses:{ '200':{ description:'Project list' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create project', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ title:{type:'string'}, description:{type:'string'}, color:{type:'string',default:'#6366f1'}, status:{type:'string',default:'active'}, task_ids:{type:'array',items:{type:'string'}}, due_date:{type:'string',format:'date-time'} } } } }, responses:{ '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } }
      },
      '/projects/{id}': {
        get: { tags:['auth'], summary:'Get project', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Project' }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } },
        patch: { tags:['auth'], summary:'Update project', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], requestBody:{ content:{'application/json':{ schema:{ type:'object' } } } }, responses:{ '200':{ description:'Updated' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } },
        delete: { tags:['auth'], summary:'Delete project', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Deleted' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } }
      },

      // ── Sprints ──────────────────────────────────────────────────────────
      '/sprints': {
        get: { tags:['auth'], summary:'List sprints', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} } ], responses:{ '200':{ description:'Sprint list' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create sprint', security:[{ bearerAuth: [] }], requestBody:{ content:{'application/json':{ schema:{ type:'object', properties:{ name:{type:'string'}, duration:{type:'string',enum:['1week','2weeks','3weeks','1month']}, week_number:{type:'integer'}, year:{type:'integer'}, start_date:{type:'string',format:'date'}, end_date:{type:'string',format:'date'} } } } }, responses:{ '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } }
      },
      '/sprints/{id}': {
        get: { tags:['auth'], summary:'Get sprint', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Sprint' }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } },
        patch: { tags:['auth'], summary:'Update sprint', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], requestBody:{ content:{'application/json':{ schema:{ type:'object' } } } }, responses:{ '200':{ description:'Updated' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } },
        delete: { tags:['auth'], summary:'Delete sprint', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Deleted' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } }
      },
      '/sprints/new': { post: { tags:['auth'], summary:'Create sprint from settings', description:'Creates a new sprint based on user sprint_duration and sprint_start_day settings.', security:[{ bearerAuth: [] }], responses:{ '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } } },
      '/sprints/{id}/archive-tasks': { post: { tags:['auth'], summary:'Archive done tasks in sprint', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Batch archive result', content:{'application/json':{ schema:{ type:'object', properties:{ archived:{type:'array',items:{type:'string'}}, count:{type:'integer'} } } } } }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } } },

      // ── Notes ────────────────────────────────────────────────────────────
      '/notes': {
        get: { tags:['auth'], summary:'List notes', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} } ], responses:{ '200':{ description:'Note list' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create note', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ title:{type:'string'}, content:{type:'string'}, pinned:{type:'boolean'}, labels:{type:'array',items:{type:'string'}}, linked_type:{type:'string'}, linked_to:{type:'string'} } } } }, responses:{ '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } }
      },
      '/notes/{id}': {
        get: { tags:['auth'], summary:'Get note', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Note' }, '401':{ description:'Unauthorized' }, '404':{ description:'Not found' } } },
        patch: { tags:['auth'], summary:'Update note', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], requestBody:{ content:{'application/json':{ schema:{ type:'object' } } } }, responses:{ '200':{ description:'Updated' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } },
        delete: { tags:['auth'], summary:'Delete note', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Deleted' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' }, '404':{ description:'Not found' } } }
      },

      // ── Shared ───────────────────────────────────────────────────────────
      '/shared/tasks': { get: { tags:['auth'], summary:'List shared (non-private) tasks', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} } ], responses:{ '200':{ description:'Shared task list' }, '401':{ description:'Unauthorized' } } } },
      '/shared/items': { get: { tags:['auth'], summary:'List shared (non-private) grocery items', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} } ], responses:{ '200':{ description:'Shared item list' }, '401':{ description:'Unauthorized' } } } },
      '/shared/notes': { get: { tags:['auth'], summary:'List shared (non-private) notes', security:[{ bearerAuth: [] }], parameters:[ { name:'sort', in:'query', schema:{type:'string'} } ], responses:{ '200':{ description:'Shared note list' }, '401':{ description:'Unauthorized' } } } },

      // ── Settings ─────────────────────────────────────────────────────────
      '/settings': {
        get: { tags:['auth'], summary:'Get app settings', security:[{ bearerAuth: [] }], responses:{ '200':{ description:'Settings', content:{'application/json':{ schema:{ type:'object', properties:{ user:{type:'string'}, sprint_duration:{type:'string'}, sprint_start_day:{type:'integer'}, language:{type:'string'}, archive_retention_days:{type:'integer'}, auto_cleanup:{type:'boolean'}, theme:{type:'string'}, setup_complete:{type:'boolean'} } } } } }, '401':{ description:'Unauthorized' } } },
        patch: { tags:['auth'], summary:'Update app settings', security:[{ bearerAuth: [] }], requestBody:{ content:{'application/json':{ schema:{ type:'object', properties:{ sprint_duration:{type:'string',enum:['1week','2weeks','3weeks','1month']}, sprint_start_day:{type:'integer'}, language:{type:'string'}, archive_retention_days:{type:'integer'}, auto_cleanup:{type:'boolean'}, theme:{type:'string',enum:['light','dark']}, setup_complete:{type:'boolean'} } } } }, responses:{ '200':{ description:'Updated' }, '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } }
      },

      // ── AI ────────────────────────────────────────────────────────────────
      '/ai/config': {
        get: { tags:['auth'], summary:'Get AI config', description:'Returns configured AI provider settings.', security:[{ bearerAuth: [] }], responses:{ '200':{ description:'AI config', content:{'application/json':{ schema:{ type:'object', properties:{ configured:{type:'boolean'}, provider:{type:'string'}, api_url:{type:'string'}, model:{type:'string'}, max_tokens:{type:'integer'}, temperature:{type:'number'}, enabled:{type:'boolean'} } } } } }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Configure AI settings', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ provider:{type:'string'}, api_url:{type:'string'}, api_key:{type:'string'}, model:{type:'string',default:'gpt-4o-mini'}, max_tokens:{type:'integer',default:1024}, temperature:{type:'number',default:0.7}, enabled:{type:'boolean'} } } } }, responses:{ '200':{ description:'Updated' }, '201':{ description:'Created' }, '401':{ description:'Unauthorized' } } }
      },
      '/ai/suggest': { post: { tags:['auth'], summary:'Get task suggestions', description:'Returns AI-generated task suggestions based on title and description.', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ title:{type:'string'}, description:{type:'string'} } } } } }, responses:{ '200':{ description:'Suggestions', content:{'application/json':{ schema:{ type:'object' } } } }, '401':{ description:'Unauthorized' }, '503':{ description:'AI not configured' } } } },
      '/ai/categorize': { post: { tags:['auth'], summary:'Auto-categorize entry', description:'Assigns labels and other attributes to a task or grocery item.', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ type:{type:'string',enum:['task','grocery']}, id:{type:'string'} } } } } }, responses:{ '200':{ description:'Categorization result' }, '401':{ description:'Unauthorized' }, '503':{ description:'AI not configured' } } } },
      '/ai/chat': { post: { tags:['auth'], summary:'AI chat', description:'Conversational AI assistant for task management.', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ message:{type:'string'}, history:{type:'array',items:{ type:'object' }} } } } } }, responses:{ '200':{ description:'AI response' }, '401':{ description:'Unauthorized' }, '503':{ description:'AI not configured' } } } },

      // ── Agent API Keys ───────────────────────────────────────────────────
      '/agent/auth-test': { get: { tags:['agent'], summary:'Test agent API key', description:'Returns key info and scopes for a valid agent API key.', security:[{ agentApiKeyAuth: [] }], responses:{ '200':{ description:'Key info' }, '401':{ description:'Invalid or missing key' } } } },
      '/agent/keys': {
        get: { tags:['agent','admin'], summary:'List agent API keys', description:'Admin-only: list all agent API keys.', security:[{ bearerAuth: [] }], responses:{ '200':{ description:'Key list' }, '401':{ description:'Unauthorized' }, '403':{ description:'Admin only' } } },
        post: { tags:['agent','admin'], summary:'Create agent API key', description:'Generate a new agent API key with specified scopes.', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ name:{type:'string'}, scopes:{type:'array',items:{type:'string'}}, expires_at:{type:'string',format:'date-time'} }, required:['name'] } } } }, responses:{ '201':{ description:'Key created' }, '400':{ description:'Validation error' }, '401':{ description:'Unauthorized' }, '403':{ description:'Admin only' } } }
      },
      '/agent/keys/{id}/revoke': { post: { tags:['agent','admin'], summary:'Revoke agent API key', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Revoked' }, '401':{ description:'Unauthorized' }, '403':{ description:'Admin only' } } } },
      '/agent/dispatch': {
        get: { tags:['agent'], summary:'Agent list entries', description:'List tasks and groceries accessible to this agent API key.', security:[{ agentApiKeyAuth: [] }], parameters:[ { name:'type', in:'query', schema:{type:'string',enum:['task','grocery']} }, { name:'status', in:'query', schema:{type:'string'} }, { name:'limit', in:'query', schema:{type:'integer'} } ], responses:{ '200':{ description:'Entries list' }, '401':{ description:'Invalid or missing key' } } },
        post: { tags:['agent'], summary:'Agent action dispatcher', description:'Execute actions: create, read, update, delete, complete, assign, set_labels, set_due_date.', security:[{ agentApiKeyAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ action:{type:'string',enum:['create','read','update','delete','complete','assign','set_labels','set_due_date']}, type:{type:'string',enum:['task','grocery']}, id:{type:'string'}, title:{type:'string'}, status:{type:'string'}, assignee_id:{type:'string'}, labels:{type:'array',items:{type:'string'}}, due_date:{type:'string',format:'date-time'}, description:{type:'string'}, shop_id:{type:'string'}, quantity:{type:'integer'}, complete:{type:'boolean'} } } } }, responses:{ '200':{ description:'Action result' }, '201':{ description:'Created' }, '400':{ description:'Invalid request' }, '401':{ description:'Invalid or missing key' }, '403':{ description:'Insufficient scope' } } }
      },
      '/agent/audit-log': { get: { tags:['agent','admin'], summary:'Agent audit log', description:'View audit log of agent actions.', security:[{ bearerAuth: [] }], parameters:[ { name:'limit', in:'query', schema:{type:'integer'} }, { name:'action', in:'query', schema:{type:'string'} }, { name:'key_id', in:'query', schema:{type:'string'} } ], responses:{ '200':{ description:'Audit log entries' }, '401':{ description:'Unauthorized' }, '403':{ description:'Admin only' } } } },

      // ── API Tokens (Bearer) ───────────────────────────────────────────────
      '/api-tokens': {
        get: { tags:['auth'], summary:'List API tokens', description:'List all API tokens for the authenticated user (admin sees all).', security:[{ bearerAuth: [] }], responses:{ '200':{ description:'Token list' }, '401':{ description:'Unauthorized' } } },
        post: { tags:['auth'], summary:'Create API token', description:'Create a new API token with specific permissions. The raw token is returned once.', security:[{ bearerAuth: [] }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ name:{type:'string'}, permissions:{type:'array',items:{type:'string'}}, expires_at:{type:'string',format:'date-time'} }, required:['name','permissions'] } } } }, responses:{ '201':{ description:'Token created' }, '400':{ description:'Validation error' }, '401':{ description:'Unauthorized' } } }
      },
      '/api-tokens/{id}': { delete: { tags:['auth'], summary:'Revoke API token', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200':{ description:'Revoked' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' } } } },
      '/api-tokens/{id}/toggle': { patch: { tags:['auth'], summary:'Toggle API token enabled/disabled', security:[{ bearerAuth: [] }], parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], requestBody:{ required:true, content:{'application/json':{ schema:{ type:'object', properties:{ enabled:{type:'boolean'} }, required:['enabled'] } } } }, responses:{ '200':{ description:'Toggled' }, '401':{ description:'Unauthorized' }, '403':{ description:'Forbidden' } } } },

    },
    components: {
      securitySchemes: {
        bearerAuth: { type:'http', scheme:'bearer', bearerFormat:'JWT', description:'PocketBase JWT from /api/todoless/auth-with-password' },
        agentApiKeyAuth: { type:'apiKey', in:'header', name:'Authorization', description:'Bearer token with agent API key: "Bearer tlsk_<key>"' }
      }
    }
  };
  return c.json(200, spec);
});

// Redirect /swagger → /docs
routerAdd('GET', '/api/todoless/swagger', (c) => {
  c.response.header().set('Location', '/api/todoless/docs');
  return c.redirect(302, '/api/todoless/docs');
});

// ── Create invite code (server-side, bypasses PB API rules) ──
routerAdd('POST', '/api/todoless/invites/create', (c) => {
  try {
    var info = c.requestInfo();
    var auth = info && info.auth ? info.auth : null;
    if (!auth) return c.json(401, { error: 'Unauthorized' });

    // Generate UNIQUE 6-digit code (avoid active duplicate codes)
    var digits = '0123456789';
    var code = '';
    var attempts = 0;
    var nowMs = new Date().getTime();
    var maxAttempts = 25;
    while (attempts < maxAttempts) {
      attempts += 1;
      code = '';
      for (var i = 0; i < 6; i++) code += digits.charAt(Math.floor(Math.random() * digits.length));

      var existingCode = $app.findRecordsByFilter('invite_codes', 'code="' + code + '"', '-created', 1, 0);
      if (existingCode.length === 0) break;

      var r0 = existingCode[0];
      var used0 = !!r0.get('used');
      var raw0 = r0.get('expires_at');
      var exp0 = 0;
      if (typeof raw0 === 'string') exp0 = new Date(raw0).getTime();
      else if (raw0 && typeof raw0.getTime === 'function') exp0 = raw0.getTime();
      else if (raw0) exp0 = new Date(String(raw0)).getTime();

      // Reuse code only if previous invite is terminal (used or expired)
      if (used0 || (exp0 > 0 && exp0 <= nowMs)) break;
    }

    if (!code) return c.json(500, { error: 'Failed to generate invite code. Retry.' });

    var now = new Date();
    var expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    var coll = $app.findCollectionByNameOrId('invite_codes');
    var rec = new Record(coll);
    rec.set('code', code);
    rec.set('expires_at', expiresAt.toISOString());
    rec.set('used', false);
    rec.set('user', auth.id);
    $app.save(rec);

    return c.json(201, {
      id: rec.id,
      code: code,
      created_by: auth.id,
      expires_at: expiresAt.toISOString(),
      used: false,
    });
  } catch (e) {
    return c.json(500, { error: String(e) });
  }
});

routerAdd('GET', '/api/todoless/setup-status', (c) => {
  try {
    var u = $app.findRecordsByFilter('users', '', '-created', 1, 0);
    var s = $app.findRecordsByFilter('app_settings', 'setup_complete = true', '-created', 1, 0);
    return c.json(200, { has_users: u.length > 0, setup_complete: s.length > 0 });
  } catch(e) { return c.json(200, { has_users: false, setup_complete: false }); }
});

// ── Validate invite code (no auth required, public) ──
routerAdd('GET', '/api/todoless/validate-invite', (c) => {
  try {
    var q = c.requestInfo().query || {};
    var code = String(q.code || '').trim().toUpperCase();
    if (!code) return c.json(400, { status: 'error', message: 'code required' });

    var now = new Date().getTime();
    var invites = $app.findRecordsByFilter('invite_codes', 'code="' + code + '"', '-created', 1, 0);

    if (invites.length === 0) return c.json(200, { status: 'not_found', message: 'Invite code not found' });

    var inv = invites[0];
    var used = inv.get('used') || false;
    var expiresAt = inv.get('expires_at');
    var expiryTime = 0;
    if (typeof expiresAt === 'string') {
      expiryTime = new Date(expiresAt).getTime();
    } else if (expiresAt && typeof expiresAt.getTime === 'function') {
      expiryTime = expiresAt.getTime();
    } else if (expiresAt) {
      // Goja/PB 0.34: try converting to string first
      expiryTime = new Date(String(expiresAt)).getTime();
    }
    var isExpired = expiryTime > 0 && expiryTime < now;

    if (used) return c.json(200, { status: 'used', message: 'Invite code has already been used' });
    if (isExpired) return c.json(200, { status: 'expired', message: 'Invite code has expired' });

    // Get inviter info
    var inviterId = String(inv.get('user') || '');
    var inviter = null;
    try {
      if (inviterId) {
        var r = $app.findRecordById('users', inviterId);
        inviter = { id: r.id, name: r.get('name') || String(r.get('email')||'') };
      }
    } catch(e) {}

    return c.json(200, {
      status: 'valid',
      message: 'Invite code is valid',
      invite: {
        id: inv.id,
        code: inv.get('code'),
        created_by: inviterId,
        inviter: inviter,
      }
    });
  } catch(e) { return c.json(500, { status: 'error', message: String(e) }); }
});

// ── User registration (no auth required) ──
routerAdd('POST', '/api/todoless/register', (c) => {
  try {
    var info = c.requestInfo();
    var d = info.data || info.body || {};
    var userType = String(d.user_type || 'family_member').trim();
    // Validate user_type
    if (['family_member', 'family_assistant'].indexOf(userType) === -1) {
      return c.json(400, { error: 'Invalid user_type. Must be family_member or family_assistant.' });
    }

    // Helper: set first_name, last_name, and computed name on a record
    function setNameFields(rec, d) {
      var firstName = String(d.firstName || d.first_name || d.name || '').trim();
      var lastName = String(d.lastName || d.last_name || '').trim();
      if (!firstName && d.email) firstName = d.email.split('@')[0];
      rec.set('first_name', firstName);
      rec.set('last_name', lastName);
      rec.set('name', (firstName + ' ' + lastName).trim() || firstName || d.email.split('@')[0]);
    }

    var existing = $app.findRecordsByFilter('users', '', '-created', 1, 0);
    var setupDone = $app.findRecordsByFilter('app_settings', 'setup_complete = true', '-created', 1, 0).length > 0;
    if (!d.email || !d.password || d.password.length < 8) return c.json(400, { error: 'Email and password (min 8) required' });
    if (d.password !== d.passwordConfirm) return c.json(400, { error: 'Passwords do not match' });

    // FIRST USER ONLY: bootstrap admin + family
    if (existing.length === 0) {
      var uc = $app.findCollectionByNameOrId('users');
      var rec = new Record(uc);
      rec.set('email', d.email); rec.set('password', d.password);
      rec.set('passwordConfirm', d.passwordConfirm);
      setNameFields(rec, d);
      rec.set('role', 'admin'); rec.set('family_id', ''); rec.set('emailVisibility', true); rec.set('active', true);
      $app.save(rec);
      var fc = $app.findCollectionByNameOrId('families');
      var fam = new Record(fc);
      fam.set('name', d.family_name || 'My Family');
      fam.set('created_by', rec.id); $app.save(fam);
      rec.set('family_id', fam.id); $app.save(rec);
      return c.json(201, {
        user: { id: rec.id, email: String(rec.get('email')||''), name: String(rec.get('name')||''), first_name: String(rec.get('first_name')||''), last_name: String(rec.get('last_name')||''), role: 'admin', family_id: fam.id }
      });
    }

    // BOOTSTRAP WINDOW: before setup_complete, allow registration without invite,
    // but NEVER create additional admins.
    if (!setupDone) {
      var seedUser = existing[0];
      var fidBootstrap = seedUser ? String(seedUser.get('family_id') || '') : '';
      if (!fidBootstrap) throw new BadRequestError('Bootstrap family not ready. Please retry.', {});

      var ucBootstrap = $app.findCollectionByNameOrId('users');
      var recBootstrap = new Record(ucBootstrap);
      recBootstrap.set('email', d.email); recBootstrap.set('password', d.password);
      recBootstrap.set('passwordConfirm', d.passwordConfirm);
      setNameFields(recBootstrap, d);
      var roleBootstrap = userType === 'family_assistant' ? 'assistant' : 'user';
      recBootstrap.set('role', roleBootstrap);
      recBootstrap.set('family_id', fidBootstrap);
      recBootstrap.set('emailVisibility', true);
      recBootstrap.set('active', true);
      $app.save(recBootstrap);
      return c.json(201, {
        user: { id: recBootstrap.id, email: String(recBootstrap.get('email')||''), name: String(recBootstrap.get('name')||''), first_name: String(recBootstrap.get('first_name')||''), last_name: String(recBootstrap.get('last_name')||''), role: roleBootstrap, family_id: fidBootstrap }
      });
    }

    // SUBSEQUENT USER — require valid, single-use invite
    var ic = String(d.invite_code || '').trim().toUpperCase();
    if (!ic) throw new BadRequestError('Invite code required for registration.', {});

    var invites = $app.findRecordsByFilter('invite_codes', 'code="' + ic + '"', '-created', 1, 0);
    if (invites.length === 0) throw new BadRequestError('Invite code not found.', {});

    var inv = invites[0];
    var used = !!inv.get('used');
    if (used) throw new BadRequestError('Invite code has already been used.', {});

    var rawExp = inv.get('expires_at');
    var expMs = 0;
    if (typeof rawExp === 'string') expMs = new Date(rawExp).getTime();
    else if (rawExp && typeof rawExp.getTime === 'function') expMs = rawExp.getTime();
    else if (rawExp) expMs = new Date(String(rawExp)).getTime();

    var nowMs = new Date().getTime();
    var isExpired = expMs > 0 && expMs <= nowMs;
    if (isExpired) throw new BadRequestError('Invite code has expired.', {});

    var inviterId = String(inv.get('user') || '');
    if (!inviterId) throw new BadRequestError('Invite code is invalid (missing inviter).', {});

    var inviter = $app.findRecordById('users', inviterId);
    var fid = inviter ? String(inviter.get('family_id') || '') : '';
    if (!fid) throw new BadRequestError('Inviter has no family — ask admin to create one.', {});

    var uc = $app.findCollectionByNameOrId('users');
    var rec = new Record(uc);
    rec.set('email', d.email); rec.set('password', d.password);
    rec.set('passwordConfirm', d.passwordConfirm);
    setNameFields(rec, d);

    // Set role based on user_type
    var role = userType === 'family_assistant' ? 'assistant' : 'user';
    rec.set('role', role);
    rec.set('family_id', fid); rec.set('emailVisibility', true); rec.set('active', true);
    $app.save(rec);

    // Mark invite as used to prevent reuse
    inv.set('used', true);
    $app.save(inv);

    return c.json(201, {
      user: { id: rec.id, email: String(rec.get('email')||''), name: String(rec.get('name')||''), first_name: String(rec.get('first_name')||''), last_name: String(rec.get('last_name')||''), role: role, family_id: fid }
    });
  } catch(e) { return c.json(400, { error: String(e) }); }
});

// ── Entries: LIST (GET) ──
routerAdd('GET', '/api/todoless/entries', (c) => {
  try {
    var info = c.requestInfo();
    var auth = info && info.auth ? info.auth : null;
    if (!auth) return c.json(401, { error: 'Unauthorized' });
    var q = info.query || {};
    var fid = String(auth.get('family_id') || '').trim();
    var f = fid ? 'user.family_id = "' + fid + '"' : 'user = "' + auth.id + '"';
    var tasks = $app.findRecordsByFilter('tasks', f, '-created', 0, 0).map(function(r) {
      return { id:r.id, type:'task', title: (r.get('title')||''), description: (r.get('blocked_comment')||''), status: (r.get('status')||'todo'), assignee_id: (r.get('assigned_to')||''), labels: (r.get('labels')||[]), shop_id:'', quantity:null, created_by: (r.get('user')||''), completed_by:'', created_at: r.created, updated_at: r.updated };
    });
    var items = $app.findRecordsByFilter('items', f, '-created', 0, 0).map(function(r) {
      return { id:r.id, type:'grocery', title: (r.get('title')||''), description:'', status: r.get('completed')?'done':'todo', assignee_id: (r.get('assigned_to')||''), labels: (r.get('labels')||[]), shop_id: (r.get('shop_id')||''), quantity: (r.get('quantity')||1), created_by: (r.get('user')||''), completed_by:'', created_at: r.created, updated_at: r.updated };
    });
    var all = tasks.concat(items);
    var t = (q.type||'').trim(), s = (q.status||'').trim(), a = (q.assignee_id||'').trim(), l = (q.label||'').trim(), sh = (q.shop_id||'').trim();
    var res = [];
    for (var i=0;i<all.length;i++) { var e=all[i];
      if (t && e.type!==t) continue; if (s && e.status!==s) continue; if (a && e.assignee_id!==a) continue;
      if (l && (!Array.isArray(e.labels) || e.labels.indexOf(l)===-1)) continue; if (sh && e.shop_id!==sh) continue;
      res.push(e);
    }
    return c.json(200, res);
  } catch(e) { return c.json(400, { error: String(e) }); }
});

// ── API v2: POST /api/todoless/api (unified action dispatcher) ──
routerAdd('POST', '/api/todoless/api', (c) => {
  try {
    var info = c.requestInfo();
    var body = info.data || info.body || {};
    var d = body;
    var action = (d.action || '').trim();
    if (!action) return c.json(400, { error: 'action required' });
    var auth = null;

    // Auth check — use info.auth (PB 0.34: c.auth is null without middleware)
    var needsAuth = ['create','update','complete','assign','delete','list','filters','set_role','set_user_block','delete_user'];
    if (needsAuth.indexOf(action) >= 0) {
      auth = info.auth;
      if (!auth) return c.json(401, { error: 'Unauthorized' });

      // Enforce blocked users cannot use authenticated API routes
      var authFresh = $app.findRecordById('users', auth.id);
      if (!authFresh) return c.json(401, { error: 'Unauthorized' });
      var rawActive = authFresh.get('active');
      var isBlocked = (rawActive === false || rawActive === 0 || rawActive === 'false');
      if (isBlocked) return c.json(403, { error: 'Account is blocked' });
      auth = authFresh;
    }

    // Helper for safe field access (must be inside callback for PB 0.34 scope)
    var gv = function(o,k,f) { if(f===undefined)f='';if(!o)return f;if(Object.prototype.hasOwnProperty.call(o,k)){var v=o[k];return(v===undefined||v===null)?f:v;}return f; };

    if (action === 'list') {
      var q = info.query || {};
      var fid = String(auth.get('family_id') || '').trim();
      var f = fid ? 'user.family_id = "' + fid + '"' : 'user = "' + auth.id + '"';
      var tasks = $app.findRecordsByFilter('tasks', f, '-created', 0, 0).map(function(r) {
        return { id:r.id, type:'task', title:(r.get('title')||''), description:(r.get('blocked_comment')||''), status:(r.get('status')||'todo'), assignee_id:(r.get('assigned_to')||''), labels:(r.get('labels')||[]), shop_id:'', quantity:null, created_by:(r.get('user')||''), completed_by:'', created_at:r.created, updated_at:r.updated };
      });
      var items = $app.findRecordsByFilter('items', f, '-created', 0, 0).map(function(r) {
        return { id:r.id, type:'grocery', title:(r.get('title')||''), description:'', status:r.get('completed')?'done':'todo', assignee_id:(r.get('assigned_to')||''), labels:(r.get('labels')||[]), shop_id:(r.get('shop_id')||''), quantity:(r.get('quantity')||1), created_by:(r.get('user')||''), completed_by:'', created_at:r.created, updated_at:r.updated };
      });
      var all = tasks.concat(items);
      var t=(q.type||'').trim(),s=(q.status||'').trim(),a=(q.assignee_id||'').trim(),l=(q.label||'').trim(),sh=(q.shop_id||'').trim();
      var res = [];
      for (var i=0;i<all.length;i++) { var e=all[i];
        if(t&&e.type!==t)continue;if(s&&e.status!==s)continue;if(a&&e.assignee_id!==a)continue;
        if(l&&(!Array.isArray(e.labels)||e.labels.indexOf(l)===-1))continue;if(sh&&e.shop_id!==sh)continue;
        res.push(e);
      }
      return c.json(200, res);
    }

    if (action === 'create') {
      var type = String(gv(d,'type','')).trim();
      var title = String(gv(d,'title','')).trim();
      if (!type || (type!=='task'&&type!=='grocery')) return c.json(400, { error: 'type must be task or grocery' });
      if (!title) return c.json(400, { error: 'title required' });
      if (type==='task') {
        var rec = new Record($app.findCollectionByNameOrId('tasks'));
        var rs = String(gv(d,'status','todo')||'todo');
        var st = ['backlog','todo','in_progress','done'].indexOf(rs)>=0?rs:'todo';
        if (st==='in_progress') st='todo';
        rec.set('user',auth.id);rec.set('title',title);rec.set('status',st);
        rec.set('blocked_comment',String(gv(d,'description','')||''));
        rec.set('assigned_to',gv(d,'assignee_id',''));rec.set('labels',gv(d,'labels',[]));
        rec.set('is_private',false);rec.set('completed_at',st==='done'?new Date().toISOString():null);
        rec.set('flag',false);$app.save(rec);
        return c.json(201,{id:rec.id,type:'task',title:rec.get('title')||'',description:rec.get('blocked_comment')||'',status:rec.get('status')||'todo',assignee_id:rec.get('assigned_to')||'',labels:rec.get('labels')||[],shop_id:'',quantity:null,created_by:rec.get('user')||'',completed_by:'',created_at:rec.created,updated_at:rec.updated});
      }
      rec = new Record($app.findCollectionByNameOrId('items'));
      rec.set('user',auth.id);rec.set('title',title);rec.set('completed',String(gv(d,'status','todo')||'todo')==='done');
      rec.set('assigned_to',gv(d,'assignee_id',''));rec.set('labels',gv(d,'labels',[]));
      rec.set('shop_id',gv(d,'shop_id',''));rec.set('quantity',gv(d,'quantity',1));rec.set('is_private',false);
      $app.save(rec);
      return c.json(201,{id:rec.id,type:'grocery',title:rec.get('title')||'',description:'',status:rec.get('completed')?'done':'todo',assignee_id:rec.get('assigned_to')||'',labels:rec.get('labels')||[],shop_id:rec.get('shop_id')||'',quantity:rec.get('quantity')||1,created_by:rec.get('user')||'',completed_by:'',created_at:rec.created,updated_at:rec.updated});
    }

    if (action === 'update') {
      var id = String(gv(d,'id','')).trim();
      var type = String(gv(d,'type','')).trim();
      if (!id) return c.json(400, { error: 'id required' });
      if (!type||(type!=='task'&&type!=='grocery')) return c.json(400,{error:'type must be task or grocery'});
      var rec = $app.findRecordById(type==='task'?'tasks':'items',id);
      if (!rec) return c.json(404,{error:'Entry not found'});
      if(Object.prototype.hasOwnProperty.call(d,'title')) rec.set('title',gv(d,'title',''));
      if(Object.prototype.hasOwnProperty.call(d,'assignee_id')) rec.set('assigned_to',gv(d,'assignee_id',''));
      if(Object.prototype.hasOwnProperty.call(d,'labels')) rec.set('labels',gv(d,'labels',[]));
      if(type==='task') {
        if(Object.prototype.hasOwnProperty.call(d,'description')) rec.set('blocked_comment',gv(d,'description',''));
        if(Object.prototype.hasOwnProperty.call(d,'status')){var sr=String(gv(d,'status','todo'));if(sr==='in_progress')sr='todo';rec.set('status',sr);rec.set('completed_at',sr==='done'?new Date().toISOString():null);}
        $app.save(rec);return c.json(200,{id:rec.id,type:'task',title:rec.get('title'),description:rec.get('blocked_comment'),status:rec.get('status'),assignee_id:rec.get('assigned_to'),labels:rec.get('labels'),shop_id:'',quantity:null,created_by:rec.get('user'),completed_by:'',created_at:rec.created,updated_at:rec.updated});
      }
      if(Object.prototype.hasOwnProperty.call(d,'status')) rec.set('completed',String(gv(d,'status','todo'))==='done');
      if(Object.prototype.hasOwnProperty.call(d,'shop_id')) rec.set('shop_id',gv(d,'shop_id',''));
      if(Object.prototype.hasOwnProperty.call(d,'quantity')) rec.set('quantity',gv(d,'quantity',1));
      $app.save(rec);return c.json(200,{id:rec.id,type:'grocery',title:rec.get('title'),description:'',status:rec.get('completed')?'done':'todo',assignee_id:rec.get('assigned_to'),labels:rec.get('labels'),shop_id:rec.get('shop_id'),quantity:rec.get('quantity'),created_by:rec.get('user'),completed_by:'',created_at:rec.created,updated_at:rec.updated});
    }

    if (action === 'complete') {
      var id = String(gv(d,'id','')).trim();
      var type = String(gv(d,'type','')).trim();
      var complete = String(gv(d,'complete','true'))!=='false';
      if (!id) return c.json(400,{error:'id required'});
      if(!type||(type!=='task'&&type!=='grocery')) return c.json(400,{error:'type must be task or grocery'});
      var rec = $app.findRecordById(type==='task'?'tasks':'items',id);
      if(!rec) return c.json(404,{error:'Entry not found'});
      if(type==='task'){rec.set('status',complete?'done':'todo');rec.set('completed_at',complete?new Date().toISOString():null);}
      else{rec.set('completed',complete);}
      $app.save(rec);return c.json(200,{completed:true});
    }

    if (action === 'assign') {
      var id = String(gv(d,'id','')).trim();
      var type = String(gv(d,'type','')).trim();
      if(!id) return c.json(400,{error:'id required'});
      if(!type||(type!=='task'&&type!=='grocery')) return c.json(400,{error:'type must be task or grocery'});
      var rec = $app.findRecordById(type==='task'?'tasks':'items',id);
      if(!rec) return c.json(404,{error:'Entry not found'});
      rec.set('assigned_to',String(gv(d,'assignee_id','')));
      $app.save(rec);return c.json(200,{assigned:true});
    }

    if (action === 'delete') {
      var id = String(gv(d,'id','')).trim();
      var type = String(gv(d,'type','')).trim();
      if(!id) return c.json(400,{error:'id required'});
      if(!type||(type!=='task'&&type!=='grocery')) return c.json(400,{error:'type must be task or grocery'});
      var rec = $app.findRecordById(type==='task'?'tasks':'items',id);
      if(!rec) return c.json(404,{error:'Entry not found'});
      $app.delete(rec);return c.json(200,{deleted:true});
    }

    if (action === 'filters') {
      var fid = String(auth.get('family_id')||'').trim();
      var f = fid?'user.family_id = "'+fid+'"':'user = "'+auth.id+'"';
      var labels = $app.findRecordsByFilter('labels',f,'name',0,0).map(function(r){return{id:r.id,name:r.get('name'),color:r.get('color')};});
      var shops = $app.findRecordsByFilter('shops',f,'name',0,0).map(function(r){return{id:r.id,name:r.get('name'),color:r.get('color')};});
      var users = [];
      if(fid){users=$app.findRecordsByFilter('users','family_id = "'+fid+'"','name',0,0).map(function(r){return{id:r.id,name:r.get('name')||String(r.get('email')||''),role:r.get('role')||'user',active:!!r.get('active')};});}
      return c.json(200,{labels:labels,shops:shops,users:users});
    }

    if (action === 'set_user_block') {
      var blockActorRole = String(auth.get('role') || 'user');
      if (blockActorRole !== 'admin') return c.json(403, { error: 'Admin only' });

      var blockTargetId = String(gv(d,'user_id','')).trim();
      var blockValueRaw = gv(d,'blocked',true);
      var shouldBlock = blockValueRaw === true || String(blockValueRaw) === 'true' || String(blockValueRaw) === '1';
      if (!blockTargetId) return c.json(400, { error: 'user_id required' });
      if (blockTargetId === auth.id) return c.json(409, { error: 'cannot block yourself' });

      var blockActorFamilyId = String(auth.get('family_id') || '');
      var blockTarget = $app.findRecordById('users', blockTargetId);
      if (!blockTarget) return c.json(404, { error: 'user not found' });
      var blockTargetFamilyId = String(blockTarget.get('family_id') || '');
      if (!blockActorFamilyId || blockActorFamilyId !== blockTargetFamilyId) return c.json(403, { error: 'cross-family block denied' });

      var blockTargetRole = String(blockTarget.get('role') || 'user');
      if (blockTargetRole === 'admin' && shouldBlock) return c.json(409, { error: 'cannot block admin account' });

      blockTarget.set('active', shouldBlock ? false : true);
      $app.save(blockTarget);
      return c.json(200, { ok: true, user: { id: blockTarget.id, active: !!blockTarget.get('active') } });
    }

    if (action === 'delete_user') {
      var delActorRole = String(auth.get('role') || 'user');
      if (delActorRole !== 'admin') return c.json(403, { error: 'Admin only' });

      var delTargetId = String(gv(d,'user_id','')).trim();
      if (!delTargetId) return c.json(400, { error: 'user_id required' });
      if (delTargetId === auth.id) return c.json(409, { error: 'cannot delete yourself' });

      var delActorFamilyId = String(auth.get('family_id') || '');
      var delTarget = $app.findRecordById('users', delTargetId);
      if (!delTarget) return c.json(404, { error: 'user not found' });
      var delTargetFamilyId = String(delTarget.get('family_id') || '');
      if (!delActorFamilyId || delActorFamilyId !== delTargetFamilyId) return c.json(403, { error: 'cross-family delete denied' });

      var delTargetRole = String(delTarget.get('role') || 'user');
      if (delTargetRole === 'admin') return c.json(409, { error: 'cannot delete admin account' });

      // Transfer ownership to acting admin to prevent FK constraint issues.
      var transferCollections = ['tasks','items','notes','labels','shops','rewards','goals','projects','reminders','calendar_events','invite_codes'];
      for (var tc = 0; tc < transferCollections.length; tc++) {
        var collName = transferCollections[tc];
        var owned = [];
        try {
          owned = $app.findRecordsByFilter(collName, 'user = "' + delTargetId + '"', '-created', 0, 0);
        } catch (_eOwned) {
          owned = [];
        }
        for (var oi = 0; oi < owned.length; oi++) {
          owned[oi].set('user', auth.id);
          $app.save(owned[oi]);
        }
      }

      // Clear assignee references in task/item records.
      var assignedTasks = [];
      try { assignedTasks = $app.findRecordsByFilter('tasks', 'assigned_to = "' + delTargetId + '"', '-created', 0, 0); } catch (_eTasks) { assignedTasks = []; }
      for (var ti = 0; ti < assignedTasks.length; ti++) {
        assignedTasks[ti].set('assigned_to', '');
        $app.save(assignedTasks[ti]);
      }
      var assignedItems = [];
      try { assignedItems = $app.findRecordsByFilter('items', 'assigned_to = "' + delTargetId + '"', '-created', 0, 0); } catch (_eItems) { assignedItems = []; }
      for (var ii = 0; ii < assignedItems.length; ii++) {
        assignedItems[ii].set('assigned_to', '');
        $app.save(assignedItems[ii]);
      }

      $app.delete(delTarget);
      return c.json(200, { ok: true, deleted_user_id: delTargetId });
    }

    if (action === 'set_role') {
      var roleActor = String(auth.get('role') || 'user');
      if (roleActor !== 'admin') return c.json(403, { error: 'Admin only' });

      var targetId = String(gv(d,'user_id','')).trim();
      var nextRole = String(gv(d,'role','')).trim();
      if (!targetId) return c.json(400, { error: 'user_id required' });
      if (['admin','user','assistant','child'].indexOf(nextRole) === -1) return c.json(400, { error: 'invalid role' });

      var actorFamilyId = String(auth.get('family_id') || '');
      var target = $app.findRecordById('users', targetId);
      if (!target) return c.json(404, { error: 'user not found' });
      var targetFamilyId = String(target.get('family_id') || '');
      if (!actorFamilyId || actorFamilyId !== targetFamilyId) return c.json(403, { error: 'cross-family role change denied' });

      var admins = $app.findRecordsByFilter('users', 'family_id = "' + actorFamilyId + '" && role = "admin"', '-created', 0, 0);
      var targetCurrentRole = String(target.get('role') || 'user');

      // single-admin: no second admin
      if (nextRole === 'admin') {
        var otherAdmins = admins.filter(function(u){ return u.id !== target.id; });
        if (otherAdmins.length > 0) return c.json(409, { error: 'single-admin enforced: family already has an admin' });
      }

      // single-admin: cannot demote last admin
      if (targetCurrentRole === 'admin' && nextRole !== 'admin') {
        var adminCount = admins.length;
        if (adminCount <= 1) return c.json(409, { error: 'cannot demote last admin' });
      }

      target.set('role', nextRole);
      $app.save(target);
      return c.json(200, { ok: true, user: { id: target.id, role: String(target.get('role')||'user') } });
    }

    return c.json(400, { error: 'Unknown action: ' + action });
  } catch(e) { return c.json(400, { error: String(e) }); }
});

// Load all route modules
try { require(__hooks + '/routes/openapi.js'); } catch(e) { console.log('openapi:', String(e)); }
try { require(__hooks + '/routes/agent-keys.js'); } catch(e) { console.log('agent-keys:', String(e)); }
try { require(__hooks + '/routes/paperless.js'); } catch(e) { console.log('paperless:', String(e)); }
try { require(__hooks + '/routes/docs.js'); } catch(e) { console.log('docs:', String(e)); }
try { require(__hooks + '/routes/tasks.js'); } catch(e) { console.log('tasks:', String(e)); }
try { require(__hooks + '/routes/items.js'); } catch(e) { console.log('items:', String(e)); }
try { require(__hooks + '/routes/reminders.js'); } catch(e) { console.log('reminders:', String(e)); }
try { require(__hooks + '/routes/notes.js'); } catch(e) { console.log('notes:', String(e)); }
try { require(__hooks + '/routes/labels.js'); } catch(e) { console.log('labels:', String(e)); }
try { require(__hooks + '/routes/shops.js'); } catch(e) { console.log('shops:', String(e)); }
try { require(__hooks + '/routes/sprints.js'); } catch(e) { console.log('sprints:', String(e)); }
try { require(__hooks + '/routes/calendar.js'); } catch(e) { console.log('calendar:', String(e)); }
try { require(__hooks + '/routes/goals.js'); } catch(e) { console.log('goals:', String(e)); }
try { require(__hooks + '/routes/rewards.js'); } catch(e) { console.log('rewards:', String(e)); }
try { require(__hooks + '/routes/projects.js'); } catch(e) { console.log('projects:', String(e)); }
try { require(__hooks + '/routes/invites.js'); } catch(e) { console.log('invites:', String(e)); }
try { require(__hooks + '/routes/families.js'); } catch(e) { console.log('families:', String(e)); }
try { require(__hooks + '/routes/settings.js'); } catch(e) { console.log('settings:', String(e)); }
try { require(__hooks + '/routes/users.js'); } catch(e) { console.log('users:', String(e)); }
try { require(__hooks + '/routes/ai.js'); } catch(e) { console.log('ai:', String(e)); }
try { require(__hooks + '/routes/agents.js'); } catch(e) { console.log('agents:', String(e)); }
try { require(__hooks + '/routes/task-actions.js'); } catch(e) { console.log('task-actions:', String(e)); }
try { require(__hooks + '/routes/shared.js'); } catch(e) { console.log('shared:', String(e)); }
try { require(__hooks + '/routes/api-tokens.js'); } catch(e) { console.log('api-tokens:', String(e)); }
try { require(__hooks + '/routes/invite-registration.js'); } catch(e) { console.log('invite-registration:', String(e)); }
try { require(__hooks + '/routes/daily-briefing.js'); } catch(e) { console.log('daily-briefing:', String(e)); }
try { require(__hooks + '/01_api_token_auth.js'); } catch(e) { console.log('api-token-auth:', String(e)); }
