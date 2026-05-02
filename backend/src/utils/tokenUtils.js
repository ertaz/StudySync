const jwt  = require('jsonwebtoken');
const crypto = require('crypto');
 
// ── Generate short-lived access token (stored in memory on client) ──
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  });
};
 
// ── Generate long-lived refresh token (stored in HTTP-only cookie) ──
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  });
};
 
// ── Verify access token ──────────────────────────────────────
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};
 
// ── Verify refresh token ─────────────────────────────────────
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};
 
// ── Hash a token before storing in DB ────────────────────────
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
 
// ── Get expiry Date for refresh token ────────────────────────
const getRefreshTokenExpiry = () => {
  const days = 7;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};
 
module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  getRefreshTokenExpiry,
};