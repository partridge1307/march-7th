const fs = require('fs/promises');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const types = [
  { name: 'All', value: 0 },
  { name: 'Abundance', value: 1 },
  { name: 'Destruction', value: 2 },
  { name: 'Erudition', value: 3 },
  { name: 'Harmony', value: 4 },
  { name: 'Hunt', value: 5 },
  { name: 'Nihility', value: 6 },
  { name: 'Preservation', value: 7 },
];

module.exports = {
  config: new SlashCommandBuilder()
    .setName('light-cones')
    .setDescription('Show available light cones in HSR')
    .addNumberOption((opt) =>
      opt
        .setName('path')
        .setDescription('Select path you want to display')
        .setRequired(true)
        .addChoices(...types)
    ),
  category: 'star-rail',
  async execute(client, interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });
      const type = interaction.options.getNumber('path');
      const name = type === 0 ? 'All' : types.find((t) => t.value === type)?.name;

      const data = JSON.parse(
        await fs.readFile(`${__dirname}/../../data/hsr-lightCones.json`, 'utf-8')
      );
      if (!data.lightCones.length) throw new Error('Could not found light cones data.');

      const embed = new EmbedBuilder()
        .setTitle("Honkai: Star Rail's light cones")
        .addFields(
          name === 'All'
            ? data.lightCones.map((item) => {
                const lightCones = item.lightCones.map((lightCone) => lightCone.name).join(', ');

                return {
                  name: `Path: ${item.type} (${item.lightCones.length})`,
                  value: lightCones,
                };
              })
            : {
                name: name,
                value: data.lightCones
                  .find((lcs) => lcs.type === name)
                  ?.lightCones.map((lc) => lc.name)
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
