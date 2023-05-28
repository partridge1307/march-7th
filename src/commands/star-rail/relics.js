const fs = require('fs/promises');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const types = [
  { name: 'All', value: 0 },
  { name: 'Relic Set', value: 1 },
  { name: 'Planetary Ornament Set', value: 2 },
];

module.exports = {
  config: new SlashCommandBuilder()
    .setName('relics')
    .setDescription('Show all relics in Honkai: Star Rail')
    .addNumberOption((opt) =>
      opt
        .setName('type')
        .setDescription('Select relic type you want to display')
        .setRequired(true)
        .addChoices(...types)
    ),
  category: 'star-rail',
  async execute(client, interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });
      const type = interaction.options.getNumber('type');
      const name = type === 0 ? 'All' : types.find((t) => t.value === type)?.name;

      const data = JSON.parse(
        await fs.readFile(`${__dirname}/../../data/hsr-relics.json`, 'utf-8')
      );
      if (!data.relics.length) throw new Error("Could not found relics's info");

      const embed = new EmbedBuilder()
        .setTitle("Honkai: Star Rail's Relics")
        .addFields(
          name === 'All'
            ? data.relics.map((item) => {
                const relics = item.relics.map((relic) => relic.name).join(', ');

                return {
                  name: item.type,
                  value: relics,
                };
              })
            : {
                name: name,
                value: data.relics
                  .find((rls) => rls.type === name)
                  ?.relics.map((relic) => relic.name)
                  .join('\n'),
              }
        )
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
