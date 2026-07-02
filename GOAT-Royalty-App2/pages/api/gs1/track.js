export default function handler(req, res) {
  const gs1 = req.method === "POST" ? req.body.gs1 : req.query.gs1;
  res.status(200).json({ gs1, product: "GOAT Merch", royalties: "$1,223" });
}
