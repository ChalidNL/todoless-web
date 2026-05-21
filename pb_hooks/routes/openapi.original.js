/// <reference path="../../pb_data/types.d.ts" />

// OpenAPI 3.0.3 specification for the Todoless API
// Served at: GET /api/todoless/openapi.json

routerAdd('GET', '/api/todoless/openapi.json', (c) => {
  var spec = {
    openapi: "3.0.3",
    info: {
      title: "Todoless API",
      version: "1.0.0",
      description: "Todoless — self-hosted multi-user task and grocery manager.\n\nBase URL: https://[host]:7070/api\n\nAuthentication: PocketBase JWT token via Authorization: Bearer *** or PB cookie.",
      contact: { name: "Todoless" },
    },
    servers: [
      { url: "/api", description: "Nginx proxy (port 7070)" },
      { url: "http://localhost:8090/api", description: "Direct PocketBase (dev)" },
    ],
    tags: [
      { name: "System", description: "Health check, setup status, OpenAPI spec" },
      { name: "Auth", description: "Authentication and registration" },
      { name: "Invites", description: "Invite code management" },
      { name: "Entries", description: "Unified entries (tasks + groceries)" },
      { name: "Tasks", description: "Task CRUD and actions" },
      { name: "Items", description: "Grocery items CRUD and actions" },
      { name: "Calendar", description: "Calendar events" },
      { name: "Families", description: "Family management (multi-user)" },
      { name: "Goals", description: "Goals/rewards points tracking" },
      { name: "Labels", description: "Label/tag management" },
      { name: "Notes", description: "Notes" },
      { name: "Paperless", description: "Paperless-ngx integration" },
      { name: "Projects", description: "Project management" },
      { name: "Reminders", description: "Reminders" },
      { name: "Rewards", description: "Rewards/awards" },
      { name: "Settings", description: "User settings" },
      { name: "Shared", description: "Shared cross-user views" },
      { name: "Shops", description: "Shop management (grocery)" },
      { name: "Sprints", description: "Sprint management" },
      { name: "Users", description: "User management" },
      { name: "AI", description: "AI assistant integration" },
      { name: "External References", description: "External system link management (Paperless, Home Assistant, Gmail, custom)" },
    ],
    paths: {
      // ── System ──
      "/todoless/hook-health": {
        get: {
          tags: ["System"],
          summary: "Health check",
          description: "Returns { ok: true } if the hooks are alive. No auth required.",
          operationId: "hookHealth",
          responses: {
            "200": { description: "OK", content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean", example: true } } } } } },
          },
        },
      },
      "/todoless/setup-status": {
        get: {
          tags: ["System", "Auth"],
          summary: "Setup status",
          description: "Public endpoint returning bootstrap status for first-run onboarding detection.",
          operationId: "setupStatus",
          responses: {
            "200": {
              description: "Setup status",
              content: { "application/json": { schema: { type: "object", properties: { has_users: { type: "boolean" }, setup_complete: { type: "boolean" } }, example: { has_users: false, setup_complete: false } } } },
            },
          },
        },
      },
      "/todoless/openapi.json": {
        get: {
          tags: ["System"],
          summary: "OpenAPI spec",
          description: "Returns this OpenAPI specification document.",
          operationId: "getOpenApiSpec",
          responses: { "200": { description: "OpenAPI spec" } },
        },
      },
      "/todoless/docs": {
        get: {
          tags: ["System"],
          summary: "Swagger UI",
          description: "Swagger UI HTML page for interactive API exploration.",
          operationId: "getSwaggerUi",
          responses: { "200": { description: "Swagger UI HTML page" } },
        },
      },

      // ── Auth & Registration ──
      "/todoless/register": {
        post: registerSchema(),
      },
      "/todoless/validate-invite": {
        get: validateInviteSchema(),
      },

      // ── Unified API v2 ──
      "/todoless/api": {
        post: unifiedApiSchema(),
      },

      // ── Entries ──
      "/todoless/entries": {
        get: listEntriesSchema(),
      },

      // ── Tasks CRUD ──
      "/todoless/tasks": {
        get: listTasksSchema(),
        post: createTaskSchema(),
      },
      "/todoless/tasks/{id}": {
        get: getTaskSchema(),
        patch: updateTaskSchema(),
        delete: deleteTaskSchema(),
      },

      // ── Task Actions ──
      "/todoless/tasks/{id}/archive": { post: archiveTaskSchema() },
      "/todoless/tasks/archive-done": { post: archiveDoneTasksSchema() },
      "/todoless/tasks/{id}/convert-to-item": { post: convertTaskToItemSchema() },
      "/todoless/tasks/uncheck-all-done": { post: uncheckAllTasksSchema() },
      "/todoless/tasks/{id}/move": { post: moveTaskSchema() },

      // ── Items CRUD ──
      "/todoless/items": {
        get: listItemsSchema(),
        post: createItemSchema(),
      },
      "/todoless/items/{id}": {
        get: getItemSchema(),
        patch: updateItemSchema(),
        delete: deleteItemSchema(),
      },
      "/todoless/items/{id}/convert-to-task": { post: convertItemToTaskSchema() },
      "/todoless/items/uncheck-all-done": { post: uncheckAllItemsSchema() },

      // ── Calendar ──
      "/todoless/calendar": {
        get: listCalendarEventsSchema(),
        post: createCalendarEventSchema(),
      },
      "/todoless/calendar/{id}": {
        get: getCalendarEventSchema(),
        patch: updateCalendarEventSchema(),
        delete: deleteCalendarEventSchema(),
      },

      // ── Families ──
      "/todoless/families": {
        get: listFamiliesSchema(),
        post: createFamilySchema(),
      },
      "/todoless/families/{id}": { get: getFamilySchema() },
      "/todoless/families/join/{id}": { post: joinFamilySchema() },
      "/todoless/families/leave": { post: leaveFamilySchema() },

      // ── Goals ──
      "/todoless/goals": {
        get: listGoalsSchema(),
        post: createGoalSchema(),
      },
      "/todoless/goals/{id}": {
        get: getGoalSchema(),
        patch: updateGoalSchema(),
        delete: deleteGoalSchema(),
      },

      // ── Invites ──
      "/todoless/invites": {
        get: listInvitesSchema(),
        post: createInviteSchema(),
      },
      "/todoless/invites/{id}": {
        get: getInviteSchema(),
        delete: deleteInviteSchema(),
      },
      "/todoless/invites/create": { post: createInviteServerSideSchema() },
      "/todoless/invites/generate": { post: generateInviteSchema() },
      "/todoless/invites/{id}/use": { post: useInviteSchema() },

      // ── Labels ──
      "/todoless/labels": {
        get: listLabelsSchema(),
        post: createLabelSchema(),
      },
      "/todoless/labels/{id}": {
        get: getLabelSchema(),
        patch: updateLabelSchema(),
        delete: deleteLabelSchema(),
      },

      // ── Notes ──
      "/todoless/notes": {
        get: listNotesSchema(),
        post: createNoteSchema(),
      },
      "/todoless/notes/{id}": {
        get: getNoteSchema(),
        patch: updateNoteSchema(),
        delete: deleteNoteSchema(),
      },

      // ── Paperless ──
      "/integrations/paperless/webhook": { post: paperlessWebhookSchema() },
      "/integrations/paperless/poll": { get: paperlessPollSchema() },
      "/integrations/paperless/test": { get: paperlessTestSchema() },
      "/integrations/paperless/config": { post: paperlessConfigSchema() },
      "/integrations/paperless/sync": { post: paperlessSyncSchema() },

      // ── Projects ──
      "/todoless/projects": {
        get: listProjectsSchema(),
        post: createProjectSchema(),
      },
      "/todoless/projects/{id}": {
        get: getProjectSchema(),
        patch: updateProjectSchema(),
        delete: deleteProjectSchema(),
      },

      // ── Reminders ──
      "/todoless/reminders": {
        get: listRemindersSchema(),
        post: createReminderSchema(),
      },
      "/todoless/reminders/{id}": {
        patch: updateReminderSchema(),
        delete: deleteReminderSchema(),
      },

      // ── Rewards ──
      "/todoless/rewards": {
        get: listRewardsSchema(),
        post: createRewardSchema(),
      },
      "/todoless/rewards/{id}": {
        get: getRewardSchema(),
        delete: deleteRewardSchema(),
      },

      // ── Settings ──
      "/todoless/settings": {
        get: getSettingsSchema(),
        patch: updateSettingsSchema(),
      },

      // ── Shared Views ──
      "/todoless/shared/tasks": { get: sharedTasksSchema() },
      "/todoless/shared/items": { get: sharedItemsSchema() },
      "/todoless/shared/notes": { get: sharedNotesSchema() },

      // ── Shops ──
      "/todoless/shops": {
        get: listShopsSchema(),
        post: createShopSchema(),
      },
      "/todoless/shops/{id}": {
        get: getShopSchema(),
        patch: updateShopSchema(),
        delete: deleteShopSchema(),
      },

      // ── Sprints ──
      "/todoless/sprints": {
        get: listSprintsSchema(),
        post: createSprintSchema(),
      },
      "/todoless/sprints/{id}": {
        get: getSprintSchema(),
        patch: updateSprintSchema(),
        delete: deleteSprintSchema(),
      },
      "/todoless/sprints/new": { post: newSprintSchema() },
      "/todoless/sprints/{id}/archive-tasks": { post: archiveSprintTasksSchema() },

      // ── Users ──
      "/todoless/users": { get: listUsersSchema() },
      "/todoless/users/{id}": {
        get: getUserSchema(),
        patch: updateUserSchema(),
      },

      // ── AI ──
      "/todoless/ai/config": {
        get: getAiConfigSchema(),
        post: configureAiSchema(),
      },
      "/todoless/ai/categorize": { post: aiCategorizeSchema() },
      "/todoless/ai/suggest": { post: aiSuggestSchema() },
      "/todoless/ai/chat": { post: aiChatSchema() },

      // ── External References ──
      "/todoless/external-references": {
        get: listExternalRefsSchema(),
        post: createExternalRefSchema(),
      },
      "/todoless/external-references/{id}": {
        get: getExternalRefSchema(),
        patch: updateExternalRefSchema(),
        delete: deleteExternalRefSchema(),
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "PocketBase JWT token from auth-with-password or auth-refresh.",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "pb_token",
          description: "PocketBase auth cookie (set after login).",
        },
      },
      schemas: {
        Error: { type: "object", required: ["error"], properties: { error: { type: "string", example: "Unauthorized" } } },
        Entry: { type: "object", properties: entryProps() },
        Task: { type: "object", properties: taskProps() },
        Item: { type: "object", properties: itemProps() },
        CalendarEvent: { type: "object", properties: calendarProps() },
        Label: { type: "object", properties: labelProps() },
        Shop: { type: "object", properties: shopProps() },
        Note: { type: "object", properties: noteProps() },
        User: { type: "object", properties: userProps() },
        Family: { type: "object", properties: familyProps() },
        Goal: { type: "object", properties: goalProps() },
        Reward: { type: "object", properties: rewardProps() },
        Project: { type: "object", properties: projectProps() },
        Sprint: { type: "object", properties: sprintProps() },
        Reminder: { type: "object", properties: reminderProps() },
        Invite: { type: "object", properties: inviteProps() },
        AiConfig: { type: "object", properties: aiConfigProps() },
        Settings: { type: "object", properties: settingsProps() },
        ExternalRef: { type: "object", properties: externalRefProps() },
        Filters: { type: "object", properties: { labels: { type: "array", items: { "$ref": "#/components/schemas/Label" } }, shops: { type: "array", items: { "$ref": "#/components/schemas/Shop" } }, users: { type: "array", items: { type: "object", properties: { id: { type: "string" }, name: { type: "string" }, role: { type: "string" }, active: { type: "boolean" } } } } } },
      },
    },
    security: [
      { bearerAuth: [] },
      { cookieAuth: [] },
    ],
  };

  return c.json(200, spec);
});

// ── Helper: reusable field definitions ──

function entryProps() {
  return {
    id: { type: "string", description: "Record ID" },
    type: { type: "string", enum: ["task", "grocery"], description: "Entry type" },
    title: { type: "string", example: "Buy milk" },
    description: { type: "string", example: "2% organic" },
    status: { type: "string", enum: ["todo", "done", "backlog", "in_progress"], example: "todo" },
    assignee_id: { type: "string", description: "Assigned user ID", nullable: true },
    labels: { type: "array", items: { type: "string" }, example: ["shopping"] },
    shop_id: { type: "string", description: "Shop ID (grocery only)", nullable: true },
    quantity: { type: "integer", description: "Quantity (grocery only)", nullable: true },
    created_by: { type: "string", description: "Creator user ID" },
    completed_by: { type: "string", nullable: true },
    created_at: { type: "string", format: "date-time" },
    updated_at: { type: "string", format: "date-time" },
  };
}

function taskProps() {
  return {
    id: { type: "string" },
    title: { type: "string", example: "Fix login bug" },
    status: { type: "string", enum: ["todo", "in_progress", "done", "backlog"], example: "todo" },
    blocked: { type: "boolean", example: false },
    blocked_comment: { type: "string", nullable: true },
    priority: { type: "string", enum: ["urgent", "normal", "low"], example: "normal" },
    horizon: { type: "string", enum: ["week", "month", "3months", "6months", "year"], example: "week" },
    due_date: { type: "string", format: "date", nullable: true },
    repeat_interval: { type: "string", nullable: true, example: "weekly" },
    labels: { type: "array", items: { type: "string" } },
    assigned_to: { type: "string", nullable: true },
    sprint_id: { type: "string", nullable: true },
    is_private: { type: "boolean", default: false },
    archived: { type: "boolean", default: false },
    flag: { type: "boolean", default: false },
    linked_to: { type: "string", nullable: true, description: "Linked entity ID" },
    linked_type: { type: "string", nullable: true, description: "Linked entity type" },
    linked_item_ids: { type: "array", items: { type: "string" } },
    linked_note_ids: { type: "array", items: { type: "string" } },
    user: { type: "string", description: "Creator user ID" },
    completed_at: { type: "string", format: "date-time", nullable: true },
    created: { type: "string", format: "date-time" },
    updated: { type: "string", format: "date-time" },
  };
}

function itemProps() {
  return {
    id: { type: "string" },
    title: { type: "string", example: "Apples" },
    completed: { type: "boolean", default: false },
    quantity: { type: "integer", default: 1 },
    shop_id: { type: "string", nullable: true },
    priority: { type: "string", nullable: true },
    assigned_to: { type: "string", nullable: true },
    due_date: { type: "string", format: "date", nullable: true },
    labels: { type: "array", items: { type: "string" } },
    is_private: { type: "boolean", default: false },
    user: { type: "string" },
    created: { type: "string", format: "date-time" },
    updated: { type: "string", format: "date-time" },
  };
}

function calendarProps() {
  return {
    id: { type: "string" },
    title: { type: "string", example: "Team standup" },
    description: { type: "string", nullable: true },
    start_time: { type: "string", format: "date-time" },
    end_time: { type: "string", format: "date-time", nullable: true },
    all_day: { type: "boolean", default: false },
    task_id: { type: "string", nullable: true, description: "Linked task ID" },
    user: { type: "string" },
  };
}

function labelProps() {
  return {
    id: { type: "string" },
    name: { type: "string", example: "shopping" },
    color: { type: "string", example: "#6366f1" },
    is_private: { type: "boolean", default: false },
    user: { type: "string" },
  };
}

function shopProps() {
  return {
    id: { type: "string" },
    name: { type: "string", example: "Supermarket" },
    color: { type: "string", example: "#6366f1" },
    user: { type: "string" },
  };
}

function noteProps() {
  return {
    id: { type: "string" },
    title: { type: "string", nullable: true, example: "Meeting notes" },
    content: { type: "string", example: "# Notes\nAction items..." },
    pinned: { type: "boolean", default: false },
    labels: { type: "array", items: { type: "string" } },
    linked_type: { type: "string", nullable: true },
    linked_to: { type: "string", nullable: true },
    user: { type: "string" },
  };
}

function userProps() {
  return {
    id: { type: "string" },
    email: { type: "string", format: "email" },
    name: { type: "string" },
    avatar: { type: "string", nullable: true },
    role: { type: "string", enum: ["admin", "user", "assistant", "child"] },
    family_id: { type: "string", nullable: true },
    active: { type: "boolean", default: true },
  };
}

function familyProps() {
  return {
    id: { type: "string" },
    name: { type: "string", example: "My Family" },
    created_by: { type: "string" },
  };
}

function goalProps() {
  return {
    id: { type: "string" },
    title: { type: "string", example: "Read 12 books" },
    description: { type: "string", nullable: true },
    points_required: { type: "integer", default: 0 },
    points_current: { type: "integer", default: 0 },
    target_user: { type: "string", nullable: true },
    completed: { type: "boolean", default: false },
    completed_at: { type: "string", format: "date-time", nullable: true },
    user: { type: "string" },
  };
}

function rewardProps() {
  return {
    id: { type: "string" },
    title: { type: "string", example: "Star sticker" },
    points: { type: "integer", default: 0 },
    earned_by: { type: "string", nullable: true },
    awarded_by: { type: "string" },
    reason: { type: "string", nullable: true },
    task_id: { type: "string", nullable: true },
    earned_at: { type: "string", format: "date-time", nullable: true },
    user: { type: "string" },
  };
}

function projectProps() {
  return {
    id: { type: "string" },
    title: { type: "string", example: "Home renovation" },
    description: { type: "string", nullable: true },
    color: { type: "string", example: "#6366f1" },
    status: { type: "string", enum: ["active", "completed", "archived"] },
    task_ids: { type: "array", items: { type: "string" } },
    due_date: { type: "string", format: "date", nullable: true },
    user: { type: "string" },
  };
}

function sprintProps() {
  return {
    id: { type: "string" },
    name: { type: "string", example: "Sprint 5" },
    start_date: { type: "string", format: "date" },
    end_date: { type: "string", format: "date" },
    duration: { type: "string", example: "2weeks" },
    week_number: { type: "integer" },
    year: { type: "integer" },
    user: { type: "string" },
  };
}

function reminderProps() {
  return {
    id: { type: "string" },
    title: { type: "string", example: "Doctor appointment" },
    message: { type: "string", nullable: true },
    reminder_time: { type: "string", format: "date-time" },
    fired: { type: "boolean", default: false },
    dismissed: { type: "boolean", default: false },
    linked_type: { type: "string", nullable: true },
    linked_to: { type: "string", nullable: true },
    repeat_interval: { type: "string", nullable: true },
    user: { type: "string" },
  };
}

function inviteProps() {
  return {
    id: { type: "string" },
    code: { type: "string", example: "123456" },
    used: { type: "boolean", default: false },
    used_by: { type: "string", nullable: true },
    used_at: { type: "string", format: "date-time", nullable: true },
    expires_at: { type: "string", format: "date-time" },
    user: { type: "string", description: "Creator user ID" },
  };
}

function aiConfigProps() {
  return {
    configured: { type: "boolean" },
    provider: { type: "string", example: "openai" },
    api_url: { type: "string", example: "https://api.openai.com/v1" },
    model: { type: "string", example: "gpt-4o-mini" },
    max_tokens: { type: "integer", default: 1024 },
    temperature: { type: "number", default: 0.7 },
    enabled: { type: "boolean", default: true },
  };
}

function settingsProps() {
  return {
    id: { type: "string" },
    user: { type: "string", description: "User ID" },
    sprint_duration: { type: "string", example: "2weeks" },
    sprint_start_day: { type: "integer", example: 1, description: "Day of week (0=Sun, 1=Mon)" },
    language: { type: "string", example: "en" },
    archive_retention_days: { type: "integer", default: 30 },
    auto_cleanup: { type: "boolean", default: false },
    theme: { type: "string", example: "light" },
    setup_complete: { type: "boolean", default: false },
  };
}

function externalRefProps() {
  return {
    id: { type: "string" },
    source: { type: "string", enum: ["paperless", "home_assistant", "gmail", "custom"], example: "paperless" },
    external_id: { type: "string", example: "42" },
    external_url: { type: "string", nullable: true, example: "https://paperless.example.com/documents/42/" },
    entity_type: { type: "string", enum: ["task", "grocery", "note"], example: "task" },
    entity_id: { type: "string", example: "abc123" },
    sync_status: { type: "string", enum: ["synced", "pending", "error", "orphaned"], example: "synced" },
    last_synced_at: { type: "string", format: "date-time", nullable: true },
    user: { type: "string" },
    created: { type: "string", format: "date-time" },
    updated: { type: "string", format: "date-time" },
  };
}

// ── Auth helpers ──

function authRequired() {
  return [{ bearerAuth: [] }, { cookieAuth: [] }];
}

function st() { return { type: "string" }; }
function sn() { return { type: "string", nullable: true }; }
function sb() { return { type: "boolean" }; }
function si() { return { type: "integer" }; }
function sa(items) { return { type: "array", items: items }; }

// ── Standard response helpers ──

function refSchema(ref) {
  return { "$ref": "#/components/schemas/" + ref };
}

function refArraySchema(ref) {
  return { type: "array", items: { "$ref": "#/components/schemas/" + ref } };
}

function resContent(ref) {
  return { "application/json": { schema: refSchema(ref) } };
}

function resArrayContent(ref) {
  return { "application/json": { schema: refArraySchema(ref) } };
}

function resDeleteContent() {
  return { "application/json": { schema: { type: "object", properties: { deleted: { type: "boolean", example: true } } } } };
}

function resSuccessContent() {
  return { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true } } } } };
}

function unauthorizedResponse() {
  return { description: "Unauthorized", content: { "application/json": { schema: { "$ref": "#/components/schemas/Error" } } } };
}

// ── Schema builders ──

function registerSchema() {
  return {
    tags: ["Auth"],
    summary: "Register user",
    description: "Creates a new user account. First user becomes admin without invite. Subsequent users require an invite code or bootstrap mode.",
    operationId: "registerUser",
    requestBody: {
      required: true,
      content: { "application/json": { schema: {
        type: "object",
        required: ["email", "password", "passwordConfirm"],
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" },
          password: { type: "string", minLength: 8, example: "securepass123" },
          passwordConfirm: { type: "string", example: "securepass123" },
          name: { type: "string", nullable: true, example: "Jane Doe" },
          family_name: { type: "string", nullable: true, example: "Doe Family" },
          invite_code: { type: "string", nullable: true, example: "123456" },
          user_type: { type: "string", enum: ["family_member", "family_assistant"], default: "family_member" },
        },
        example: {
          email: "user@example.com",
          password: "securepass123",
          passwordConfirm: "securepass123",
          name: "Jane Doe",
          family_name: "Doe Family",
          invite_code: "123456",
          user_type: "family_member",
        },
      } } },
    },
    responses: {
      "201": { description: "User created", content: { "application/json": { schema: { type: "object", properties: { user: { type: "object", properties: { id: st(), email: st(), name: st(), role: st(), family_id: sn() }, example: { id: "abc123", email: "user@example.com", name: "Jane Doe", role: "admin", family_id: null } }, token: { type: "string", description: "JWT auth token", example: "eyJhbGciOiJIUzI1NiIs..." } } } } } },
      "400": { description: "Validation error", content: { "application/json": { schema: { "$ref": "#/components/schemas/Error" } } } },
    },
  };
}

function validateInviteSchema() {
  return {
    tags: ["Auth", "Invites"],
    summary: "Validate invite code",
    description: "Public endpoint to check if an invite code is valid.",
    operationId: "validateInvite",
    parameters: [{ name: "code", in: "query", required: true, schema: { type: "string" }, example: "123456" }],
    responses: {
      "200": { description: "Invite status", content: { "application/json": { schema: { type: "object", properties: {
        status: { type: "string", enum: ["valid", "not_found", "used", "expired"] },
        message: st(),
        invite: { type: "object", properties: { id: st(), code: st(), created_by: st(), inviter: { type: "object", properties: { id: st(), name: st() } } } },
      }, example: { status: "valid", message: "Invite code is valid", invite: { id: "inv123", code: "123456", created_by: "usr456", inviter: { id: "usr456", name: "Jane" } } } } } } },
    },
  };
}

function unifiedApiSchema() {
  return {
    tags: ["Entries"],
    summary: "Unified action dispatcher",
    description: "Single endpoint for all entry (task+grocery) operations: list, create, update, complete, assign, delete, filters, set_role, set_user_block, delete_user.",
    operationId: "unifiedApi",
    requestBody: {
      required: true,
      content: { "application/json": { schema: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["list", "create", "update", "complete", "assign", "delete", "filters", "set_role", "set_user_block", "delete_user"] },
          type: { type: "string", enum: ["task", "grocery"] },
          id: { type: "string", description: "Entry ID (for update/delete/complete/assign)" },
          title: { type: "string", description: "Title (for create/update)" },
          status: { type: "string", description: "Status: todo/done/backlog/in_progress" },
          description: { type: "string", description: "Description" },
          assignee_id: { type: "string", description: "User ID to assign" },
          labels: { type: "array", items: { type: "string" } },
          shop_id: { type: "string", description: "Shop ID (grocery only)" },
          quantity: { type: "integer", description: "Quantity (grocery only)" },
          complete: { type: "boolean", description: "Mark as complete/incomplete" },
        },
        example: {
          action: "create",
          type: "task",
          title: "Buy groceries",
          description: "Weekly shopping",
          status: "todo",
          labels: ["shopping"],
          assignee_id: "usr123",
        },
      } } },
    },
    responses: {
      "200": { description: "Success", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, data: { type: "object" } } } } } },
      "201": { description: "Created", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, data: { type: "object" } } } } } },
      "400": { description: "Bad request", content: { "application/json": { schema: { "$ref": "#/components/schemas/Error" } } } },
      "401": { description: "Unauthorized", content: { "application/json": { schema: { "$ref": "#/components/schemas/Error" } } } },
    },
  };
}

function listEntriesSchema() {
  return {
    tags: ["Entries"],
    summary: "List unified entries",
    description: "Returns all tasks and groceries for the authenticated user's family, with optional filters.",
    operationId: "listEntries",
    parameters: filterParams(),
    security: authRequired(),
    responses: { "200": { description: "List of entries", content: { "application/json": { schema: { type: "array", items: { "$ref": "#/components/schemas/Entry" } } } } }, "401": unauthorizedResponse() },
  };
}

function filterParams() {
  return [
    { name: "type", in: "query", schema: { type: "string", enum: ["task", "grocery"] }, description: "Filter by entry type" },
    { name: "status", in: "query", schema: { type: "string" }, description: "Filter by status" },
    { name: "assignee_id", in: "query", schema: { type: "string" }, description: "Filter by assigned user" },
    { name: "label", in: "query", schema: { type: "string" }, description: "Filter by label name" },
    { name: "shop_id", in: "query", schema: { type: "string" }, description: "Filter by shop (grocery only)" },
  ];
}

function crudGetPost(pathSchema) {
  return pathSchema;
}

// ── Tasks ──

function listTasksSchema() {
  return {
    tags: ["Tasks"], summary: "List tasks", operationId: "listTasks",
    parameters: [
      { name: "sort", in: "query", schema: { type: "string", default: "-created" }, description: "Sort field (prefix with - for DESC)" },
      { name: "status", in: "query", schema: { type: "string" }, description: "Filter by status: todo/in_progress/done/backlog" },
    ],
    security: authRequired(),
    responses: { "200": { description: "List of tasks", content: { "application/json": { schema: { type: "array", items: { "$ref": "#/components/schemas/Task" } } } } }, "401": unauthorizedResponse() },
  };
}

function createTaskSchema() {
  return {
    tags: ["Tasks"], summary: "Create task", operationId: "createTask",
    requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: taskBodyProps(), example: { title: "Fix login bug", status: "todo", priority: "normal", horizon: "week", labels: ["bug"], is_private: false } } } } },
    security: authRequired(),
    responses: { "201": { description: "Task created", content: { "application/json": { schema: { "$ref": "#/components/schemas/Task" } } } }, "401": unauthorizedResponse() },
  };
}

function getTaskSchema() {
  return {
    tags: ["Tasks"], summary: "Get task", operationId: "getTask",
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    security: authRequired(),
    responses: { "200": { description: "Task", content: { "application/json": { schema: { "$ref": "#/components/schemas/Task" } } } }, "401": unauthorizedResponse(), "404": { description: "Not found" } },
  };
}

function updateTaskSchema() {
  return {
    tags: ["Tasks"], summary: "Update task", operationId: "updateTask",
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: taskBodyProps(), example: { status: "done", priority: "urgent" } } } } },
    security: authRequired(),
    responses: { "200": { description: "Task updated", content: { "application/json": { schema: { "$ref": "#/components/schemas/Task" } } } }, "401": unauthorizedResponse() },
  };
}

function deleteTaskSchema() {
  return {
    tags: ["Tasks"], summary: "Delete task", operationId: "deleteTask",
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    security: authRequired(),
    responses: { "200": { description: "Deleted", content: { "application/json": { schema: { type: "object", properties: { deleted: { type: "boolean", example: true } } } } } }, "401": unauthorizedResponse() },
  };
}

function taskBodyProps() {
  return {
    title: { type: "string", example: "Fix login bug" },
    status: { type: "string", enum: ["todo", "in_progress", "done", "backlog"], example: "todo" },
    blocked: { type: "boolean", default: false },
    blocked_comment: { type: "string", nullable: true },
    priority: { type: "string", enum: ["urgent", "normal", "low"], example: "normal" },
    horizon: { type: "string", enum: ["week", "month", "3months", "6months", "year"], example: "week" },
    assigned_to: { type: "string", nullable: true },
    sprint_id: { type: "string", nullable: true },
    due_date: { type: "string", format: "date", nullable: true },
    repeat_interval: { type: "string", nullable: true, example: "weekly" },
    completed_at: { type: "string", format: "date-time", nullable: true },
    labels: { type: "array", items: { type: "string" }, example: ["bug"] },
    is_private: { type: "boolean", default: false },
    archived: { type: "boolean", default: false },
    flag: { type: "boolean", default: false },
    linked_to: { type: "string", nullable: true },
    linked_type: { type: "string", nullable: true },
    linked_item_ids: { type: "array", items: { type: "string" } },
    linked_note_ids: { type: "array", items: { type: "string" } },
  };
}

// ── Task Actions ──

function archiveTaskSchema() {
  return {
    tags: ["Tasks"], summary: "Archive a task", operationId: "archiveTask",
    parameters: [
      { name: "id", in: "path", required: true, schema: { type: "string" } },
      { name: "retention", in: "query", schema: { type: "integer", default: 30, description: "Days before auto-delete (0 = never)" } },
    ],
    security: authRequired(),
    responses: { "200": { description: "Task archived", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, message: { type: "string", example: "Task archived" }, retention: { type: "integer", example: 30 } } } } } }, "401": unauthorizedResponse() },
  };
}

function archiveDoneTasksSchema() {
  return {
    tags: ["Tasks"], summary: "Archive all done tasks", operationId: "archiveDoneTasks",
    security: authRequired(),
    responses: { "200": { description: "Bulk archive result", content: { "application/json": { schema: { type: "object", properties: { archived: { type: "array", items: { type: "string" }, example: ["task1", "task2"] }, count: { type: "integer", example: 2 } } } } } }, "401": unauthorizedResponse() },
  };
}

function convertTaskToItemSchema() {
  return {
    tags: ["Tasks", "Items"], summary: "Convert task to grocery item", operationId: "convertTaskToItem",
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    security: authRequired(),
    responses: { "200": { description: "Converted", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string", example: "Task converted to item" }, item_id: { type: "string", example: "item123" } } } } } }, "401": unauthorizedResponse() },
  };
}

function uncheckAllTasksSchema() {
  return {
    tags: ["Tasks"], summary: "Reset all done tasks to todo", operationId: "uncheckAllTasks",
    security: authRequired(),
    responses: { "200": { description: "Reset result", content: { "application/json": { schema: { type: "object", properties: { updated: { type: "array", items: { type: "string" }, example: ["task1"] }, count: { type: "integer", example: 1 } } } } } }, "401": unauthorizedResponse() },
  };
}

function moveTaskSchema() {
  return {
    tags: ["Tasks"], summary: "Move task status", operationId: "moveTask",
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", enum: ["backlog", "todo", "done"] } }, example: { status: "done" } } } } },
    security: authRequired(),
    responses: { "200": { description: "Task moved", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, message: { type: "string", example: "Task moved to done" } } } } } }, "401": unauthorizedResponse() },
  };
}

// ── Items (Groceries) ──

function listItemsSchema() {
  return {
    tags: ["Items"], summary: "List grocery items", operationId: "listItems",
    parameters: [
      { name: "sort", in: "query", schema: { type: "string", default: "-created" }, description: "Sort field (prefix with - for DESC)" },
      { name: "completed", in: "query", schema: { type: "string", enum: ["true", "false"] }, description: "Filter by completion status" },
    ],
    security: authRequired(),
    responses: { "200": { description: "List of items", content: { "application/json": { schema: { type: "array", items: { "$ref": "#/components/schemas/Item" } } } } }, "401": unauthorizedResponse() },
  };
}

function createItemSchema() {
  return {
    tags: ["Items"], summary: "Create grocery item", operationId: "createItem",
    requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: {
      title: { type: "string", example: "Apples" }, completed: sb(), quantity: { type: "integer", default: 1 }, shop_id: sn(),
      priority: sn(), assigned_to: sn(), due_date: sn(),
      labels: { type: "array", items: { type: "string" }, example: ["fruits"] }, is_private: sb(),
    }, example: { title: "Apples", quantity: 3, shop_id: "shop123", labels: ["fruits"] } } } } },
    security: authRequired(),
    responses: { "201": { description: "Item created", content: { "application/json": { schema: { "$ref": "#/components/schemas/Item" } } } }, "401": unauthorizedResponse() },
  };
}

function getItemSchema() {
  return {
    tags: ["Items"], summary: "Get grocery item", operationId: "getItem",
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    security: authRequired(),
    responses: { "200": { description: "Item", content: { "application/json": { schema: { "$ref": "#/components/schemas/Item" } } } }, "401": unauthorizedResponse() },
  };
}

function updateItemSchema() {
  return {
    tags: ["Items"], summary: "Update grocery item", operationId: "updateItem",
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: {
      title: { type: "string", example: "Apples" }, completed: sb(), shop_id: sn(), quantity: si(),
      priority: sn(), assigned_to: sn(), due_date: sn(),
      labels: { type: "array", items: { type: "string" } }, is_private: sb(),
    }, example: { completed: true, quantity: 5 } } } } },
    security: authRequired(),
    responses: { "200": { description: "Item updated", content: { "application/json": { schema: { "$ref": "#/components/schemas/Item" } } } }, "401": unauthorizedResponse() },
  };
}

function deleteItemSchema() {
  return {
    tags: ["Items"], summary: "Delete grocery item", operationId: "deleteItem",
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    security: authRequired(),
    responses: { "200": { description: "Deleted", content: { "application/json": { schema: { type: "object", properties: { deleted: { type: "boolean", example: true } } } } } }, "401": unauthorizedResponse() },
  };
}

function convertItemToTaskSchema() {
  return {
    tags: ["Items", "Tasks"], summary: "Convert item to task", operationId: "convertItemToTask",
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    security: authRequired(),
    responses: { "200": { description: "Converted", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, message: { type: "string", example: "Item converted to task" }, task_id: { type: "string", example: "task123" } } } } } }, "401": unauthorizedResponse() },
  };
}

function uncheckAllItemsSchema() {
  return {
    tags: ["Items"], summary: "Reset all completed items to incomplete", operationId: "uncheckAllItems",
    security: authRequired(),
    responses: { "200": { description: "Reset result", content: { "application/json": { schema: { type: "object", properties: { updated: { type: "array", items: { type: "string" }, example: ["item1"] }, count: { type: "integer", example: 1 } } } } } }, "401": unauthorizedResponse() },
  };
}

// ── Calendar ──

function listCalendarEventsSchema() {
  return {
    tags: ["Calendar"], summary: "List calendar events", operationId: "listCalendarEvents",
    parameters: [
      { name: "sort", in: "query", schema: { type: "string", default: "start_time" }, description: "Sort field (prefix with - for DESC)" },
      { name: "start", in: "query", schema: { type: "string", format: "date-time", description: "Filter start time >= start" } },
      { name: "end", in: "query", schema: { type: "string", format: "date-time", description: "Filter end time <= end" } },
    ],
    security: authRequired(),
    responses: { "200": { description: "Calendar events", content: { "application/json": { schema: { type: "array", items: { "$ref": "#/components/schemas/CalendarEvent" } } } } }, "401": unauthorizedResponse() },
  };
}

function createCalendarEventSchema() {
  return {
    tags: ["Calendar"], summary: "Create calendar event", operationId: "createCalendarEvent",
    requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: {
      title: { type: "string", example: "Team standup" }, description: sn(), start_time: { type: "string", format: "date-time", example: "2024-01-15T09:00:00Z" }, end_time: sn(), all_day: sb(), task_id: sn(),
    }, example: { title: "Team standup", start_time: "2024-01-15T09:00:00Z", end_time: "2024-01-15T09:30:00Z", all_day: false } } } } },
    security: authRequired(),
    responses: { "201": { description: "Event created", content: { "application/json": { schema: { "$ref": "#/components/schemas/CalendarEvent" } } } }, "401": unauthorizedResponse() },
  };
}

function getCalendarEventSchema() {
  return {
    tags: ["Calendar"], summary: "Get calendar event", operationId: "getCalendarEvent",
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    security: authRequired(),
    responses: { "200": { description: "Calendar event", content: { "application/json": { schema: { "$ref": "#/components/schemas/CalendarEvent" } } } }, "401": unauthorizedResponse() },
  };
}

function updateCalendarEventSchema() {
  return {
    tags: ["Calendar"], summary: "Update calendar event", operationId: "updateCalendarEvent",
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: {
      title: { type: "string", example: "Team standup" }, description: sn(), start_time: sn(), end_time: sn(), all_day: sb(), task_id: sn(),
    }, example: { title: "Updated standup", start_time: "2024-01-15T10:00:00Z" } } } } },
    security: authRequired(),
    responses: { "200": { description: "Event updated", content: { "application/json": { schema: { "$ref": "#/components/schemas/CalendarEvent" } } } }, "401": unauthorizedResponse() },
  };
}

function deleteCalendarEventSchema() {
  return {
    tags: ["Calendar"], summary: "Delete calendar event", operationId: "deleteCalendarEvent",
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
    security: authRequired(),
    responses: { "200": { description: "Deleted", content: { "application/json": { schema: { type: "object", properties: { deleted: { type: "boolean", example: true } } } } } }, "401": unauthorizedResponse() },
  };
}

// ── Families ──

function listFamiliesSchema() { return { tags: ["Families"], summary: "List families", operationId: "listFamilies", security: authRequired(), responses: { "200": { description: "Families", content: resArrayContent("Family") }, "401": unauthorizedResponse() } }; }
function createFamilySchema() { return { tags: ["Families"], summary: "Create family", operationId: "createFamily", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { name: { type: "string", example: "My Family" } }, example: { name: "My Family" } } } } }, security: authRequired(), responses: { "201": { description: "Family created", content: resContent("Family") }, "401": unauthorizedResponse() } }; }
function getFamilySchema() { return { tags: ["Families"], summary: "Get family", operationId: "getFamily", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], security: authRequired(), responses: { "200": { description: "Family", content: resContent("Family") }, "401": unauthorizedResponse() } }; }
function joinFamilySchema() { return { tags: ["Families"], summary: "Join family", operationId: "joinFamily", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], security: authRequired(), responses: { "200": { description: "Joined", content: resSuccessContent() }, "401": unauthorizedResponse() } }; }
function leaveFamilySchema() { return { tags: ["Families"], summary: "Leave family", operationId: "leaveFamily", security: authRequired(), responses: { "200": { description: "Left family", content: resSuccessContent() }, "401": unauthorizedResponse() } }; }

// ── Goals ──

function listGoalsSchema() { return { tags: ["Goals"], summary: "List goals", operationId: "listGoals", parameters: [{ name: "sort", in: "query", schema: { type: "string", default: "-created" }, description: "Sort field (prefix with - for DESC)" }], security: authRequired(), responses: { "200": { description: "Goals", content: resArrayContent("Goal") }, "401": unauthorizedResponse() } }; }
function getGoalSchema() { return { tags: ["Goals"], summary: "Get goal", operationId: "getGoal", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], security: authRequired(), responses: { "200": { description: "Goal", content: resContent("Goal") }, "401": unauthorizedResponse() } }; }
function createGoalSchema() { return { tags: ["Goals"], summary: "Create goal", operationId: "createGoal", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { title: { type: "string", example: "Read 12 books" }, description: sn(), points_required: { type: "integer", example: 100 }, target_user: sn() }, example: { title: "Read 12 books", points_required: 100, target_user: "usr123" } } } } }, security: authRequired(), responses: { "201": { description: "Goal created", content: resContent("Goal") }, "401": unauthorizedResponse() } }; }
function updateGoalSchema() { return { tags: ["Goals"], summary: "Update goal", operationId: "updateGoal", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { title: { type: "string", example: "Read 12 books" }, description: sn(), points_required: { type: "integer", example: 100 }, points_current: { type: "integer", example: 50 }, target_user: sn(), completed: sb() }, example: { points_current: 50 } } } } }, security: authRequired(), responses: { "200": { description: "Goal updated", content: resContent("Goal") }, "401": unauthorizedResponse() } }; }
function deleteGoalSchema() { return { tags: ["Goals"], summary: "Delete goal", operationId: "deleteGoal", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], security: authRequired(), responses: { "200": { description: "Deleted", content: resDeleteContent() }, "401": unauthorizedResponse() } }; }

// ── Invites ──

function listInvitesSchema() { return { tags: ["Invites"], summary: "List invite codes", operationId: "listInvites", parameters: [{ name: "sort", in: "query", schema: { type: "string", default: "-created" }, description: "Sort field (prefix with - for DESC)" }], security: authRequired(), responses: { "200": { description: "Invites", content: resArrayContent("Invite") }, "401": unauthorizedResponse() } }; }
function getInviteSchema() { return { tags: ["Invites"], summary: "Get invite code", operationId: "getInvite", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], security: authRequired(), responses: { "200": { description: "Invite", content: resContent("Invite") }, "401": unauthorizedResponse() } }; }
function createInviteSchema() { return { tags: ["Invites"], summary: "Create invite code", operationId: "createInvite", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { code: { type: "string", example: "123456" }, expires_at: { type: "string", format: "date-time", nullable: true } }, example: { code: "123456", expires_at: "2024-12-31T23:59:59Z" } } } } }, security: authRequired(), responses: { "201": { description: "Invite created", content: resContent("Invite") }, "401": unauthorizedResponse() } }; }
function deleteInviteSchema() { return { tags: ["Invites"], summary: "Delete invite code", operationId: "deleteInvite", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], security: authRequired(), responses: { "200": { description: "Deleted", content: resDeleteContent() }, "401": unauthorizedResponse() } }; }
function createInviteServerSideSchema() { return { tags: ["Invites"], summary: "Create invite code (server-side)", operationId: "createInviteServerSide", description: "Generates a unique 6-digit code with 24h expiry via server-side logic.", security: authRequired(), responses: { "201": { description: "Invite created", content: resContent("Invite") }, "401": unauthorizedResponse() } }; }
function generateInviteSchema() { return { tags: ["Invites"], summary: "Generate random invite code", operationId: "generateInvite", description: "Generates a random 6-digit code with 1h expiry.", security: authRequired(), responses: { "201": { description: "Invite generated", content: resContent("Invite") }, "401": unauthorizedResponse() } }; }
function useInviteSchema() { return { tags: ["Invites"], summary: "Use/mark invite as used", operationId: "useInvite", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], security: authRequired(), responses: { "200": { description: "Invite marked used", content: resContent("Invite") }, "409": { description: "Already used", content: { "application/json": { schema: { type: "object", properties: { error: { type: "string", example: "Invite already used" } } } } } }, "410": { description: "Expired", content: { "application/json": { schema: { type: "object", properties: { error: { type: "string", example: "Invite expired" } } } } } }, "401": unauthorizedResponse() } }; }

// ── Labels ──

function listLabelsSchema() { return { tags: ["Labels"], summary: "List labels", operationId: "listLabels", parameters: [{ name: "sort", in: "query", schema: { type: "string", default: "name" }, description: "Sort field (prefix with - for DESC)" }], security: authRequired(), responses: { "200": { description: "Labels", content: resArrayContent("Label") }, "401": unauthorizedResponse() } }; }
function getLabelSchema() { return { tags: ["Labels"], summary: "Get label", operationId: "getLabel", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], security: authRequired(), responses: { "200": { description: "Label", content: resContent("Label") }, "401": unauthorizedResponse() } }; }
function createLabelSchema() { return { tags: ["Labels"], summary: "Create label", operationId: "createLabel", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { name: { type: "string", example: "shopping" }, color: { type: "string", default: "#6366f1", example: "#6366f1" }, is_private: sb() }, example: { name: "shopping", color: "#6366f1", is_private: false } } } } }, security: authRequired(), responses: { "201": { description: "Label created", content: resContent("Label") }, "401": unauthorizedResponse() } }; }
function updateLabelSchema() { return { tags: ["Labels"], summary: "Update label", operationId: "updateLabel", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { name: { type: "string", example: "shopping" }, color: { type: "string", default: "#6366f1", example: "#6366f1" }, is_private: sb() }, example: { color: "#ef4444" } } } } }, security: authRequired(), responses: { "200": { description: "Label updated", content: resContent("Label") }, "401": unauthorizedResponse() } }; }
function deleteLabelSchema() { return { tags: ["Labels"], summary: "Delete label", operationId: "deleteLabel", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], security: authRequired(), responses: { "200": { description: "Deleted", content: resDeleteContent() }, "401": unauthorizedResponse() } }; }

// ── Notes ──

function listNotesSchema() { return { tags: ["Notes"], summary: "List notes", operationId: "listNotes", parameters: [{ name: "sort", in: "query", schema: { type: "string", default: "-created" }, description: "Sort field (prefix with - for DESC)" }], security: authRequired(), responses: { "200": { description: "Notes", content: resArrayContent("Note") }, "401": unauthorizedResponse() } }; }
function getNoteSchema() { return { tags: ["Notes"], summary: "Get note", operationId: "getNote", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], security: authRequired(), responses: { "200": { description: "Note", content: resContent("Note") }, "401": unauthorizedResponse() } }; }
function createNoteSchema() { return { tags: ["Notes"], summary: "Create note", operationId: "createNote", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { title: { type: "string", nullable: true, example: "Meeting notes" }, content: { type: "string", example: "# Notes\nAction items..." }, pinned: sb(), labels: { type: "array", items: { type: "string" }, example: ["meeting"] }, linked_type: sn(), linked_to: sn() }, example: { title: "Meeting notes", content: "# Notes\nAction items...", pinned: true, labels: ["meeting"] } } } } }, security: authRequired(), responses: { "201": { description: "Note created", content: resContent("Note") }, "401": unauthorizedResponse() } }; }
function updateNoteSchema() { return { tags: ["Notes"], summary: "Update note", operationId: "updateNote", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { title: { type: "string", nullable: true, example: "Meeting notes" }, content: { type: "string", example: "# Notes\nAction items..." }, pinned: sb(), labels: { type: "array", items: { type: "string" } }, linked_type: sn(), linked_to: sn() }, example: { content: "Updated notes content" } } } } }, security: authRequired(), responses: { "200": { description: "Note updated", content: resContent("Note") }, "401": unauthorizedResponse() } }; }
function deleteNoteSchema() { return { tags: ["Notes"], summary: "Delete note", operationId: "deleteNote", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], security: authRequired(), responses: { "200": { description: "Deleted", content: resDeleteContent() }, "401": unauthorizedResponse() } }; }

// ── Paperless ──

function paperlessWebhookSchema() {
  return {
    tags: ["Paperless"], summary: "Paperless webhook handler", operationId: "paperlessWebhook",
    description: "Receives Paperless-ngx document creation webhooks. Validates secret via X-Paperless-Webhook-Secret or Authorization header. Creates a task for documents tagged 'todo'.",
    requestBody: {
      required: true,
      content: { "application/json": { schema: {
        type: "object",
        properties: {
          document_id: { type: "integer", description: "Paperless document ID", example: 42 },
          title: { type: "string", description: "Document title", example: "Invoice from ACME Corp" },
          correspondent: { type: "string", nullable: true, example: "ACME Corp" },
          document_type: { type: "string", nullable: true, example: "Invoice" },
          tags: { type: "array", items: { type: "string" }, example: ["todo", "finance"] },
          created: { type: "string", format: "date-time", example: "2024-01-15T10:30:00Z" },
        },
        required: ["document_id"],
        example: {
          document_id: 42,
          title: "Invoice from ACME Corp",
          correspondent: "ACME Corp",
          document_type: "Invoice",
          tags: ["todo", "finance"],
          created: "2024-01-15T10:30:00Z",
        },
      } } },
    },
    security: [],
    responses: {
      "201": { description: "Task created", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, task_id: { type: "string", example: "task123" }, message: { type: "string", example: "Task created from document #42" } } } } } },
      "401": { description: "Invalid secret", content: { "application/json": { schema: { type: "object", properties: { error: { type: "string", example: "Invalid webhook secret" } } } } } },
      "400": { description: "Missing document_id", content: { "application/json": { schema: { type: "object", properties: { error: { type: "string", example: "Missing document_id" } } } } } },
    },
  };
}
function paperlessPollSchema() { return { tags: ["Paperless"], summary: "Poll Paperless for new docs", operationId: "paperlessPoll", description: "Fetches unprocessed documents from Paperless with the configured todo tag.", security: authRequired(), responses: { "200": { description: "Documents list", content: { "application/json": { schema: { type: "object", properties: { documents: { type: "array", items: { type: "object" } }, count: { type: "integer", example: 3 } } } } } }, "401": unauthorizedResponse() } }; }
function paperlessTestSchema() { return { tags: ["Paperless"], summary: "Test Paperless connection", operationId: "paperlessTest", security: authRequired(), responses: { "200": { description: "Connection status", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, message: { type: "string", example: "Connection successful" } } } } } }, "401": unauthorizedResponse() } }; }
function paperlessConfigSchema() { return { tags: ["Paperless"], summary: "Configure Paperless integration", operationId: "paperlessConfig", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { api_url: { type: "string", example: "https://paperless.example.com" }, api_key: { type: "string", example: "abc123..." }, todo_tag: { type: "string", default: "todo", example: "todo" }, enabled: sb() }, example: { api_url: "https://paperless.example.com", api_key: "abc123...", todo_tag: "todo", enabled: true } } } } }, security: authRequired(), responses: { "200": { description: "Updated", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, message: { type: "string", example: "Configuration updated" } } } } } }, "201": { description: "Created", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean", example: true }, message: { type: "string", example: "Configuration created" } } } } } }, "401": unauthorizedResponse() } }; }
function paperlessSyncSchema() { return { tags: ["Paperless"], summary: "Manual sync Paperless documents", operationId: "paperlessSync", description: "Triggers a full sync: scans recent Paperless docs with todo tag and creates tasks.", security: authRequired(), responses: { "200": { description: "Sync result", content: { "application/json": { schema: { type: "object", properties: { synced: { type: "integer", example: 5 }, errors: { type: "array", items: { type: "string" } }, message: { type: "string", example: "Synced 5 documents" } } } } } }, "401": unauthorizedResponse() } }; }

// ── Projects ──

function listProjectsSchema() { return { tags: ["Projects"], summary: "List projects", operationId: "listProjects", parameters: [{ name: "sort", in: "query", schema: { type: "string", default: "-created" }, description: "Sort field (prefix with - for DESC)" }, { name: "status", in: "query", schema: { type: "string" }, description: "Filter by status: active/completed/archived" }], security: authRequired(), responses: { "200": { description: "Projects", content: resArrayContent("Project") }, "401": unauthorizedResponse() } }; }
function getProjectSchema() { return { tags: ["Projects"], summary: "Get project", operationId: "getProject", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], security: authRequired(), responses: { "200": { description: "Project", content: resContent("Project") }, "401": unauthorizedResponse() } }; }
function createProjectSchema() { return { tags: ["Projects"], summary: "Create project", operationId: "createProject", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { title: { type: "string", example: "Home renovation" }, description: sn(), color: { type: "string", default: "#6366f1", example: "#6366f1" }, status: { type: "string", enum: ["active", "completed", "archived"], example: "active" }, task_ids: { type: "array", items: { type: "string" } }, due_date: { type: "string", format: "date", nullable: true } }, example: { title: "Home renovation", description: "Kitchen and bathroom", color: "#6366f1", status: "active" } } } } }, security: authRequired(), responses: { "201": { description: "Project created", content: resContent("Project") }, "401": unauthorizedResponse() } }; }
function updateProjectSchema() { return { tags: ["Projects"], summary: "Update project", operationId: "updateProject", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { title: { type: "string" }, description: sn(), color: { type: "string", default: "#6366f1" }, status: { type: "string", enum: ["active", "completed", "archived"] }, task_ids: { type: "array", items: { type: "string" } }, due_date: sn() }, example: { status: "completed" } } } } }, security: authRequired(), responses: { "200": { description: "Project updated", content: resContent("Project") }, "401": unauthorizedResponse() } }; }
function deleteProjectSchema() { return { tags: ["Projects"], summary: "Delete project", operationId: "deleteProject", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], security: authRequired(), responses: { "200": { description: "Deleted", content: resDeleteContent() }, "401": unauthorizedResponse() } }; }

// ── Reminders ──

function listRemindersSchema() { return { tags: ["Reminders"], summary: "List reminders", operationId: "listReminders", parameters: [
  { name: "sort", in: "query", schema: { type: "string", default: "reminder_time" }, description: "Sort field (prefix with - for DESC)" },
  { name: "include_fired", in: "query", schema: { type: "string", enum: ["true"], description: "Include fired/dismissed reminders" } },
], security: authRequired(), responses: { "200": { description: "Reminders", content: resArrayContent("Reminder") }, "401": unauthorizedResponse() } }; }
function createReminderSchema() { return { tags: ["Reminders"], summary: "Create reminder", operationId: "createReminder", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { title: { type: "string", example: "Doctor appointment" }, message: sn(), reminder_time: { type: "string", format: "date-time", example: "2024-01-20T14:00:00Z" }, linked_type: sn(), linked_to: sn(), repeat_interval: sn() }, example: { title: "Doctor appointment", reminder_time: "2024-01-20T14:00:00Z", repeat_interval: "monthly" } } } } }, security: authRequired(), responses: { "201": { description: "Reminder created", content: resContent("Reminder") }, "401": unauthorizedResponse() } }; }
function updateReminderSchema() { return { tags: ["Reminders"], summary: "Update reminder", operationId: "updateReminder", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { title: { type: "string", example: "Doctor appointment" }, message: sn(), reminder_time: { type: "string", format: "date-time" }, linked_type: sn(), linked_to: sn(), repeat_interval: sn() }, example: { reminder_time: "2024-01-21T10:00:00Z" } } } } }, security: authRequired(), responses: { "200": { description: "Reminder updated", content: resContent("Reminder") }, "401": unauthorizedResponse() } }; }
function deleteReminderSchema() { return { tags: ["Reminders"], summary: "Delete reminder", operationId: "deleteReminder", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], security: authRequired(), responses: { "200": { description: "Deleted", content: resDeleteContent() }, "401": unauthorizedResponse() } }; }

// ── Rewards ──

function listRewardsSchema() { return { tags: ["Rewards"], summary: "List rewards", operationId: "listRewards", security: authRequired(), responses: { "200": { description: "Rewards", content: resArrayContent("Reward") }, "401": unauthorizedResponse() } }; }
function getRewardSchema() { return { tags: ["Rewards"], summary: "Get reward", operationId: "getReward", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], security: authRequired(), responses: { "200": { description: "Reward", content: resContent("Reward") }, "401": unauthorizedResponse() } }; }
function createRewardSchema() { return { tags: ["Rewards"], summary: "Create reward", operationId: "createReward", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { title: { type: "string", example: "Star sticker" }, points: { type: "integer", default: 0, example: 10 }, earned_by: sn(), reason: sn(), task_id: sn() }, example: { title: "Star sticker", points: 10, earned_by: "usr123", reason: "Completed all tasks" } } } } }, security: authRequired(), responses: { "201": { description: "Reward created", content: resContent("Reward") }, "401": unauthorizedResponse() } }; }
function deleteRewardSchema() { return { tags: ["Rewards"], summary: "Delete reward", operationId: "deleteReward", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], security: authRequired(), responses: { "200": { description: "Deleted", content: resDeleteContent() }, "401": unauthorizedResponse() } }; }

// ── Settings ──

function getSettingsSchema() { return { tags: ["Settings"], summary: "Get user settings", operationId: "getSettings", security: authRequired(), responses: { "200": { description: "Settings", content: resContent("Settings") }, "401": unauthorizedResponse() } }; }
function updateSettingsSchema() { return { tags: ["Settings"], summary: "Update user settings", operationId: "updateSettings", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { sprint_duration: { type: "string", example: "2weeks" }, sprint_start_day: { type: "integer", example: 1 }, language: { type: "string", example: "en" }, archive_retention_days: { type: "integer", example: 30 }, auto_cleanup: sb(), theme: { type: "string", example: "light" }, setup_complete: sb() }, example: { sprint_duration: "2weeks", language: "en", theme: "dark" } } } } }, security: authRequired(), responses: { "200": { description: "Settings updated", content: resContent("Settings") }, "401": unauthorizedResponse() } }; }

// ── Shared Views ──

function sharedTasksSchema() { return { tags: ["Shared"], summary: "List shared (non-private) tasks", operationId: "sharedTasks", security: authRequired(), responses: { "200": { description: "Shared tasks", content: resArrayContent("Task") }, "401": unauthorizedResponse() } }; }
function sharedItemsSchema() { return { tags: ["Shared"], summary: "List shared (non-private) items", operationId: "sharedItems", security: authRequired(), responses: { "200": { description: "Shared items", content: resArrayContent("Item") }, "401": unauthorizedResponse() } }; }
function sharedNotesSchema() { return { tags: ["Shared"], summary: "List shared (non-private) notes", operationId: "sharedNotes", security: authRequired(), responses: { "200": { description: "Shared notes", content: resArrayContent("Note") }, "401": unauthorizedResponse() } }; }

// ── Shops ──

function listShopsSchema() { return { tags: ["Shops"], summary: "List shops", operationId: "listShops", security: authRequired(), responses: { "200": { description: "Shops", content: resArrayContent("Shop") }, "401": unauthorizedResponse() } }; }
function getShopSchema() { return { tags: ["Shops"], summary: "Get shop", operationId: "getShop", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], security: authRequired(), responses: { "200": { description: "Shop", content: resContent("Shop") }, "401": unauthorizedResponse() } }; }
function createShopSchema() { return { tags: ["Shops"], summary: "Create shop", operationId: "createShop", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { name: { type: "string", example: "Supermarket" }, color: { type: "string", default: "#6366f1", example: "#6366f1" } }, example: { name: "Supermarket", color: "#6366f1" } } } } }, security: authRequired(), responses: { "201": { description: "Shop created", content: resContent("Shop") }, "401": unauthorizedResponse() } }; }
function updateShopSchema() { return { tags: ["Shops"], summary: "Update shop", operationId: "updateShop", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { name: { type: "string", example: "Supermarket" }, color: { type: "string", default: "#6366f1", example: "#6366f1" } }, example: { name: "Farmers Market" } } } } }, security: authRequired(), responses: { "200": { description: "Shop updated", content: resContent("Shop") }, "401": unauthorizedResponse() } }; }
function deleteShopSchema() { return { tags: ["Shops"], summary: "Delete shop", operationId: "deleteShop", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], security: authRequired(), responses: { "200": { description: "Deleted", content: resDeleteContent() }, "401": unauthorizedResponse() } }; }

// ── Sprints ──

function listSprintsSchema() { return { tags: ["Sprints"], summary: "List sprints", operationId: "listSprints", parameters: [{ name: "sort", in: "query", schema: { type: "string", default: "-start_date" }, description: "Sort field (prefix with - for DESC)" }], security: authRequired(), responses: { "200": { description: "Sprints", content: resArrayContent("Sprint") }, "401": unauthorizedResponse() } }; }
function getSprintSchema() { return { tags: ["Sprints"], summary: "Get sprint", operationId: "getSprint", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], security: authRequired(), responses: { "200": { description: "Sprint", content: resContent("Sprint") }, "401": unauthorizedResponse() } }; }
function createSprintSchema() { return { tags: ["Sprints"], summary: "Create sprint", operationId: "createSprint", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { name: { type: "string", example: "Sprint 5" }, duration: { type: "string", example: "2weeks" }, start_date: { type: "string", format: "date", nullable: true }, end_date: { type: "string", format: "date", nullable: true } }, example: { name: "Sprint 5", duration: "2weeks" } } } } }, security: authRequired(), responses: { "201": { description: "Sprint created", content: resContent("Sprint") }, "401": unauthorizedResponse() } }; }
function updateSprintSchema() { return { tags: ["Sprints"], summary: "Update sprint", operationId: "updateSprint", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { name: { type: "string", example: "Sprint 5" }, duration: { type: "string", example: "2weeks" }, start_date: { type: "string", format: "date", nullable: true }, end_date: { type: "string", format: "date", nullable: true } }, example: { name: "Sprint 6" } } } } }, security: authRequired(), responses: { "200": { description: "Sprint updated", content: resContent("Sprint") }, "401": unauthorizedResponse() } }; }
function deleteSprintSchema() { return { tags: ["Sprints"], summary: "Delete sprint", operationId: "deleteSprint", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], security: authRequired(), responses: { "200": { description: "Deleted", content: resDeleteContent() }, "401": unauthorizedResponse() } }; }
function newSprintSchema() { return { tags: ["Sprints"], summary: "Create new sprint from settings", operationId: "newSprint", description: "Creates a new sprint based on user's sprint_duration and sprint_start_day settings.", security: authRequired(), responses: { "201": { description: "Sprint created", content: resContent("Sprint") }, "401": unauthorizedResponse() } }; }
function archiveSprintTasksSchema() { return { tags: ["Sprints"], summary: "Archive all done tasks in sprint", operationId: "archiveSprintTasks", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "Sprint ID" }], security: authRequired(), responses: { "200": { description: "Archived", content: { "application/json": { schema: { type: "object", properties: { archived: { type: "array", items: { type: "string" }, example: ["task1", "task2"] }, count: { type: "integer", example: 2 } } } } } }, "401": unauthorizedResponse() } }; }

// ── Users ──

function listUsersSchema() { return { tags: ["Users"], summary: "List users", operationId: "listUsers", security: authRequired(), responses: { "200": { description: "Users list", content: resArrayContent("User") }, "401": unauthorizedResponse() } }; }
function getUserSchema() { return { tags: ["Users"], summary: "Get user", operationId: "getUser", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], security: authRequired(), responses: { "200": { description: "User", content: resContent("User") }, "401": unauthorizedResponse() } }; }
function updateUserSchema() { return { tags: ["Users"], summary: "Update user", operationId: "updateUser", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { name: { type: "string", example: "Jane Doe" }, avatar: sn(), role: { type: "string", enum: ["admin", "user", "assistant", "child"] }, family_id: sn(), password: { type: "string", minLength: 8 } }, example: { name: "Jane Doe", role: "admin" } } } } }, security: authRequired(), responses: { "200": { description: "User updated", content: resContent("User") }, "401": unauthorizedResponse() } }; }

// ── AI ──

function getAiConfigSchema() { return { tags: ["AI"], summary: "Get AI config", operationId: "getAiConfig", security: authRequired(), responses: { "200": { description: "AI config", content: { "application/json": { schema: { "$ref": "#/components/schemas/AiConfig" } } } }, "401": unauthorizedResponse() } }; }
function configureAiSchema() { return { tags: ["AI"], summary: "Configure AI assistant", operationId: "configureAi", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { provider: { type: "string", example: "openai" }, api_url: { type: "string", example: "https://api.openai.com/v1" }, api_key: { type: "string", example: "sk-..." }, model: { type: "string", default: "gpt-4o-mini", example: "gpt-4o-mini" }, max_tokens: { type: "integer", default: 1024, example: 2048 }, temperature: { type: "number", default: 0.7, example: 0.8 }, enabled: sb() }, example: { provider: "openai", api_url: "https://api.openai.com/v1", api_key: "sk-...", model: "gpt-4o-mini", max_tokens: 2048, temperature: 0.8, enabled: true } } } } }, security: authRequired(), responses: { "200": { description: "Updated", content: resContent("AiConfig") }, "201": { description: "Created", content: resContent("AiConfig") }, "401": unauthorizedResponse() } }; }
function aiCategorizeSchema() { return { tags: ["AI"], summary: "Categorize a task using AI", operationId: "aiCategorize", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { title: { type: "string", example: "Buy milk at supermarket" }, description: sn() }, example: { title: "Buy milk at supermarket", description: "2% organic" } } } } }, security: authRequired(), responses: { "200": { description: "Categorization result", content: { "application/json": { schema: { type: "object", properties: { labels: { type: "array", items: { type: "string" }, example: ["shopping"] }, priority: { type: "string", example: "normal" }, horizon: { type: "string", example: "week" } } } } } }, "401": unauthorizedResponse() } }; }
function aiSuggestSchema() { return { tags: ["AI"], summary: "Get task suggestions from AI", operationId: "aiSuggest", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { context: { type: "string", nullable: true, example: "I need to organize my week" }, count: { type: "integer", default: 5, example: 3 } }, example: { context: "I need to organize my week", count: 3 } } } } }, security: authRequired(), responses: { "200": { description: "Suggestions", content: { "application/json": { schema: { type: "object", properties: { suggestions: { type: "array", items: { type: "object", properties: { title: st(), description: sn(), priority: st(), horizon: st() } }, example: [{ title: "Plan meals for the week", priority: "normal", horizon: "week" }, { title: "Schedule dentist appointment", priority: "urgent", horizon: "month" }] } } } } } }, "401": unauthorizedResponse() } }; }
function aiChatSchema() { return { tags: ["AI"], summary: "Chat with AI about tasks", operationId: "aiChat", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { message: { type: "string", example: "What tasks are due today?" } }, example: { message: "What tasks are due today?" } } } } }, security: authRequired(), responses: { "200": { description: "AI response", content: { "application/json": { schema: { type: "object", properties: { response: { type: "string", example: "You have 3 tasks due today: ..." } } } } } }, "401": unauthorizedResponse() } } };

// ── External References ──

function listExternalRefsSchema() { return { tags: ["External References"], summary: "List external references", operationId: "listExternalRefs", description: "List external system links (Paperless, Home Assistant, Gmail, custom). Filters: source, sync_status, entity_type.", parameters: [
  { name: "source", in: "query", schema: { type: "string" }, description: "Filter by source: paperless/home_assistant/gmail/custom" },
  { name: "sync_status", in: "query", schema: { type: "string", enum: ["synced", "pending", "error", "orphaned"] }, description: "Filter by sync status" },
  { name: "entity_type", in: "query", schema: { type: "string", enum: ["task", "grocery", "note"] }, description: "Filter by entity type" },
  { name: "sort", in: "query", schema: { type: "string", default: "-created" }, description: "Sort field (prefix with - for DESC)" },
], security: authRequired(), responses: { "200": { description: "List of external references", content: resArrayContent("ExternalRef") }, "401": unauthorizedResponse() } }; }
function createExternalRefSchema() { return { tags: ["External References"], summary: "Create external reference", operationId: "createExternalRef", description: "Links a TodoLess entity to an external system entity. Checks for duplicate (source + external_id).", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: {
  source: { type: "string", enum: ["paperless", "home_assistant", "gmail", "custom"], example: "paperless" },
  external_id: { type: "string", example: "42" }, external_url: { type: "string", nullable: true, example: "https://paperless.example.com/documents/42/" },
  entity_type: { type: "string", enum: ["task", "grocery", "note"], example: "task" },
  entity_id: { type: "string", example: "abc123" }, sync_status: { type: "string", default: "pending", example: "pending" },
  last_synced_at: { type: "string", format: "date-time", nullable: true },
}, required: ["source", "external_id", "entity_type", "entity_id"], example: { source: "paperless", external_id: "42", entity_type: "task", entity_id: "abc123", sync_status: "pending" } } } } }, security: authRequired(), responses: { "201": { description: "External reference created", content: resContent("ExternalRef") }, "409": { description: "Duplicate reference exists", content: { "application/json": { schema: { type: "object", properties: { error: { type: "string", example: "Reference already exists for this source + external_id" } } } } } }, "401": unauthorizedResponse() } }; }
function getExternalRefSchema() { return { tags: ["External References"], summary: "Get external reference", operationId: "getExternalRef", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], security: authRequired(), responses: { "200": { description: "External reference", content: resContent("ExternalRef") }, "401": unauthorizedResponse() } }; }
function updateExternalRefSchema() { return { tags: ["External References"], summary: "Update external reference", operationId: "updateExternalRef", description: "Update sync state, URL, or linked entity. Primary use: update sync_status after integration completes.", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: {
  sync_status: { type: "string", enum: ["synced", "pending", "error", "orphaned"], example: "synced" },
  last_synced_at: { type: "string", format: "date-time", nullable: true }, external_url: sn(), entity_type: sn(), entity_id: sn(),
}, example: { sync_status: "synced", last_synced_at: "2024-01-15T12:00:00Z" } } } } }, security: authRequired(), responses: { "200": { description: "External reference updated", content: resContent("ExternalRef") }, "401": unauthorizedResponse() } }; }
function deleteExternalRefSchema() { return { tags: ["External References"], summary: "Delete external reference", operationId: "deleteExternalRef", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], security: authRequired(), responses: { "200": { description: "Deleted", content: resDeleteContent() }, "401": unauthorizedResponse() } } };
