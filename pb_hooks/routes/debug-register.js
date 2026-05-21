/// <reference path="../../pb_data/types.d.ts" />
// Debug: test register flow stap voor stap

routerAdd('GET', '/api/todoless/debug-create-user', (c) => {
  try {
    var uc = $app.findCollectionByNameOrId('users');
    var u = $app.unsafeWithoutHooks();
    var rec = new Record(uc);
    rec.set('id', $security.randomString(15));
    rec.set('tokenKey', $security.randomString(30));
    rec.set('verified', false);
    rec.set('email', 'debug-' + Date.now() + '@test.nl');
    rec.set('password', 'Test1234!');
    rec.set('passwordConfirm', 'Test1234!');
    rec.set('name', 'Debug User');
    rec.set('emailVisibility', true);
    rec.set('role', 'user');
    rec.set('family_id', '');
    u.save(rec);
    return c.json(200, { step: 'create-user', ok: true, id: rec.id, email: String(rec.get('email')||'') });
  } catch(e) { return c.json(400, { step: 'create-user', error: String(e), stack: String(e.stack||'') }); }
});

routerAdd('GET', '/api/todoless/debug-create-family', (c) => {
  try {
    var fc = $app.findCollectionByNameOrId('families');
    var fam = new Record(fc);
    fam.set('id', $security.randomString(15));
    fam.set('tokenKey', $security.randomString(30));
    fam.set('name', 'Debug Family');
    fam.set('created_by', 'debug');
    var u = $app.unsafeWithoutHooks();
    u.save(fam);
    return c.json(200, { step: 'create-family', ok: true, id: fam.id, name: String(fam.get('name')||'') });
  } catch(e) { return c.json(400, { step: 'create-family', error: String(e), stack: String(e.stack||'') }); }
});

routerAdd('GET', '/api/todoless/debug-check-existing', (c) => {
  try {
    var existing = $app.findRecordsByFilter('users', '', '-created', 1, 0);
    var setupDone = $app.findRecordsByFilter('app_settings', 'setup_complete = true', '-created', 1, 0);
    return c.json(200, {
      step: 'check-existing',
      has_users: existing.length > 0,
      setup_complete: setupDone.length > 0,
      user_count: existing.length
    });
  } catch(e) { return c.json(400, { step: 'check-existing', error: String(e) }); }
});
