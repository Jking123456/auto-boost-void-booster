export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { phoneNumber, amount } = req.body;

  // Validate inputs
  if (!phoneNumber || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Call the external API
    const response = await fetch("https://toshismsbombapi.up.railway.app/api/bomb/start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "toshi_5keziigugz9_mhrn03ld", // replace if needed
      },
      // ✅ Correct parameter names expected by the API
      body: JSON.stringify({
        number: phoneNumber,
        total: amount,
      }),
    });

    // Try to parse JSON safely
    let data;
    try {
      data = await response.json();
    } catch {
      const text = await response.text();
      return res.status(response.status).json({
        error: "Invalid JSON from external API",
        raw: text,
      });
    }

    // Return API result to frontend
    return res.status(response.status).json(data);

  } catch (error) {
    console.error("API proxy error:", error);
    return res.status(500).json({ error: error.message });
  }
}
