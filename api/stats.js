export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://toshismsbmbapi.up.railway.app/api/stats"
    );
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch stats", error: error.message });
  }
}
