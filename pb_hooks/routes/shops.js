// pb_hooks/routes/shops.js
// REST API endpoints for shops collection

routerAdd(
  'GET',
  '/api/todoless/shops',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const userId = authRecord.id
    const filter = 'user.id = "' + userId + '"'
    const sort = $request.queryParam('sort') || 'name'

    const result = $app.dao().findRecordsByFilter('shops', filter, sort, 0, 0)
    return c.json(200, result)
  },
  $apis.requireRecordAuth()
)

routerAdd(
  'GET',
  '/api/todoless/shops/:id',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const id = c.pathParam('id')
    const record = $app.dao().findRecordById('shops', id)
    if (!record) {
      return c.json(404, { 'error': 'Shop not found' })
    }

    return c.json(200, record)
  },
  $apis.requireRecordAuth()
)

routerAdd(
  'POST',
  '/api/todoless/shops',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const body = $request.body()
    const collection = $app.dao().findCollectionByNameOrId('shops')
    const record = new Record(collection)

    const data = new RecordUpsertAction($app, record)
      .loadRequest(body)
      .set('user', authRecord.id)
      .set('name', body.get('name') || '')
      .set('color', body.get('color') || '#6366f1')

    data.submit()

    return c.json(201, record)
  },
  $apis.requireRecordAuth()
)

routerAdd(
  'PATCH',
  '/api/todoless/shops/:id',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const id = c.pathParam('id')
    const record = $app.dao().findRecordById('shops', id)
    if (!record) {
      return c.json(404, { 'error': 'Shop not found' })
    }

    if (record.get('user') !== authRecord.id) {
      return c.json(403, { 'error': 'Forbidden' })
    }

    const body = $request.body()
    const data = new RecordUpsertAction($app, record).loadRequest(body)

    if (body.has('name')) data.set('name', body.get('name'))
    if (body.has('color')) data.set('color', body.get('color'))

    data.submit()

    return c.json(200, record)
  },
  $apis.requireRecordAuth()
)

routerAdd(
  'DELETE',
  '/api/todoless/shops/:id',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const id = c.pathParam('id')
    const record = $app.dao().findRecordById('shops', id)
    if (!record) {
      return c.json(404, { 'error': 'Shop not found' })
    }

    if (record.get('user') !== authRecord.id) {
      return c.json(403, { 'error': 'Forbidden' })
    }

    $app.dao().deleteRecord(record)
    return c.json(200, { 'deleted': true })
  },
  $apis.requireRecordAuth()
)
