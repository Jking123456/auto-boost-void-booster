// api/shoti.js or pages/api/shoti.js

export default async function handler(req, res) {
  const apiUrl = "https://haji-mix-api.gleeze.com/api/shoti?stream=false";

  try {
    const response = await fetch(apiUrl);

    // Check if remote API responded OK
    if (!response.ok) {
      const text = await response.text();
      console.error("Shoti API returned:", response.status, text);
      return res.status(500).json({ error: "Shoti API returned an error" });
    }

    // Parse JSON safely
    const data = await response.json();

    // Add CORS headers (if testing locally)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");

    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching Shoti API:", err);
    res.status(500).json({ error: err.message || "Failed to fetch Shoti API" });
  }
}
