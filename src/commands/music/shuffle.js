const { useQueue } = require('discord-player');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  config: new SlashCommandBuilder().setName('shuffle').setDescription('Shuffle tracks in queue'),
  category: 'music',
  async execute(client, interaction) {
    const queue = useQueue(interaction.guild.id);
    if (!queue)
      return await interaction.reply({
        content: `I do not have any track in queue`,
        ephemeral: true,
      });

    queue.tracks.shuffle();
    return await interaction.reply({
      content: `Shuffled **${queue.tracks.toArray().length}** in queue`,
      ephemeral: true,
    });
  },
};
