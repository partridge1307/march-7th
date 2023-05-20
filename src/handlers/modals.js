const fs = require('fs');

module.exports = (client) => {
  const modalFiles = fs.readdirSync(`${__dirname}/../modal`).filter((f) => f.endsWith('.js'));
  modalFiles.forEach((mdl) => {
    const modal = require(`${__dirname}/../modal/${mdl}`);
    client.modals.set(modal.config.name, modal);
  });
};
