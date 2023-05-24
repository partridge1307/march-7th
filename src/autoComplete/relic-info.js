const fs = require('fs/promises');

module.exports = {
  config: {
    name: 'relic-info',
  },
  async execute(client, interaction) {
    const query = interaction.options.getString('relic', true);
    const relics = JSON.parse(await fs.readFile(`${__dirname}/../data/hsr-relics.json`, 'utf-8'))
      .relics.map((rls) => rls.relics)
      .flat()
      .filter((r) => r.name.trim().toLowerCase().startsWith(query.trim().toLowerCase()));

    return interaction.respond(
      relics.slice(0, 10).map((r) => ({
        name: r.name,
        value: r.name,
      }))
    );
  },
};
