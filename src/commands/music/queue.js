const { useQueue } = require('discord-player');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  config: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show tracks in queue')
    .addNumberOption((opt) =>
      opt.setName('page').setDescription('Enter number of page in queue').setMinValue(1)
    ),
  async execute(client, interaction) {
    const queue = useQueue(interaction.guild.id);
    if (!queue || !queue.isPlaying())
      return await interaction.reply({
        content: `I do not have any track in queue`,
        ephemeral: true,
      });

    const totalPages = Math.ceil(queue.tracks.size / 10) || 1;
    const page = (interaction.options.getNumber('page') || 1) - 1;

    if (page >= totalPages)
      return await interaction.reply({
        content: `Invalid page, only accept range from 1 to ${totalPages}. Please try again`,
        ephemeral: true,
      });

    const { title, url, duration } = queue.currentTrack;
    const tracks = queue.tracks.toArray();

    const queueString = tracks
      .slice(page * 10, page * 10 + 10)
      .map((song, index) => {
        return `**${page * 10 + index + 1}**. \`[${song.duration}]\` [${song.title}](${song.url})`;
      })
      .join('\n');
    const embed = new EmbedBuilder()
      .setDescription(
        `**Playing**\n\`[${duration}]\` [${title}](${url})\n
      \n**NEXT**\n${queueString}`
      )
      .setFooter({ text: `Page ${page + 1} of ${totalPages}` });

    return await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
