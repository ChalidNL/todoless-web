// pb_hooks/routes/reminders.js
// REST API endpoints for reminders collection

routerAdd(
  'GET',
  '/api/todoless/reminders',
  (c) => {
    const authRecord = c.get('authRecord');
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' });
    }

    const userId = authRecord.id;
    const familyId = authRecord.get('family_id');

    let filter = '';
    if (familyId) {
      filter = 'user.family_id = "' + familyId + '"';
    } else {
      filter = 'user.id = "' + userId + '"';
    }

    const sort = $request.queryParam('sort') || 'reminder_time';
    const includeFired = $request.queryParam('include_fired') === 'true';

    if (!includeFired) {
      filter += ' && fired = false && dismissed = false';
    }

    const result = $app.dao().findRecordsByFilter('reminders', filter, sort, 0, 0);
    return c.json(200, result);
  },
  $apis.requireRecordAuth()
);

routerAdd(
  'POST',
  '/api/todoless/reminders',
  (c) => {
    const authRecord = c.get('authRecord');
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' });
    }

    const body = $request.body();
    const collection = $app.dao().findCollectionByNameOrId('reminders');
    const record = new Record(collection);

    const data = new RecordUpsertAction($app, record)
      .loadRequest(body)
      .set('user', authRecord.id)
      .set('title', body.get('title') || '')
      .set('reminder_time', body.get('reminder_time') || '')
      .set('fired', false)
      .set('dismissed', false);

    if (body.has('message')) data.set('message', body.get('message'));
    if (body.has('linked_type')) data.set('linked_type', body.get('linked_type'));
    if (body.has('linked_to')) data.set('linked_to', body.get('linked_to'));
    if (body.has('repeat_interval')) data.set('repeat_interval', body.get('repeat_interval'));

    data.submit();

    return c.json(201, record);
  },
  $apis.requireRecordAuth()
);

routerAdd(
  'PATCH',
  '/api/todoless/reminders/:id',
  (c) => {
    const authRecord = c.get('authRecord');
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' });
    }

    const id = c.pathParam('id');
    const record = $app.dao().findRecordById('reminders', id);
    if (!record) {
      return c.json(404, { 'error': 'Reminder not found' });
    }

    if (record.get('user') !== authRecord.id) {
      return c.json(403, { 'error': 'Forbidden' });
    }

    const body = $request.body();
    const data = new RecordUpsertAction($app, record).loadRequest(body);

    if (body.has('title')) data.set('title', body.get('title'));
    if (body.has('message')) data.set('message', body.get('message'));
    if (body.has('reminder_time')) data.set('reminder_time', body.get('reminder_time'));
    if (body.has('fired')) data.set('fired', body.get('fired'));
    if (body.has('dismissed')) data.set('dismissed', body.get('dismissed'));
    if (body.has('linked_type')) data.set('linked_type', body.get('linked_type'));
    if (body.has('linked_to')) data.set('linked_to', body.get('linked_to'));
    if (body.has('repeat_interval')) data.set('repeat_interval', body.get('repeat_interval'));

    data.submit();

    return c.json(200, record);
  },
  $apis.requireRecordAuth()
);

routerAdd(
  'DELETE',
  '/api/todoless/reminders/:id',
  (c) => {
    const authRecord = c.get('authRecord');
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' });
    }

    const id = c.pathParam('id');
    const record = $app.dao().findRecordById('reminders', id);
    if (!record) {
      return c.json(404, { 'error': 'Reminder not found' });
    }

    if (record.get('user') !== authRecord.id) {
      return c.json(403, { 'error': 'Forbidden' });
    }

    $app.dao().deleteRecord(record);
    return c.json(200, { 'deleted': true });
  },
  $apis.requireRecordAuth()
);
