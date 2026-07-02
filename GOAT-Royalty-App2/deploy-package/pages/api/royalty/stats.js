export default function handler(req, res) {
  res.status(200).json({
    totalCollected: "$1,285,912",
    pendingClaims: "$74,193",
    unmatchedRoyalties: "$9,417",
    countriesCovered: "112"
  });
}
