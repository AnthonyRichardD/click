const jwt = require("jsonwebtoken");
const { User } = require("../models");
const hashPassword = require("../utils/hashPassword");
const UserService = require("../services/userService");

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
      const message = "Falha ao cadastrar usuário!";
      console.error("Erro ao cadastrar usuário:", error);
      return res.status(400).json({ message, is_error: true });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: "E-mail ou senha inválidos!" });
      }

      const hashedPassword = hashPassword(password);

      const validPassword = user.password === hashedPassword;
      if (!validPassword) {
        return res.status(401).json({ message: "E-mail ou senha inválidos!" });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      const userWithoutPassword = { ...user.toJSON(), password: undefined };

      return res.status(200).json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return res.status(400).json({ message: "Falha ao fazer login!" });
    }
  }

  async index(req, res) {
    try {
      const users = await User.findAll({
        attributes: { exclude: ["password"] },
      });
      return res.status(200).json(users);
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      return res.status(400).json({ message: "Falha ao listar usuários!" });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado!" });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      return res.status(400).json({ message: "Falha ao buscar usuário!" });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { username, email, password } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado!" });
      }

      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }
      await user.update({ username, email, password: user.password });

      const userWithoutPassword = { ...user.toJSON() };
      delete userWithoutPassword.password;

      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      return res.status(400).json({ message: "Falha ao atualizar usuário!" });
    }
  }

  async destroy(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado!" });
      }

      await user.destroy();
      return res.status(200).json({ message: "Usuário excluído com sucesso!" });
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      return res.status(400).json({ message: "Falha ao excluir usuário!" });
    }
  }
}

module.exports = new Usercontrollers();
