export default function handler(req, res) {
  const isrc = req.method === "POST" ? req.body.isrc : req.query.isrc;
  res.status(200).json({ isrc, match: true, source: "ISRC Registry" });
}
