const fs = require('fs/promises');

module.exports = {
  config: {
    name: 'lc-info',
  },
  async execute(client, interaction) {
    const query = interaction.options.getString('light-cone', true);
    const lightCones = JSON.parse(
      await fs.readFile(`${__dirname}/../data/hsr-lightCones.json`, 'utf-8')
    )
      .lightCones.map((lcs) => lcs.lightCones)
      .flat()
      .filter((lc) => lc.name.trim().toLowerCase().startsWith(query.trim().toLowerCase()));

    return interaction.respond(
      lightCones.slice(0, 10).map((lc) => ({
        name: lc.name,
        value: lc.name,
      }))
    );
  },
};
