const fs = require('fs/promises');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const upperCaseFirstLetter = (string) => {
  string = string.split(' ').map((val) => val.charAt(0).toUpperCase() + val.slice(1));
  return string.join(' ');
};

module.exports = {
  config: new SlashCommandBuilder()
    .setName('character-build')
    .setDescription('Get build of specific character in HSR')
    .addStringOption((opt) =>
      opt.setName('character').setDescription("Enter character' name").setRequired(true)
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
        .setTitle(`${character[0].name}'s Build`)
        .setDescription(`This is just a reference. Feel free to build your own`)
        .addFields(
          !character[0].builds.length
            ? { name: 'Build', value: 'Build are not available for this character' }
            : character[0].builds.map((build) => {
                return {
                  name: build.tabName,
                  value: `__Relic__:\n${build.relic
                    .map((r) => r)
                    .join('\n')}\n\n__Planetary__:\n${build.planetary
                    .map((pl) => pl)
                    .join('\n')}\n\n__Light Cone__:\n${build.lightCone
                    .map((lc) => lc)
                    .join('\n')}\n\n__Best stats__:\n${build.stats
                    .map((stat) => stat.data)
                    .join('\n')}`,
                };
              })
        )
        .setFooter({
          iconURL: `https://cdn.discordapp.com/emojis/1108450926286618795`,
          text: `Last update: ${data.updateAt} (GMT +7)`,
        });

      return await interaction.editReply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.log(error);
      return await interaction.editReply({ content: `${error.message}`, ephemeral: true });
    }
  },
};
