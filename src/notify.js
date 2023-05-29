const { EmbedBuilder } = require('discord.js');

module.exports = {
  async execute(client, interaction) {
    const embed = new EmbedBuilder()
      .setTitle("Please ignore this if you don't get 'This bot has not been verified'")
      .setURL(
        'https://discord.com/api/oauth2/authorize?client_id=1109375320718594078&permissions=32767&scope=bot%20applications.commands'
      )
      .setDescription(
        "That means I'm reached to 100 servers so I can not join any more server. Please add Herta (my friend) if you like me by click the title or add other bot. My master will update both me and her"
      );

    return await interaction.followUp({ embeds: [embed] });
  },
};
