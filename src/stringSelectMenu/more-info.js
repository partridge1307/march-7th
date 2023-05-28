const fs = require('fs/promises');
const { EmbedBuilder } = require('discord.js');

const getBuild = (character, data) => {
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
              .map((team) => `__${team.title}__:\n${team.characters.map((chr) => chr).join('\n')}`)
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
        ? { name: 'Build', value: 'Build available for this character' }
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

  return embed;
};

const getSkill = (character, data) => {
  const embed = new EmbedBuilder()
    .setTitle(`(${character[0].rarity})${character[0].name}'s Skill`)
    .setDescription(`Element: \`${character[0].element}\`\nPath: \`${character[0].path}\``)
    .setThumbnail(`${character[0].imageLink}`)
    .addFields(
      !character[0].skills.length
        ? {
            name: 'Skills\n(Shown for levels 1/10/12 | 1/6/7 for Basic)',
            value: `Skills not available for this character`,
          }
        : character[0].skills.map((skill) => ({
            name: `${skill.name}\n(${skill.skillType.join(', ')})`,
            value: skill.skillContent,
          }))
    )
    .setFooter({
      iconURL: `https://cdn.discordapp.com/emojis/1108450926286618795`,
      text: `Last update: ${data.updateAt} (GMT +7)\nData is fetched from Prydwen`,
    });

  return embed;
};

const getTrace = (character, data) => {
  const embed = new EmbedBuilder()
    .setTitle(`(${character[0].rarity})${character[0].name}'s Trace`)
    .setDescription(`Element: \`${character[0].element}\`\nPath: \`${character[0].path}\``)
    .setThumbnail(`${character[0].imageLink}`)
    .addFields(
      !character[0].majorTraces.length
        ? { name: 'Traces', value: `Traces not available for this character` }
        : character[0].majorTraces.map((trace) => ({
            name: `${trace.name}\n(${trace.skillType.join(', ')})`,
            value: `${trace.skillContent}\n\nMinor Traces: ${trace.smallTraces
              .map((small) => `\`${small.statName}\` ${small.value}`)
              .join(' ')}`,
          }))
    )
    .addFields([
      {
        name: 'Other Minor Traces',
        value: !character[0].minorTraces.length
          ? `Minor traces are not available for this character`
          : character[0].minorTraces
              .map((minor) => `\`${minor.name}\`: ${minor.unlockAt}`)
              .join('\n'),
      },
    ])
    .setFooter({
      iconURL: `https://cdn.discordapp.com/emojis/1108450926286618795`,
      text: `Last update: ${data.updateAt} (GMT +7)\nData is fetched from Prydwen`,
    });

  return embed;
};

module.exports = {
  config: {
    name: 'more-info',
  },
  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true });
    const selectedValue = interaction.values[0].split('-');
    try {
      const data = JSON.parse(await fs.readFile(`${__dirname}/../data/hsr-chars.json`, 'utf-8'));
      const character = data.characters
        .map((chars) => chars.characters)
        .flat()
        .filter((char) => char.name.trim().toLowerCase() === selectedValue[0].toLowerCase());

      if (!character.length)
        throw new Error(`Could not found ${selectedValue[0]}'s info. Please try again.`);

      let embed;
      if (selectedValue[1] === 'build') {
        embed = getBuild(character, data);
      } else if (selectedValue[1] === 'skill') {
        embed = getSkill(character, data);
      } else if (selectedValue[1] === 'trace') {
        embed = getTrace(character, data);
      }
      return await interaction.editReply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.log(error);
      return await interaction.editReply({ content: `${error.message}`, ephemeral: true });
    }
  },
};
