/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const coll = app.findCollectionByNameOrId('invite_codes');
    
    if (!coll.fields.getByName('type')) {
      coll.fields.add(new TextField({
        name: 'type',
        required: true,
        max: 10,
      }));
    }
    
    if (!coll.fields.getByName('token_id')) {
      coll.fields.add(new RelationField({
        name: 'token_id',
        collectionId: app.findCollectionByNameOrId('api_tokens').id,
        maxSelect: 1,
      }));
    }
    
    app.save(coll);
  },
  (app) => {
    try {
      const coll = app.findCollectionByNameOrId('invite_codes');
      let changed = false;
      
      const tf = coll.fields.getByName('type');
      if (tf) { coll.fields.removeById(tf.id); changed = true; }
      
      const tkf = coll.fields.getByName('token_id');
      if (tkf) { coll.fields.removeById(tkf.id); changed = true; }
      
      if (changed) app.save(coll);
    } catch(e) { console.log('rollback error:', String(e)); }
  },
);
