const { useQueue } = require('discord-player');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  config: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Delete specific track in queue')
    .addNumberOption((opt) =>
      opt.setName('track').setDescription("Enter track' position").setRequired(true)
    ),
  async execute(client, interaction) {
    const queue = useQueue(interaction.guild.id);
    if (!queue)
      return await interaction.reply({
        content: `I do not have any track in queue`,
        ephemeral: true,
      });

    const trackIndex = interaction.options.getNumber('track') - 1;
    const tracks = queue.tracks.toArray();
    if (trackIndex > tracks.length - 1 || trackIndex < 0)
      return await interaction.reply({
        content: `Invalid track' position, only accept range from 1 to ${tracks.length}. Please try again`,
        ephemeral: true,
      });

    queue.removeTrack(tracks[trackIndex]);
    return await interaction.reply({
      content: `Removed **${tracks[trackIndex].title}** in queue`,
      ephemeral: true,
    });
  },
};
