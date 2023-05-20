const fs = require('fs/promises');
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require('discord.js');

const upperCaseFirstLetter = (string) => {
  string = string.split(' ').map((val) => val.charAt(0).toUpperCase() + val.slice(1));
  return string.join(' ');
};

module.exports = {
  config: new SlashCommandBuilder()
    .setName('character-info')
    .setDescription('Show specific character info')
    .addStringOption((opt) =>
      opt.setName('character').setDescription("Enter character's name").setRequired(true)
    ),
  async execute(client, interaction) {
    let query = interaction.options.getString('character');
    if (query.match(/[^A-Za-z0-9() ]/g)) {
      return await interaction.reply({
        content: `Invalid input, only accept \`Alphanumeric\`, \`(\`, \`)\` and \`Whitespace\` value. Please try again.`,
        ephemeral: true,
      });
    }

    try {
      await interaction.deferReply({ ephemeral: true });
      query = upperCaseFirstLetter(query);

      const data = JSON.parse(await fs.readFile(`${__dirname}/../../data/hsr-chars.json`, 'utf-8'));
      const character = data.characters
        .map((chars) => chars.characters)
        .flat()
        .filter((char) => char.name.trim() === query);

      if (!character.length) throw new Error(`Could not found ${query}'s info. Please try again.`);

      const embed = new EmbedBuilder()
        .setTitle(`${character[0].name}'s Info`)
        .setDescription(`Level 80`)
        .addFields([
          {
            name: `Stats`,
            value: !character[0].stats.length
              ? `Stats are not available for this character`
              : character[0].stats.map((stat) => `${stat.name}: ${stat.detail}`).join('\n'),
          },
          {
            name: `Ascension Materials`,
            value: !character[0].materials.length
              ? `Ascension Materials are not available for this character`
              : character[0].materials.map((material) => material).join('\n'),
          },
        ])
        .setFooter({
          iconURL: `https://cdn.discordapp.com/emojis/1108450926286618795`,
          text: `Last update: ${data.updateAt} (GMT +7)`,
        });

      const buildSelect = new StringSelectMenuBuilder()
        .setCustomId('check-build')
        .setPlaceholder("Check this character's build")
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('Click here to navigate to build')
            .setValue(`${query}`)
            .setEmoji('1109450819838939157')
        );

      const row = new ActionRowBuilder().addComponents(buildSelect);

      return await interaction.editReply({ embeds: [embed], components: [row], ephemeral: true });
    } catch (error) {
      console.log(error);
      return await interaction.editReply({ content: `${error.message}`, ephemeral: true });
    }
  },
};
