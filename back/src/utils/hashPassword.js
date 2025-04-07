const md5 = require("md5");

const HashPassword = (password) => {
  return md5(password + process.env.PASS_SALT_KEY);
};

module.exports = HashPassword;
