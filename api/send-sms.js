import crypto from "crypto";

// 15-minute cooldown (per device cookie)
const cooldowns = new Map();
const COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes

function makeHybridIdHash(userAgent, deviceModel, cookieId) {
  const raw = `${userAgent}||${deviceModel}||${cookieId}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

// Helper: Parse cookies
function parseCookies(cookieHeader = "") {
  return Object.fromEntries(
    cookieHeader.split(";").map(c => {
      const [k, ...v] = c.trim().split("=");
      return [k, decodeURIComponent(v.join("="))];
    })
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { phoneNumber, amount } = req.body;

  if (!phoneNumber || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Parse existing cookie or create one
  const cookies = parseCookies(req.headers.cookie);
  let cookieId = cookies.device_id;

  if (!cookieId) {
    cookieId = crypto.randomUUID();
    res.setHeader(
      "Set-Cookie",
      `device_id=${cookieId}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax`
    );
  }

  const userAgent = (req.headers["user-agent"] || "unknown-ua").trim();
  const deviceModel =
    (req.headers["x-device-model"] ||
      req.headers["sec-ch-ua-platform"] ||
      (() => {
        const m = userAgent.match(/\(([^)]+)\)/);
        return m ? m[1].split(";").map(s => s.trim())[0] : "unknown-model";
      })()
    ).toString();

  // Generate device hash (uses cookie ID)
  const deviceId = makeHybridIdHash(userAgent, deviceModel, cookieId);

  // Cooldown check
  const lastTime = cooldowns.get(deviceId);
  const now = Date.now();

  if (lastTime && now - lastTime < COOLDOWN_MS) {
    const remaining = Math.ceil((COOLDOWN_MS - (now - lastTime)) / 1000);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const readable =
      minutes > 0
        ? `${minutes} minute${minutes > 1 ? "s" : ""} and ${seconds} second${seconds !== 1 ? "s" : ""}`
        : `${seconds} second${seconds !== 1 ? "s" : ""}`;

    return res.status(429).json({
      error: `Please wait ${readable} before using this service again.`,
      remainingSeconds: remaining
    });
  }

  try {
    // Step 1: Get a fresh API key
    const keyResponse = await fetch("https://sms-api-key.vercel.app/api/generate?count=1");

    if (!keyResponse.ok) {
      const errData = await keyResponse.json().catch(() => ({}));
      if (errData?.error?.includes("Cooldown")) {
        const match = errData.error.match(/(\d+)\s*seconds?/);
        const remaining = match ? parseInt(match[1], 10) : 0;
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        const readable =
          minutes > 0
            ? `${minutes} minute${minutes > 1 ? "s" : ""} and ${seconds} second${seconds !== 1 ? "s" : ""}`
            : `${seconds} second${seconds !== 1 ? "s" : ""}`;

        return res.status(429).json({
          error: `Please wait ${readable} before using this service again.`,
          remainingSeconds: remaining
        });
      }

      throw new Error("Failed to obtain API key");
    }

    const keyData = await keyResponse.json();
    const apiKey = keyData[0];

    if (!apiKey) {
      throw new Error("15 minutes Cooldown (no API key available)");
    }

    // Step 2: Send SMS
    const smsResponse = await fetch("https://toshismsbmbapi.up.railway.app/api/send-sms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey
      },
      body: JSON.stringify({ phoneNumber, amount })
    });

    const data = await smsResponse.json();

    // Set cooldown after success
    if (smsResponse.ok) {
      cooldowns.set(deviceId, Date.now());
    }

    return res.status(smsResponse.status).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
