export default async function handler(req, res) {
  try {
    const response = await fetch("https://toshismsbmbapi.up.railway.app/api/stats", {
      headers: {
        "X-API-Key": "3c335a2e55d79b565b9942b67fb6b33db05b937d44640daa17080a165a0bc71c"
      }
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
