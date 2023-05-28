const fs = require('fs');
const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');

const folders = fs.readdirSync(`${__dirname}/../../commands/`).filter((f) => !f.endsWith('.js'));

module.exports = {
  config: new SlashCommandBuilder().setName('help').setDescription('Get help'),
  category: 'utilities',
  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true });
    const categories = folders.map((folder) => {
      let commands = [];
      client.commands.forEach((cmd, cmdName) => {
        if (cmd.category === folder) commands.push({ name: cmdName, desc: cmd.config.description });
      });

      return {
        category: folder
          .split('-')
          .map((v) => v.charAt(0).toUpperCase() + v.slice(1))
          .join(' '),
        commands,
      };
    });

    const embed = new EmbedBuilder()
      .setTitle('SLASH COMMANDS')
      .setDescription('USAGE: /[Command Name]')
      .addFields(
        categories.map((cate) => ({
          name: cate.category,
          value: cate.commands.map((cmd) => `\`/${cmd.name}\`: ${cmd.desc}`).join('\n'),
        }))
      )
      .setFooter({
        iconURL: `https://cdn.discordapp.com/emojis/1108452659700183190`,
        text: `If you have any error please contact partridge#4447`,
      });

    return await interaction.editReply({ embeds: [embed], ephemeral: true });
  },
};
