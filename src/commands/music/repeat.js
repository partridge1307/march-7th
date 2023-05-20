const { SlashCommandBuilder } = require('discord.js');
const { QueueRepeatMode, useQueue } = require('discord-player');

const repeatModes = [
  { name: 'Off', value: QueueRepeatMode.OFF },
  { name: 'Track', value: QueueRepeatMode.TRACK },
  { name: 'Queue', value: QueueRepeatMode.QUEUE },
];

module.exports = {
  config: new SlashCommandBuilder()
    .setName('repeat')
    .setDescription('Select repeat mode')
    .addNumberOption((opt) =>
      opt
        .setName('mode')
        .setDescription('Choose mode')
        .setRequired(true)
        .addChoices(...repeatModes)
    ),
  async execute(client, interaction) {
    const queue = useQueue(interaction.guild.id);
    if (!queue || !queue.isPlaying()) {
      return await interaction.reply({ content: `I do not play any track`, ephemeral: true });
    }

    const mode = interaction.options.getNumber('mode');
    const name =
      mode === QueueRepeatMode.OFF ? 'Loop off' : repeatModes.find((m) => m.value === mode)?.name;

    queue.setRepeatMode(mode);
    return await interaction.reply({
      content: `**${name}** ${mode === queue.repeatMode ? 'enabled' : 'disabled'}`,
      ephemeral: true,
    });
  },
};
