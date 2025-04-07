const { User } = require("../models");
const jwt = require("jsonwebtoken");
const hashPassword = require("../utils/hashPassword");
const { Op } = require("sequelize");

class UserService {
  async create({ username, email, password }) {
    const userExists = await User.findOne({ 
      where: { 
        [Op.or]: [{ email }, { username }] 
      } 
    });
    
    if (userExists) {
      return {
        message: userExists.email === email 
          ? "E-mail já cadastrado!" 
          : "Nome de usuário já em uso!",
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
      lastActiveAt: new Date()
    });

    const userWithoutPassword = (({ password, ...rest }) => rest)(newUser.toJSON());
    
    return { 
      response: userWithoutPassword, 
      is_error: false 
    };
  }

  async login({ email, password }) {
    try {
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        return {
          message: "E-mail ou senha inválidos!",
          is_error: true,
          statusCode: 401
        };
      }

      const hashedPassword = hashPassword(password);
      const validPassword = user.password === hashedPassword;
      
      if (!validPassword) {
        return {
          message: "E-mail ou senha inválidos!",
          is_error: true,
          statusCode: 401
        };
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      const userWithoutPassword = (({ password, ...rest }) => rest)(user.toJSON());

      return {
        response: { user: userWithoutPassword, token },
        is_error: false,
        statusCode: 200
      };

    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return {
        message: "Falha ao fazer login!",
        is_error: true,
        statusCode: 400
      };
    }
  }

  async getUserById(id) {
    return await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
  }

  async updateUserStats(userId, updates) {
    const user = await User.findByPk(userId);
    if (!user) {
      return {
        message: "Usuário não encontrado",
        is_error: true
      };
    }

    const allowedUpdates = ['totalPoints', 'pointsPerClick', 'pointsPerSecond', 'lastActiveAt'];
    const updatesToApply = {};
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        updatesToApply[field] = updates[field];
      }
    });

    await user.update(updatesToApply);
    return { 
      response: user,
      is_error: false 
    };
  }

  async getLeaderboard(limit = 10) {
    return await User.findAll({
      attributes: ['id', 'username', 'totalPoints'],
      order: [['totalPoints', 'DESC']],
      limit: parseInt(limit),
      raw: true
    });
  }
  
}

module.exports = new UserService();