export default async function handler(req, res) {
  try {
    const response = await fetch("https://toshismsbmbapi.up.railway.app/api/stats", {
      headers: {
        "X-API-Key": "91f23a73be5b70b7ff1bdf76d7aa09caf3a9afd0d25bf70794e11dfbba33d19b"
      }
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
