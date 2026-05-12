// pb_hooks/routes/notes.js
// REST API endpoints for notes collection

routerAdd(
  'GET',
  '/api/todoless/notes',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const userId = authRecord.id
    const filter = 'user.id = "' + userId + '"'
    const sort = $request.queryParam('sort') || '-created'

    const result = $app.dao().findRecordsByFilter('notes', filter, sort, 0, 0)
    return c.json(200, result)
  },
  $apis.requireRecordAuth()
)

routerAdd(
  'GET',
  '/api/todoless/notes/:id',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const id = c.pathParam('id')
    const record = $app.dao().findRecordById('notes', id)
    if (!record) {
      return c.json(404, { 'error': 'Note not found' })
    }

    return c.json(200, record)
  },
  $apis.requireRecordAuth()
)

routerAdd(
  'POST',
  '/api/todoless/notes',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const body = $request.body()
    const collection = $app.dao().findCollectionByNameOrId('notes')
    const record = new Record(collection)

    const data = new RecordUpsertAction($app, record)
      .loadRequest(body)
      .set('user', authRecord.id)
      .set('content', body.get('content') || '')
      .set('pinned', body.get('pinned') || false)
      .set('labels', body.get('labels') || [])

    if (body.has('title')) data.set('title', body.get('title'))
    if (body.has('linked_type')) data.set('linked_type', body.get('linked_type'))
    if (body.has('linked_to')) data.set('linked_to', body.get('linked_to'))

    data.submit()

    return c.json(201, record)
  },
  $apis.requireRecordAuth()
)

routerAdd(
  'PATCH',
  '/api/todoless/notes/:id',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const id = c.pathParam('id')
    const record = $app.dao().findRecordById('notes', id)
    if (!record) {
      return c.json(404, { 'error': 'Note not found' })
    }

    if (record.get('user') !== authRecord.id) {
      return c.json(403, { 'error': 'Forbidden' })
    }

    const body = $request.body()
    const data = new RecordUpsertAction($app, record).loadRequest(body)

    if (body.has('title')) data.set('title', body.get('title'))
    if (body.has('content')) data.set('content', body.get('content'))
    if (body.has('pinned')) data.set('pinned', body.get('pinned'))
    if (body.has('linked_type')) data.set('linked_type', body.get('linked_type'))
    if (body.has('linked_to')) data.set('linked_to', body.get('linked_to'))
    if (body.has('labels')) data.set('labels', body.get('labels'))

    data.submit()

    return c.json(200, record)
  },
  $apis.requireRecordAuth()
)

routerAdd(
  'DELETE',
  '/api/todoless/notes/:id',
  (c) => {
    const authRecord = c.get('authRecord')
    if (!authRecord) {
      return c.json(401, { 'error': 'Unauthorized' })
    }

    const id = c.pathParam('id')
    const record = $app.dao().findRecordById('notes', id)
    if (!record) {
      return c.json(404, { 'error': 'Note not found' })
    }

    if (record.get('user') !== authRecord.id) {
      return c.json(403, { 'error': 'Forbidden' })
    }

    $app.dao().deleteRecord(record)
    return c.json(200, { 'deleted': true })
  },
  $apis.requireRecordAuth()
)
