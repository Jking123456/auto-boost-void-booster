// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(".")); // serve index.html

// Backend proxy route
app.post("/api/send-otp", async (req, res) => {
  const { phone_no, seconds } = req.body;

  try {
    const response = await fetch("https://bomba-vrl7.onrender.com/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_no, seconds }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error: " + error.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
