const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido!' });
  }

  const [scheme, token] = authHeader.split(' ');

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ message: 'Token mal formatado!' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado!' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(401).json({ message: 'Token inválido!' });
  }
};
