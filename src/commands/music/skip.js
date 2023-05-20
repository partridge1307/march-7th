const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
  config: new SlashCommandBuilder().setName('skip').setDescription('Skip current track'),
  async execute(client, interaction) {
    const queue = useQueue(interaction.guild.id);
    if (!queue || !queue.isPlaying()) {
      return await interaction.reply({ content: `I do not play any track`, ephemeral: true });
    }

    queue.node.skip();
    return await interaction.reply({
      content: `Skipped **${queue.currentTrack.title}**`,
      ephemeral: true,
    });
  },
};
