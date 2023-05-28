const fs = require('fs/promises');
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require('discord.js');

module.exports = {
  config: new SlashCommandBuilder()
    .setName('character-info')
    .setDescription('Show specific character info')
    .addStringOption((opt) =>
      opt
        .setName('character')
        .setDescription("Enter character's name")
        .setRequired(true)
        .setAutocomplete(true)
    ),
  category: 'star-rail',
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

      const data = JSON.parse(await fs.readFile(`${__dirname}/../../data/hsr-chars.json`, 'utf-8'));
      const character = data.characters
        .map((chars) => chars.characters)
        .flat()
        .filter((char) => char.name.trim().toLowerCase() === query.toLowerCase());

      if (!character.length) throw new Error(`Could not found ${query}'s info. Please try again.`);

      const embed = new EmbedBuilder()
        .setTitle(`(${character[0].rarity})${character[0].name}'s Info`)
        .setDescription(`Element: \`${character[0].element}\`\nPath: \`${character[0].path}\``)
        .setThumbnail(`${character[0].imageLink}`)
        .addFields([
          {
            name: `Skills`,
            value: !character[0].skills.length
              ? `Skills not available for this character`
              : character[0].skills
                  .map((skill) => `\`${skill.name}\`\n(${skill.skillType.join(', ')})`)
                  .join('\n\n'),
            inline: true,
          },
          {
            name: `Traces`,
            value: !character[0].majorTraces.length
              ? `Traces not available for this character`
              : character[0].majorTraces
                  .map(
                    (trace) =>
                      `\`${trace.name}\`\n(${trace.skillType.join(
                        ', '
                      )})\n__Minor Traces__:\n${trace.smallTraces
                        .map((small) => `${small.statName}: ${small.value}`)
                        .join('\n')}`
                  )
                  .join('\n\n'),
            inline: true,
          },
          {
            name: '\u200b',
            value: '\u200b',
          },
          {
            name: `Stats`,
            value: !character[0].stats.length
              ? `Stats not available for this character`
              : character[0].stats.map((stat) => `${stat.name}: ${stat.detail}`).join('\n'),
            inline: true,
          },
          {
            name: `Ascension Materials`,
            value: !character[0].materials.length
              ? `Ascension Materials not available for this character`
              : character[0].materials.map((material) => material).join('\n'),
            inline: true,
          },
        ])
        .setFooter({
          iconURL: `https://cdn.discordapp.com/emojis/1108450926286618795`,
          text: `Last update: ${data.updateAt} (GMT +7)\nData is fetched from Prydwen`,
        });

      const buildSelect = new StringSelectMenuBuilder()
        .setCustomId('more-info')
        .setPlaceholder('More Information')
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel("Check this character's build")
            .setValue(`${query}-build`)
            .setEmoji('1109450819838939157'),
          new StringSelectMenuOptionBuilder()
            .setLabel("Check this character's detail skill info")
            .setValue(`${query}-skill`)
            .setEmoji('1111951514186027068'),
          new StringSelectMenuOptionBuilder()
            .setLabel("Check this character's detail trace info")
            .setValue(`${query}-trace`)
            .setEmoji('1111951631676887060')
        );

      const row = new ActionRowBuilder().addComponents(buildSelect);

      return await interaction.editReply({ embeds: [embed], components: [row], ephemeral: true });
    } catch (error) {
      console.log(error);
      return await interaction.editReply({ content: `${error.message}`, ephemeral: true });
    }
  },
};
