export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    const { phone_no, seconds } = req.body;

    if (!phone_no || !seconds) {
      return res.status(400).json({ success: false, error: "Missing phone_no or seconds" });
    }

    // Use native fetch (no import required)
    const response = await fetch("https://bomba-vrl7.onrender.com/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_no, seconds }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ success: false, error: "Backend error occurred: " + error.message });
  }
}
