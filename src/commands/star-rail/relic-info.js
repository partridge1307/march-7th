const fs = require('fs/promises');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  config: new SlashCommandBuilder()
    .setName('relic-info')
    .setDescription('Show specific relic info')
    .addStringOption((opt) =>
      opt
        .setName('relic')
        .setDescription("Enter relic's name")
        .setRequired(true)
        .setAutocomplete(true)
    ),
  category: 'star-rail',
  async execute(client, interaction) {
    let query = interaction.options.getString('relic');
    if (query.match(/[^A-Za-z0-9-: ]/g)) {
      return await interaction.reply({
        content: `Invalid input, only accept \`Alphanumeric\`, \`-\`, \`:\` and \`Whitespace\` value. Please try again.`,
        ephemeral: true,
      });
    }

    try {
      await interaction.deferReply({ ephemeral: true });

      const data = JSON.parse(
        await fs.readFile(`${__dirname}/../../data/hsr-relics.json`, 'utf-8')
      );
      const relic = data.relics
        .map((rls) => rls.relics)
        .flat()
        .filter((relic) => relic.name.trim().toLowerCase() === query.toLowerCase().trim());

      if (!relic.length) throw new Error(`Could not found ${query}'s info. Please try again.`);

      const embed = new EmbedBuilder()
        .setTitle(`${relic[0].name}'s Info`)
        .setDescription(`${relic[0].description}`)
        .setThumbnail(`${relic[0].imageLink}`)
        .setFooter({
          iconURL: 'https://cdn.discordapp.com/emojis/1108450926286618795',
          text: `Last update: ${data.updateAt} (GMT +7)\nData is fetched from Prydwen`,
        });

      return await interaction.editReply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.log(error);
      return await interaction.editReply({ content: `${error.message}`, ephemeral: true });
    }
  },
};
