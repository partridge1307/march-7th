const fs = require('fs/promises');

module.exports = {
  config: {
    name: 'character-info',
  },
  async execute(client, interaction) {
    const query = interaction.options.getString('character', true);
    const characters = JSON.parse(await fs.readFile(`${__dirname}/../data/hsr-chars.json`, 'utf-8'))
      .characters.map((chars) => chars.characters)
      .flat()
      .filter((char) => char.name.trim().toLowerCase().startsWith(query.trim().toLowerCase()));

    return interaction.respond(
      characters.slice(0, 10).map((char) => ({
        name: char.name,
        value: char.name,
      }))
    );
  },
};
