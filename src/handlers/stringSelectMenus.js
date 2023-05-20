const fs = require('fs');

module.exports = (client) => {
  const stringMenuFiles = fs
    .readdirSync(`${__dirname}/../stringSelectMenu`)
    .filter((f) => f.endsWith('.js'));
  stringMenuFiles.forEach((menu) => {
    const stringMenu = require(`${__dirname}/../stringSelectMenu/${menu}`);
    client.stringMenus.set(stringMenu.config.name, stringMenu);
  });
};
