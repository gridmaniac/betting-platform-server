const crypto = require("crypto");

module.exports.makePassword = (password) => {
  return new Promise((resolve) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.pbkdf2(password, salt, 1000, 64, `sha512`, (err, key) => {
      resolve({ hash: key.toString(`hex`), salt });
    });
  });
};

module.exports.verifyPassword = (password, salt, hash) => {
  return new Promise((resolve) => {
    crypto.pbkdf2(password, salt, 1000, 64, `sha512`, (err, key) => {
      resolve(key.toString("hex") === hash);
    });
  });
};
