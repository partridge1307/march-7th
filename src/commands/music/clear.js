const { useQueue } = require('discord-player');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  config: new SlashCommandBuilder().setName('clear').setDescription('Clear all the track in queue'),
  async execute(client, interaction) {
    const queue = useQueue(interaction.guild.id);
    if (!queue)
      return await interaction.reply({
        content: `I do not have any track in queue`,
        ephemeral: true,
      });

    const size = queue.tracks.size;
    queue.tracks.clear();
    return await interaction.reply({ content: `Cleared ${size} tracks in queue`, ephemeral: true });
  },
};
