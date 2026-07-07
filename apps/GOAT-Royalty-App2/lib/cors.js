// GOAT Royalty App - CORS Middleware
// Copyright © 2024 HARVEY L MILLER JR / JUAQUIN J MALPHURS / KEVIN W HALLINGQUEST

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  'http://72.61.193.184',
  'http://93.127.214.171',
  'https://goatroyalty.com',
  'https://www.goatroyalty.com'
];

export function withCors(handler) {
  return async (req, res) => {
    const origin = req.headers.origin;
    
    // Set CORS headers
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    return handler(req, res);
  };
}

export default withCors;