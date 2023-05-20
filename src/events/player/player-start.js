const { EmbedBuilder } = require('discord.js');

const repeatModes = [
  { name: 'Off', value: 0 },
  { name: 'Track', value: 1 },
  { name: 'Queue', value: 2 },
];

module.exports = {
  config: {
    name: 'playerStart',
    player: true,
  },
  execute(queue, track) {
    const currentMode = repeatModes.find((m) => m.value === queue.repeatMode)?.name;
    const embed = new EmbedBuilder()
      .setTitle(`${track.title}`)
      .setURL(`${track.url}`)
      .setThumbnail(`${track.thumbnail}`)
      .setDescription(
        `Duration: \`${track.duration}\` Author: \`${track.author}\`\n\nRepeat mode: \`${currentMode}\``
      );

    return queue.metadata.channel.send({ embeds: [embed] });
  },
};
