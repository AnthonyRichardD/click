const jwt = require('jsonwebtoken');

const getToken = (headers) => {
  const authHeader = headers;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Token de autenticação não fornecido!',
      is_error: true,
    });
  }

  return token;
};

const getUserIdByToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.id;

  return userId;
};

module.exports = {
  getToken,
  getUserIdByToken,
};
