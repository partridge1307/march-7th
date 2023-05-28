const fs = require('fs/promises');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  config: new SlashCommandBuilder()
    .setName('gift-code')
    .setDescription('Show available code in HSR'),
  category: 'star-rail',
  async execute(client, interaction) {
    try {
      const data = JSON.parse(await fs.readFile(`${__dirname}/../../data/hsr-utils.json`, 'utf-8'));
      const codes = data.codes;

      if (!codes.length) throw new Error('Could not found codes data');

      const embed = new EmbedBuilder()
        .setTitle(`Star Rail gift code`)
        .setURL('https://hsr.hoyoverse.com/gift')
        .setDescription(
          `Click on title to redirect to Web redeem code\n\n${codes
            .map((c) => `\`${c.code}\`: ${c.rewards}`)
            .join('\n')}`
        )
        .setFooter({
          iconURL: `https://cdn.discordapp.com/emojis/1108450926286618795`,
          text: `Last update: ${data.updateAt} (GMT +7)\nData is fetched from Prydwen`,
        });

      return await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.log(error);
      return await interaction.reply({ content: `${error.message}`, ephemeral: true });
    }
  },
};
