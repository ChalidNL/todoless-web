migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('items');

    if (!collection.fields.getByName('focus')) {
      collection.fields.add(
        new BoolField({
          name: 'focus',
          required: false,
        }),
      );
    }

    app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('items');
    try {
      collection.fields.remove(collection.fields.getByName('focus'));
    } catch {}
    app.save(collection);
  },
);
