const fs = require('fs/promises');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const types = [
  { name: 'All', value: 0 },
  { name: 'Physical', value: 1 },
  { name: 'Fire', value: 2 },
  { name: 'Ice', value: 3 },
  { name: 'Lightning', value: 4 },
  { name: 'Wind', value: 5 },
  { name: 'Quantum', value: 6 },
  { name: 'Imaginary', value: 7 },
];

module.exports = {
  config: new SlashCommandBuilder()
    .setName('characters')
    .setDescription('Show all characters in Honkai: Star Rail')
    .addNumberOption((opt) =>
      opt
        .setName('type')
        .setDescription('Select element you want to display')
        .setRequired(true)
        .addChoices(...types)
    ),
  category: 'star-rail',
  async execute(client, interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });
      const type = interaction.options.getNumber('type');
      const name = type === 0 ? 'All' : types.find((t) => t.value === type)?.name;

      const data = JSON.parse(await fs.readFile(`${__dirname}/../../data/hsr-chars.json`, 'utf-8'));
      if (!data.characters.length) throw new Error("Could not found character's info");

      const embed = new EmbedBuilder()
        .setTitle("Honkai: Star Rail's characters")
        .addFields(
          name === 'All'
            ? data.characters.map((item) => {
                const characters = item.characters.map((character) => character.name).join(', ');
                return {
                  name: `${item.type} (${item.characters.length})`,
                  value: characters,
                };
              })
            : {
                name: name,
                value: data.characters
                  .find((chrs) => chrs.type === name)
                  ?.characters.map((char) => char.name)
                  .join(', '),
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
