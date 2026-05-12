// pb_hooks/routes/sprints.js
// REST API endpoints for sprints collection

routerAdd(
  'GET',
  '/api/todoless/sprints',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const userId = authRecord.id
    const filter = 'user.id = "' + userId + '"'
    const sort = $request.queryParam('sort') || '-start_date'

    const result = $app.dao().findRecordsByFilter('sprints', filter, sort, 0, 0)
    return c.json(200, result)
  },
  $apis.requireRecordAuth()
)

routerAdd(
  'GET',
  '/api/todoless/sprints/:id',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const id = c.pathParam('id')
    const record = $app.dao().findRecordById('sprints', id)
    if (!record) {
      return c.json(404, { 'error': 'Sprint not found' })
    }

    return c.json(200, record)
  },
  $apis.requireRecordAuth()
)

routerAdd(
  'POST',
  '/api/todoless/sprints',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const body = $request.body()
    const collection = $app.dao().findCollectionByNameOrId('sprints')
    const record = new Record(collection)

    const data = new RecordUpsertAction($app, record)
      .loadRequest(body)
      .set('user', authRecord.id)
      .set('name', body.get('name') || '')
      .set('duration', body.get('duration') || '2weeks')
      .set('week_number', body.get('week_number') || 1)
      .set('year', body.get('year') || new Date().getFullYear())

    if (body.has('start_date')) data.set('start_date', body.get('start_date'))
    if (body.has('end_date')) data.set('end_date', body.get('end_date'))

    data.submit()

    return c.json(201, record)
  },
  $apis.requireRecordAuth()
)

routerAdd(
  'PATCH',
  '/api/todoless/sprints/:id',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const id = c.pathParam('id')
    const record = $app.dao().findRecordById('sprints', id)
    if (!record) {
      return c.json(404, { 'error': 'Sprint not found' })
    }

    if (record.get('user') !== authRecord.id) {
      return c.json(403, { 'error': 'Forbidden' })
    }

    const body = $request.body()
    const data = new RecordUpsertAction($app, record).loadRequest(body)

    if (body.has('name')) data.set('name', body.get('name'))
    if (body.has('start_date')) data.set('start_date', body.get('start_date'))
    if (body.has('end_date')) data.set('end_date', body.get('end_date'))
    if (body.has('duration')) data.set('duration', body.get('duration'))
    if (body.has('week_number')) data.set('week_number', body.get('week_number'))
    if (body.has('year')) data.set('year', body.get('year'))

    data.submit()

    return c.json(200, record)
  },
  $apis.requireRecordAuth()
)

routerAdd(
  'DELETE',
  '/api/todoless/sprints/:id',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const id = c.pathParam('id')
    const record = $app.dao().findRecordById('sprints', id)
    if (!record) {
      return c.json(404, { 'error': 'Sprint not found' })
    }

    if (record.get('user') !== authRecord.id) {
      return c.json(403, { 'error': 'Forbidden' })
    }

    $app.dao().deleteRecord(record)
    return c.json(200, { 'deleted': true })
  },
  $apis.requireRecordAuth()
)
