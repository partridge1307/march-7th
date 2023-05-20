const { useMasterPlayer } = require('discord-player');

module.exports = {
  config: {
    name: 'play',
  },
  async execute(client, interaction) {
    const player = useMasterPlayer();
    const query = interaction.options.getString('query', true);
    const results = await player.search(query);

    return interaction.respond(
      results.tracks.slice(0, 10).map((track) => ({
        name:
          track.title.length > 85
            ? `${track.title.slice(0, 85)}... [${track.duration}]`
            : `${track.title} [${track.duration}]`,
        value: track.url > 100 ? `${track.title} by ${track.author}` : track.url,
      }))
    );
  },
};
