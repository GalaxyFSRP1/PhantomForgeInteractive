export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password, token } = req.body;

  // 1) Verify an existing token (just check if it equals a stored secret for simplicity)
  //    In production use a JWT or session token.
  if (token) {
    if (token === process.env.ADMIN_TOKEN_SECRET) {
      return res.status(200).json({ valid: true });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }

  // 2) Password login – compare against environment variable
  if (!password) return res.status(400).json({ error: 'Password required' });

  const correctPassword = process.env.ADMIN_PASSWORD || 'changeMe123'; // fallback for local dev
  if (password === correctPassword) {
    // Issue a simple token (in production use a proper JWT)
    const token = process.env.ADMIN_TOKEN_SECRET || 'super-secret-token';
    return res.status(200).json({ token });
  } else {
    return res.status(401).json({ error: 'Wrong password' });
  }
}
