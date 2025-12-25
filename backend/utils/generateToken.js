import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  // 👇 FIX: Change 'id' to 'userId' to match what your middleware expects
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // 👇 FIX: Explicitly handle the "SameSite" logic for live deployment
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProduction, // True on live (HTTPS), False on local (HTTP)
    sameSite: isProduction ? 'none' : 'lax', // 'none' is REQUIRED for cross-site cookies
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export default generateToken;