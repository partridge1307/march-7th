const fs = require('fs');

module.exports = (client) => {
  const buttonFiles = fs.readdirSync(`${__dirname}/../button`).filter((f) => f.endsWith('.js'));
  buttonFiles.forEach((btn) => {
    const button = require(`${__dirname}/../button/${btn}`);
    client.buttons.set(button.config.name, button);
  });
};
