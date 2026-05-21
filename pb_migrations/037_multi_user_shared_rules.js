migrate(
  (app) => {
    const familyRule = 'user = @request.auth.id || (is_private = false && user.family_id = @request.auth.family_id)';

    // Tasks: allow family members to edit non-private tasks
    let tasks = app.findCollectionByNameOrId('tasks');
    tasks.updateRule = familyRule;
    tasks.deleteRule = familyRule;
    app.save(tasks);

    // Items: allow family members to edit non-private items
    let items = app.findCollectionByNameOrId('items');
    items.updateRule = familyRule;
    items.deleteRule = familyRule;
    app.save(items);
  },
  (app) => {
    // Revert to owner-only rules
    const ownerRule = 'user = @request.auth.id';

    let tasks = app.findCollectionByNameOrId('tasks');
    tasks.updateRule = ownerRule;
    tasks.deleteRule = ownerRule;
    app.save(tasks);

    let items = app.findCollectionByNameOrId('items');
    items.updateRule = ownerRule;
    items.deleteRule = ownerRule;
    app.save(items);
  },
);
