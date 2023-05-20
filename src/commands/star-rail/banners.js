const fs = require('fs/promises');
const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('@discordjs/builders');

module.exports = {
  config: new SlashCommandBuilder().setName('banners').setDescription('Show banners in HSR'),
  async execute(client, interaction) {
    try {
      const data = JSON.parse(await fs.readFile(`${__dirname}/../../data/hsr-utils.json`, 'utf-8'));
      const banners = data.banners;

      if (!banners.length) throw new Error('Could not found banners data');

      const embed = new EmbedBuilder()
        .setTitle(`Banners`)
        .addFields(
          banners.map((banner) => {
            return {
              name: `${banner.name}`,
              value: `${banner.date}`,
            };
          })
        )
        .setFooter({
          iconURL: `https://cdn.discordapp.com/emojis/1108450926286618795`,
          text: `Last update: ${data.updateAt} (GMT +7)`,
        });

      return await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.log(error);
      return await interaction.reply({ content: `${error.message}`, ephemeral: true });
    }
  },
};
