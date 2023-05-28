const { SlashCommandBuilder } = require('discord.js');
const { useMasterPlayer, QueryType } = require('discord-player');
const playdl = require('play-dl');

module.exports = {
  config: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play songs')
    .addStringOption((opt) =>
      opt.setName('query').setDescription('Enter your song').setRequired(true).setAutocomplete(true)
    ),
  category: 'music',
  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true });
    const channel = interaction.member.voice.channel;
    const botChannel = interaction.guild?.members.me?.voice.channel;

    if (!channel) {
      return await interaction.editReply({
        content: `Please join voice channel first.`,
        ephemeral: true,
      });
    }
    if (botChannel && channel.id !== botChannel.id) {
      return await interaction.editReply({
        content: `You are not in same voice channel with me`,
        ephemeral: true,
      });
    }

    const player = useMasterPlayer();
    const query = interaction.options.getString('query');
    const searchResults = await player.search(query, {
      requestedBy: interaction.user,
    });

    if (searchResults.isEmpty()) {
      return await interaction.editReply({
        content: `Could not found any tracks or playlist. Please try again`,
        ephemeral: true,
      });
    }

    try {
      const res = await player.play(channel, searchResults, {
        nodeOptions: {
          metadata: {
            channel: interaction.channel,
            client: interaction.guild?.members.me,
            user: interaction.user,
          },
          selfDeaf: true,
          leaveOnEmptyCooldown: 300 * 1000,
          leaveOnEndCooldown: 300 * 1000,
          leaveOnStopCooldown: 300 * 1000,
          onBeforeCreateStream: async function (track, query_type, queue) {
            if (query_type === QueryType.SPOTIFY_SONG) {
              const { title } = searchResults.tracks[0];
              const searched = await playdl.search(title, { source: { soundcloud: 'tracks' } });
              const source = await playdl.stream_from_info(searched[0]);

              return source.stream;
            }

            return null;
          },
        },
      });

      return await interaction.editReply({
        content: `<a:loading:1081850358873206854> Loaded ${
          res.track.playlist
            ? `**${res.track.playlist.tracks.length}** tracks from playlist **${res.track.playlist.title}**`
            : `**${res.track.title}**`
        }`,
        ephemeral: true,
      });
    } catch (error) {
      console.log(error);
      return await interaction.editReply({ content: `An error has occurred`, ephemeral: true });
    }
  },
};
