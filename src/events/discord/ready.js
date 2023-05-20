const { ActivityType } = require('discord.js');

const activityOptions = [
  { name: "Serval's hits", type: ActivityType.Listening },
  { name: 'game with Himeko', type: ActivityType.Playing },
  { name: "Astral's spaceship to get some food", type: ActivityType.Competing },
  { name: 'Trailblazer', type: ActivityType.Watching },
];

module.exports = {
  config: {
    name: 'ready',
    player: false,
    once: true,
  },
  async execute(client) {
    console.log(`${client.user.tag} is logged on ${client.guilds.cache.size} servers`);

    const channel = await client.channels.fetch('1074331354935873537');
    channel.send(`Live on ${client.guilds.cache.size} servers`);

    client.user.setPresence({
      activities: [{ name: "Astral's spaceship to get some food", type: ActivityType.Competing }],
      status: 'online',
    });

    setInterval(async () => {
      const option = Math.floor(Math.random() * activityOptions.length);

      await client.user.setPresence({
        activities: [
          {
            name: activityOptions[option].name,
            type: activityOptions[option].type,
          },
        ],
        status: 'online',
      });
    }, 600 * 1000);
  },
};
