const { User } = require('../models');
const UserService = require('../services/userService');
const jwt = require('jsonwebtoken');

class Usercontrollers {
  async store(req, res) {
    try {
      const { username, email, password } = req.body;
      const result = await UserService.create({
        username,
        email,
        password,
      });

      if (result.is_error) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      const message = 'Falha ao cadastrar usuário!';
      console.error('Erro ao cadastrar usuário:', error);
      return res.status(400).json({ message, is_error: true });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const result = await UserService.login({ email, password });

      if (result.is_error) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return res.status(400).json({ message: 'Falha ao fazer login!' });
    }
  }

  async saveProgress(req, res) {
    try {
      const { totalPoints, pointsPerClick, pointsPerSecond } = req.body;
      const result = await UserService.saveProgress(
        req.headers['authorization'],
        {
          totalPoints,
          pointsPerClick,
          pointsPerSecond,
        }
      );

      return res.status(result.statusCode || 200).json(result);
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);

      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          message: 'Token inválido ou expirado!',
          is_error: true,
        });
      }

      return res.status(500).json({
        message: 'Falha ao salvar progresso!',
        is_error: true,
      });
    }
  }

  async getProgress(req, res) {
    try {
      const { userId } = req.user;

      const result = await UserService.getProgress(userId);

      if (result.is_error) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
      return res.status(400).json({ message: 'Falha ao buscar progresso!' });
    }
  }
}

module.exports = new Usercontrollers();
