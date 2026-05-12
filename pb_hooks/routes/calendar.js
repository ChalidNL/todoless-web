// pb_hooks/routes/calendar.js
// REST API endpoints for calendar_events collection

routerAdd(
  'GET',
  '/api/todoless/calendar',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const userId = authRecord.id
    const filter = 'user.id = "' + userId + '"'
    const sort = $request.queryParam('sort') || 'start_time'

    const start = $request.queryParam('start')
    const end = $request.queryParam('end')
    if (start && end) {
      filter += ' && start_time >= "' + start + '" && end_time <= "' + end + '"'
    }

    const result = $app.dao().findRecordsByFilter('calendar_events', filter, sort, 0, 0)
    return c.json(200, result)
  },
  $apis.requireRecordAuth()
)

routerAdd(
  'GET',
  '/api/todoless/calendar/:id',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const id = c.pathParam('id')
    const record = $app.dao().findRecordById('calendar_events', id)
    if (!record) {
      return c.json(404, { 'error': 'Calendar event not found' })
    }

    return c.json(200, record)
  },
  $apis.requireRecordAuth()
)

routerAdd(
  'POST',
  '/api/todoless/calendar',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const body = $request.body()
    const collection = $app.dao().findCollectionByNameOrId('calendar_events')
    const record = new Record(collection)

    const data = new RecordUpsertAction($app, record)
      .loadRequest(body)
      .set('user', authRecord.id)
      .set('title', body.get('title') || '')
      .set('all_day', body.get('all_day') || false)

    if (body.has('description')) data.set('description', body.get('description'))
    if (body.has('start_time')) data.set('start_time', body.get('start_time'))
    if (body.has('end_time')) data.set('end_time', body.get('end_time'))
    if (body.has('task_id')) data.set('task_id', body.get('task_id'))

    data.submit()

    return c.json(201, record)
  },
  $apis.requireRecordAuth()
)

routerAdd(
  'PATCH',
  '/api/todoless/calendar/:id',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const id = c.pathParam('id')
    const record = $app.dao().findRecordById('calendar_events', id)
    if (!record) {
      return c.json(404, { 'error': 'Calendar event not found' })
    }

    if (record.get('user') !== authRecord.id) {
      return c.json(403, { 'error': 'Forbidden' })
    }

    const body = $request.body()
    const data = new RecordUpsertAction($app, record).loadRequest(body)

    if (body.has('title')) data.set('title', body.get('title'))
    if (body.has('description')) data.set('description', body.get('description'))
    if (body.has('start_time')) data.set('start_time', body.get('start_time'))
    if (body.has('end_time')) data.set('end_time', body.get('end_time'))
    if (body.has('all_day')) data.set('all_day', body.get('all_day'))
    if (body.has('task_id')) data.set('task_id', body.get('task_id'))

    data.submit()

    return c.json(200, record)
  },
  $apis.requireRecordAuth()
)

routerAdd(
  'DELETE',
  '/api/todoless/calendar/:id',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const id = c.pathParam('id')
    const record = $app.dao().findRecordById('calendar_events', id)
    if (!record) {
      return c.json(404, { 'error': 'Calendar event not found' })
    }

    if (record.get('user') !== authRecord.id) {
      return c.json(403, { 'error': 'Forbidden' })
    }

    $app.dao().deleteRecord(record)
    return c.json(200, { 'deleted': true })
  },
  $apis.requireRecordAuth()
)
