const jwt = require('jsonwebtoken');
const { User } = require('../models');

const hashPassword = require('../utils/hashPassword');
const { getToken, getUserIdByToken } = require('../utils/auth');

const { Op } = require('sequelize');

class UserService {
  async create({ username, email, password }) {
    const userExists = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });

    if (userExists) {
      return {
        message:
          userExists.email === email
            ? 'E-mail já cadastrado!'
            : 'Nome de usuário já em uso!',
        is_error: true,
      };
    }

    const hashedPassword = hashPassword(password);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      totalPoints: 0,
      pointsPerClick: 1,
      pointsPerSecond: 0,
      lastActiveAt: new Date(),
    });

    const userWithoutPassword = (({ password, ...rest }) => rest)(
      newUser.toJSON()
    );

    return {
      response: userWithoutPassword,
      is_error: false,
    };
  }

  async login({ email, password }) {
    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return {
          message: 'E-mail ou senha inválidos!',
          is_error: true,
          statusCode: 401,
        };
      }

      const hashedPassword = hashPassword(password);
      const validPassword = user.password === hashedPassword;

      if (!validPassword) {
        return {
          message: 'E-mail ou senha inválidos!',
          is_error: true,
          statusCode: 401,
        };
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      const userWithoutPassword = (({ password, ...rest }) => rest)(
        user.toJSON()
      );

      return {
        response: { user: userWithoutPassword, token },
        is_error: false,
        statusCode: 200,
      };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return {
        message: 'Falha ao fazer login!',
        is_error: true,
        statusCode: 400,
      };
    }
  }

  async saveProgress(headers, progressData) {
    try {
      const token = await getToken(headers);
      const userId = await getUserIdByToken(token);

      const user = await User.findByPk(userId);

      if (!user) {
        return {
          message: 'Usuário não encontrado!',
          is_error: true,
          statusCode: 404,
        };
      }

      const updatableFields = [
        'totalPoints',
        'pointsPerClick',
        'pointsPerSecond',
      ];

      const updates = {};
      updatableFields.forEach((field) => {
        if (progressData[field] !== undefined) {
          updates[field] = progressData[field];
        }
      });

      updates.lastActiveAt = new Date();

      await user.update(updates);

      const userWithoutPassword = (({ password, ...rest }) => rest)(
        user.toJSON()
      );

      return {
        response: userWithoutPassword,
        is_error: false,
        statusCode: 200,
      };
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
      return {
        message: 'Falha ao salvar progresso!',
        is_error: true,
        statusCode: 500,
      };
    }
  }

  async getProgress(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        return {
          message: 'Usuário não encontrado!',
          is_error: true,
          statusCode: 404,
        };
      }

      return {
        response: user,
        is_error: false,
        statusCode: 200,
      };
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
      return {
        message: 'Falha ao buscar progresso!',
        is_error: true,
        statusCode: 500,
      };
    }
  }

  async getLeaderboard(limit = 10) {
    return await User.findAll({
      attributes: ['id', 'username', 'totalPoints'],
      order: [['totalPoints', 'DESC']],
      limit: parseInt(limit),
      raw: true,
    });
  }
}

module.exports = new UserService();
