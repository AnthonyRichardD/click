const { User } = require("../models");
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

    // Atualiza apenas os campos permitidos
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