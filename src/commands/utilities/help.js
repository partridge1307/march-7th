const fs = require('fs');
const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');

const folders = fs.readdirSync(`${__dirname}/../../commands/`).filter((f) => !f.endsWith('.js'));

const files = folders.map((folder) => {
  return {
    folder,
    commands: fs
      .readdirSync(`${__dirname}/../../commands/${folder}/`)
      .filter((f) => f.endsWith('.js')),
  };
});

module.exports = {
  config: new SlashCommandBuilder().setName('help').setDescription('Get help'),
  async execute(client, interaction) {
    const embed = new EmbedBuilder()
      .setTitle('SLASH COMMANDS')
      .setDescription('USAGE: /{command}')
      .addFields(
        files.map((file) => {
          return {
            name: `${file.folder.toUpperCase()}`,
            value: `${file.commands.join(' | ').replace(/\.js/g, '')}`,
          };
        })
      );

    return await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
