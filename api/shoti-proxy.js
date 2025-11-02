export default async function handler(req, res) {
  try {
    const response = await fetch("https://haji-mix-api.gleeze.com/api/shoti?stream=false");
    const data = await response.json();

    if (!data.link) return res.status(400).json({ error: "No link found" });

    const videoResponse = await fetch(data.link);
    const contentType = videoResponse.headers.get("content-type") || "video/mp4";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "no-store");

    videoResponse.body.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch video" });
  }
}
