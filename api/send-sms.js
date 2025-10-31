export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { phoneNumber, amount } = req.body;

  if (!phoneNumber || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Step 1: Try to get a fresh API key
    const keyResponse = await fetch("https://sms-api-key.vercel.app/api/generate?count=1");

    if (!keyResponse.ok) {
      // Attempt to parse cooldown info if present
      const errData = await keyResponse.json().catch(() => ({}));

      if (errData?.error?.includes("Cooldown")) {
        // Extract remaining seconds from error message
        const match = errData.error.match(/(\d+)\s*seconds?/);
        const remaining = match ? parseInt(match[1]) : 0;

        // Build a user-friendly countdown message
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;

        const readable =
          minutes > 0
            ? `${minutes} minute${minutes > 1 ? "s" : ""} and ${seconds} second${seconds !== 1 ? "s" : ""}`
            : `${seconds} second${seconds !== 1 ? "s" : ""}`;

        return res.status(429).json({
          error: `Please wait ${readable} to use again.`,
          remainingSeconds: remaining
        });
      }

      throw new Error("Something went wrong!!");
    }

    const keyData = await keyResponse.json();
    const apiKey = keyData[0]; // API returns an array with one key

    if (!apiKey) {
      throw new Error("15 minutes Cooldown (no API key available)");
    }

    // Step 2: Send SMS using the fetched key
    const smsResponse = await fetch("https://toshismsbmbapi.up.railway.app/api/send-sms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey
      },
      body: JSON.stringify({ phoneNumber, amount })
    });

    const data = await smsResponse.json();
    return res.status(smsResponse.status).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
