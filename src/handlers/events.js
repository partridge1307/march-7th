const fs = require('fs');
const { useMasterPlayer } = require('discord-player');

module.exports = (client) => {
  const eventFolders = fs.readdirSync(`${__dirname}/../events`).filter((f) => !f.endsWith('.js'));
  for (const folder of eventFolders) {
    const eventFiles = fs
      .readdirSync(`${__dirname}/../events/${folder}`)
      .filter((f) => f.endsWith('.js'));
    eventFiles.forEach((e) => {
      const event = require(`${__dirname}/../events/${folder}/${e}`);

      if (!event.config.player) {
        !event.config.once
          ? client.on(event.config.name, (...args) => event.execute(client, ...args))
          : client.once(event.config.name, (...args) => event.execute(client, ...args));
      } else {
        const player = useMasterPlayer();
        player.events.on(event.config.name, (...args) => event.execute(...args));
      }
    });
  }
};
