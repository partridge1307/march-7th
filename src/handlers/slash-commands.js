const fs = require('fs');
const { REST, Routes } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

module.exports = (client) => {
  const slashCommands = [];

  const commandFolders = fs
    .readdirSync(`${__dirname}/../commands`)
    .filter((f) => !f.endsWith('.js'));

  for (const folder of commandFolders) {
    const commandFiles = fs
      .readdirSync(`${__dirname}/../commands/${folder}`)
      .filter((f) => f.endsWith('.js'));
    commandFiles.forEach((file) => {
      const command = require(`${__dirname}/../commands/${folder}/${file}`);

      slashCommands.push(command.config.toJSON());

      if (!command.config.name) {
        console.warn(`Could not set ${command.config.name}`);
      } else {
        client.commands.set(command.config.name, command);
      }
    });
  }

  (async () => {
    try {
      const data = await rest.put(Routes.applicationCommands(process.env.BOT_ID), {
        body: slashCommands,
      });

      console.log(`Successfully loaded ${data.length} commands!`);
    } catch (error) {
      console.log(error);
    }
  })();
};
