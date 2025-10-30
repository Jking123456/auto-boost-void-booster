export default async function handler(req, res) {
  try {
    // Step 1: Get a fresh API key
    const keyResponse = await fetch("https://sms-api-key.vercel.app/api/generate?count=1");
    const keyData = await keyResponse.json();
    const apiKey = keyData[0]; // API returns an array with one key

    if (!apiKey) {
      throw new Error("Failed to retrieve API key");
    }

    // Step 2: Fetch stats using the dynamic key
    const response = await fetch("https://toshismsbmbapi.up.railway.app/api/stats", {
      headers: {
        "X-API-Key": apiKey
      }
    });

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
