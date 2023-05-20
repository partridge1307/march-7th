const fs = require('fs');

module.exports = (client) => {
  const autoCompleteFiles = fs
    .readdirSync(`${__dirname}/../autoComplete`)
    .filter((f) => f.endsWith('.js'));

  autoCompleteFiles.forEach((ac) => {
    const autoComplete = require(`${__dirname}/../autoComplete/${ac}`);
    client.autoCompletes.set(autoComplete.config.name, autoComplete);
  });
};
