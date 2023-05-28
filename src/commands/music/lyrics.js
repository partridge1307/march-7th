const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue, useMasterPlayer, QueryType } = require('discord-player');
const lyricsFinder = require('lyrics-finder');

module.exports = {
  config: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Show lyrics of current track'),
  category: 'music',
  async run(client, interaction) {
    const queue = useQueue(interaction.guild.id);
    if (!queue || !queue.isPlaying())
      return await interaction.reply({
        content: `I do not play any track`,
        ephemeral: true,
      });

    await interaction.deferReply({ ephemeral: true });

    const player = useMasterPlayer();
    const track = await player
      .search(queue.currentTrack.title, {
        searchEngine: QueryType.SPOTIFY_SEARCH,
      })
      .then((results) => results.tracks[0]);

    const lyrics = (await lyricsFinder(track.author, track.title)) || null;
    if (!lyrics)
      return await interaction.editReply({
        content: "I can't find any lyrics of this track",
        ephemeral: true,
      });

    const trimmedLyrics = lyrics.substring(0, 1997);
    const embed = new EmbedBuilder()
      .setTitle(`${track.title} by ${track.author}`)
      .setURL(queue.currentTrack.url)
      .setThumbnail(queue.currentTrack.thumbnail)
      .setDescription(trimmedLyrics.length === 1997 ? `${trimmedLyrics}...` : trimmedLyrics);

    return await interaction.editReply({ embeds: [embed], ephemeral: true });
  },
};
