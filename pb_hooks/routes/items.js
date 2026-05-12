// pb_hooks/routes/items.js
// REST API endpoints for items collection

routerAdd(
  'GET',
  '/api/todoless/items',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const userId = authRecord.id
    const familyId = authRecord.get('family_id')

    let filter = ''
    if (familyId) {
      filter = 'user.family_id = "' + familyId + '"'
    } else {
      filter = 'user.id = "' + userId + '"'
    }

    const sort = $request.queryParam('sort') || '-created'
    const completed = $request.queryParam('completed')
    if (completed !== undefined) {
      filter += ' && completed = ' + (completed === 'true' ? 'true' : 'false')
    }

    const result = $app.dao().findRecordsByFilter('items', filter, sort, 0, 0)
    return c.json(200, result)
  },
  $apis.requireRecordAuth()
)

routerAdd(
  'GET',
  '/api/todoless/items/:id',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const id = c.pathParam('id')
    const record = $app.dao().findRecordById('items', id)
    if (!record) {
      return c.json(404, { 'error': 'Item not found' })
    }

    return c.json(200, record)
  },
  $apis.requireRecordAuth()
)

routerAdd(
  'POST',
  '/api/todoless/items',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const body = $request.body()
    const collection = $app.dao().findCollectionByNameOrId('items')
    const record = new Record(collection)

    const data = new RecordUpsertAction($app, record)
      .loadRequest(body)
      .set('user', authRecord.id)
      .set('title', body.get('title') || '')
      .set('completed', body.get('completed') || false)
      .set('quantity', body.get('quantity') || 1)
      .set('labels', body.get('labels') || [])
      .set('is_private', body.get('is_private') || false)

    if (body.has('shop_id')) data.set('shop_id', body.get('shop_id'))
    if (body.has('priority')) data.set('priority', body.get('priority'))
    if (body.has('assigned_to')) data.set('assigned_to', body.get('assigned_to'))
    if (body.has('due_date')) data.set('due_date', body.get('due_date'))

    data.submit()

    return c.json(201, record)
  },
  $apis.requireRecordAuth()
)

routerAdd(
  'PATCH',
  '/api/todoless/items/:id',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const id = c.pathParam('id')
    const record = $app.dao().findRecordById('items', id)
    if (!record) {
      return c.json(404, { 'error': 'Item not found' })
    }

    if (record.get('user') !== authRecord.id) {
      return c.json(403, { 'error': 'Forbidden' })
    }

    const body = $request.body()
    const data = new RecordUpsertAction($app, record).loadRequest(body)

    if (body.has('title')) data.set('title', body.get('title'))
    if (body.has('completed')) data.set('completed', body.get('completed'))
    if (body.has('shop_id')) data.set('shop_id', body.get('shop_id'))
    if (body.has('quantity')) data.set('quantity', body.get('quantity'))
    if (body.has('priority')) data.set('priority', body.get('priority'))
    if (body.has('assigned_to')) data.set('assigned_to', body.get('assigned_to'))
    if (body.has('due_date')) data.set('due_date', body.get('due_date'))
    if (body.has('labels')) data.set('labels', body.get('labels'))
    if (body.has('is_private')) data.set('is_private', body.get('is_private'))

    data.submit()

    return c.json(200, record)
  },
  $apis.requireRecordAuth()
)

routerAdd(
  'DELETE',
  '/api/todoless/items/:id',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const id = c.pathParam('id')
    const record = $app.dao().findRecordById('items', id)
    if (!record) {
      return c.json(404, { 'error': 'Item not found' })
    }

    if (record.get('user') !== authRecord.id) {
      return c.json(403, { 'error': 'Forbidden' })
    }

    $app.dao().deleteRecord(record)
    return c.json(200, { 'deleted': true })
  },
  $apis.requireRecordAuth()
)
