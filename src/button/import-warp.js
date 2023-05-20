const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  config: {
    name: 'import-warp',
  },
  async execute(client, interaction) {
    const modal = new ModalBuilder().setCustomId('submit-warp').setTitle('Check your luck');
    const submitInput = new TextInputBuilder()
      .setCustomId('submit-warp')
      .setLabel('Your Warp URL History')
      .setPlaceholder('Enter your Warp URL History')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);
    const showTypeInput = new TextInputBuilder()
      .setCustomId('warp-show-type')
      .setLabel('Show options | (Simple or Detail)')
      .setPlaceholder('Only accept Simple or Detail (default: Simple)')
      .setValue('Simple')
      .setStyle(TextInputStyle.Short);

    const submitRow = new ActionRowBuilder().addComponents(submitInput);
    const showTypeRow = new ActionRowBuilder().addComponents(showTypeInput);
    modal.addComponents(submitRow, showTypeRow);

    return await interaction.showModal(modal);
  },
};
