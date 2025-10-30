// api/send-sms.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, amount } = req.body || {};
  if (!phoneNumber || typeof amount === 'undefined') {
    return res.status(400).json({ error: 'phoneNumber and amount are required' });
  }

  try {
    const upstream = 'https://toshismsbmbapi.up.railway.app/api/send-sms';
    const response = await fetch(upstream, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.TOSHI_API_KEY
      },
      body: JSON.stringify({ phoneNumber, amount })
    });

    const text = await response.text();
    try {
      const json = JSON.parse(text);
      res.status(response.status).json(json);
    } catch {
      res.status(response.status).send(text);
    }
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}
