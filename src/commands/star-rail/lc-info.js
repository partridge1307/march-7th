const fs = require('fs/promises');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  config: new SlashCommandBuilder()
    .setName('lc-info')
    .setDescription('Show specific light cone info')
    .addStringOption((opt) =>
      opt
        .setName('light-cone')
        .setDescription("Enter light cone's name")
        .setRequired(true)
        .setAutocomplete(true)
    ),
  category: 'star-rail',
  async execute(client, interaction) {
    let query = interaction.options.getString('light-cone');
    if (query.match(/[^A-Za-z0-9 ]/g)) {
      return await interaction.reply({
        content: `Invalid input, only accept \`Alphanumeric\`, and \`Whitespace\` value. Please try again.`,
        ephemeral: true,
      });
    }

    try {
      await interaction.deferReply({ ephemeral: true });

      const data = JSON.parse(
        await fs.readFile(`${__dirname}/../../data/hsr-lightCones.json`, 'utf-8')
      );
      const lightCones = data.lightCones
        .map((lcs) => lcs.lightCones)
        .flat()
        .filter((lc) => lc.name.trim().toLowerCase() === query.toLowerCase().trim());

      if (!lightCones.length) throw new Error(`Could not found ${query}'s info. Please try again.`);

      const embed = new EmbedBuilder()
        .setTitle(`(${lightCones[0].rarity})${lightCones[0].name}'s Info`)
        .setDescription(`${lightCones[0].description}`)
        .setThumbnail(`${lightCones[0].imageLink}`)
        .addFields({
          name: `Level 80 stats`,
          value: lightCones[0].stats.map((stat) => stat).join('\n'),
        })
        .setFooter({
          iconURL: `https://cdn.discordapp.com/emojis/1108450926286618795`,
          text: `Last update: ${data.updateAt} (GMT +7)\nData is fetched from Prydwen`,
        });

      return await interaction.editReply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.log(error);
      return await interaction.editReply({ content: `${error.message}`, ephemeral: true });
    }
  },
};
