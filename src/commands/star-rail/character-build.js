const fs = require('fs/promises');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  config: new SlashCommandBuilder()
    .setName('character-build')
    .setDescription('Get build of specific character in HSR')
    .addStringOption((opt) =>
      opt
        .setName('character')
        .setDescription("Enter character' name")
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
        .setTitle(`(${character[0].rarity})${character[0].name}'s Build`)
        .setDescription(
          `Element: \`${character[0].element}\`\nPath: \`${character[0].path}\`\n\nThis is just a reference. Feel free to build your own`
        )
        .setThumbnail(`${character[0].imageLink}`)
        .addFields([
          {
            name: `Pros and Cons`,
            value: !character[0].prosAndCons.length
              ? `Pros and Cons not available for this character`
              : character[0].prosAndCons
                  .map((rv) => `__${rv.title}__:\n${rv.content.map((c) => `-${c}`).join('\n')}`)
                  .join('\n\n'),
            inline: true,
          },
          {
            name: `Best Team`,
            value: !character[0].bestTeam.length
              ? `Best team not available for this character`
              : character[0].bestTeam
                  .map(
                    (team) => `__${team.title}__:\n${team.characters.map((chr) => chr).join('\n')}`
                  )
                  .join('\n\n'),
            inline: true,
          },
          {
            name: '\u200b',
            value: '\u200b',
          },
        ])
        .addFields(
          !character[0].builds.length
            ? { name: 'Build', value: 'Build not available for this character' }
            : character[0].builds.map((build) => {
                return {
                  name: build.tabName,
                  value: `__Relic__:\n${build.relic
                    .map((r) => r)
                    .join('\n')}\n\n__Planetary__:\n${build.planetary
                    .map((pl) => pl)
                    .join('\n')}\n\n__Light Cone__:\n${build.lightCone
                    .map((lc) => lc)
                    .join('\n')}\n\n__Best Stats__:\n${build.mainStats
                    .map((st) => `${st.title} ${st.stat}`)
                    .join('\n')}\n\n__Other__:\n${build.subStats
                    .map((st) => `${st.title} ${st.stat}`)
                    .join('\n')}`,
                  inline: true,
                };
              })
        )
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
