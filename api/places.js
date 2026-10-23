import { db, init, checkAuth, fail, validate, isUuid, COLLECTION as C } from './_lib.js';

export default async function handler(req, res) {
  try {
    const denied = checkAuth(req);
    if (denied) return res.status(denied.status).json({ error: denied.error });
    const sql = db();
    await init(sql);
    const { id } = req.query;

    if (req.method === 'GET') {
      const rows = await sql`select id,name,category,lat,lng,address,notes,favorite,created_at,updated_at
        from places where collection=${C} order by created_at desc`;
      return res.status(200).json(rows);
    }
    if (req.method === 'POST') {
      const v = validate(req.body);
      if (v.error) return res.status(400).json(v);
      const p = v.value;
      const [row] = await sql`insert into places (collection,name,category,lat,lng,address,notes,favorite)
        values (${C},${p.name},${p.category},${p.lat},${p.lng},${p.address},${p.notes},${p.favorite})
        returning id,name,category,lat,lng,address,notes,favorite,created_at,updated_at`;
      return res.status(201).json(row);
    }
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid place id.' });
    if (req.method === 'PUT') {
      const v = validate(req.body);
      if (v.error) return res.status(400).json(v);
      const p = v.value;
      const [row] = await sql`update places set name=${p.name},category=${p.category},lat=${p.lat},lng=${p.lng},
        address=${p.address},notes=${p.notes},favorite=${p.favorite},updated_at=now()
        where id=${id} and collection=${C}
        returning id,name,category,lat,lng,address,notes,favorite,created_at,updated_at`;
      return row ? res.status(200).json(row) : res.status(404).json({ error: 'Place not found.' });
    }
    if (req.method === 'DELETE') {
      const rows = await sql`delete from places where id=${id} and collection=${C} returning id`;
      return rows.length ? res.status(200).json({ ok: true }) : res.status(404).json({ error: 'Place not found.' });
    }
    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (e) {
    return fail(res, e);
  }
}
