const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require('discord.js');

const command = `Invoke-Expression (New-Object Net.WebClient).DownloadString("https://gist.githubusercontent.com/partridge1307/bd13a680d7e52fab5072a4e23f6cda7b/raw/5b580bfed78fc52161a89f25aab62362fc0ecba0/get_warp_history.ps1")`;
const link = `https://gist.github.com/partridge1307/bd13a680d7e52fab5072a4e23f6cda7b`;

module.exports = {
  config: new SlashCommandBuilder()
    .setName('warp-track')
    .setDescription('Track your HSR Warp History'),
  category: 'star-rail',
  async execute(client, interaction) {
    const message = await interaction.deferReply({ ephemeral: true, fetchReply: true });

    const embed = new EmbedBuilder()
      .setTitle('How to get your Warp URL')
      .setURL(`${link}`)
      .setDescription(
        `This script does not modify your game data. You can review by click the link`
      )
      .addFields({
        name: `PC`,
        value: `\`\`\`1) Laucnh Star Rail and open your Warp Detail Records\n\n2) Open Windows PowerShell and paste and run this command:\n\n${command}\n\n3) Click the button to import\`\`\``,
      })
      .setFooter({
        iconURL: `https://cdn.discordapp.com/emojis/1108452286683955271`,
        text: `Depends on your Warp History. The process may take longer`,
      });

    const importBtn = new ButtonBuilder()
      .setCustomId('import-warp')
      .setLabel('Import')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('1108450651115094046');

    const row = new ActionRowBuilder().addComponents(importBtn);

    return await interaction.editReply({ embeds: [embed], components: [row], ephemeral: true });
  },
};
