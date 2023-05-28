const { useQueue } = require('discord-player');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  config: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show details on the current track'),
  category: 'music',
  async execute(client, interaction) {
    const queue = useQueue(interaction.guild.id);
    if (!queue || !queue.isPlaying())
      return await interaction.reply({ content: `I do not play any track`, ephemeral: true });

    const progress = queue.node.createProgressBar();
    const embed = new EmbedBuilder()
      .setTitle(`${queue.currentTrack.title}`)
      .setURL(`${queue.currentTrack.url}`)
      .setDescription(`Author: \`${queue.currentTrack.author}\`\n${progress}`)
      .setThumbnail(queue.currentTrack.thumbnail);

    return await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
