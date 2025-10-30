export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { phoneNumber, amount } = req.body;

  if (!phoneNumber || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1. Fetch the API Key dynamically
    const keyResponse = await fetch("https://sms-api-key.vercel.app/api/generate?count=1");
    
    if (!keyResponse.ok) {
      // Handle non-200 responses from the key generator API
      const errorText = await keyResponse.text();
      return res.status(keyResponse.status).json({ error: `Failed to fetch API key: ${errorText}` });
    }

    const keyData = await keyResponse.json();
    // Assuming the key is the first element of the returned array
    const apiKey = keyData[0]; 

    if (!apiKey) {
        return res.status(500).json({ error: "API Key generation returned an empty result." });
    }

    // 2. Send the SMS using the dynamically fetched key
    const response = await fetch("https://toshismsbmbapi.up.railway.app/api/send-sms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Use the dynamically fetched API Key
        "X-API-Key": apiKey 
      },
      body: JSON.stringify({ phoneNumber, amount })
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    // Catch network or parsing errors from either fetch request
    return res.status(500).json({ error: error.message });
  }
}
