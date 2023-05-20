const { useQueue, useMasterPlayer } = require('discord-player');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  config: new SlashCommandBuilder().setName('leave').setDescription('Disconnect the bot'),
  async execute(client, interaction) {
    const queue = useQueue(interaction.guild.id);
    if (!queue)
      return await interaction.reply({ content: `I am not in voice channel`, ephemeral: true });

    const player = useMasterPlayer();
    player.nodes.delete(interaction.guild.id);
    return await interaction.reply({
      content: `I have successfully disconnected from the voice channel`,
      ephemeral: true,
    });
  },
};
