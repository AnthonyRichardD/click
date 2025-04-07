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

      const result = await UserService.login({ email, password });

      if (result.is_error) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return res.status(400).json({ message: "Falha ao fazer login!" });
    }
  }
  
}

module.exports = new Usercontrollers();
