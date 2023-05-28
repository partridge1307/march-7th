const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  config: new SlashCommandBuilder().setName('ping').setDescription('Check latency'),
  category: 'utilities',
  async execute(client, interaction) {
    return await interaction.reply({
      content: `API latency: \`${client.ws.ping}\`ms. Bot latency: \`${
        Date.now() - interaction.createdTimestamp
      }\`ms`,
      ephemeral: true,
    });
  },
};
