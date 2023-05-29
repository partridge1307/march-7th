const notify = require('../../notify');

module.exports = {
  config: {
    name: 'interactionCreate',
    player: false,
    once: false,
  },
  async execute(client, interaction) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        console.log(`No matching ${interaction.commandName} was found`);
        client.commands.delete(interaction.commandName);
        return;
      }

      try {
        await command.execute(client, interaction);
        await notify.execute(client, interaction);
      } catch (error) {
        console.log(error);
      }
    } else if (interaction.isButton()) {
      const button = client.buttons.get(interaction.customId);
      if (!button) {
        console.log(`No matching button ${interaction.customId} was found`);
        client.buttons.delete(interaction.customId);
        return;
      }

      try {
        await button.execute(client, interaction);
        await notify.execute(client, interaction);
      } catch (error) {
        console.log(error);
      }
    } else if (interaction.isModalSubmit()) {
      const modal = client.modals.get(interaction.customId);
      if (!modal) {
        console.log(`No matching modal ${interaction.customId} was found`);
        client.modals.delete(interaction.customId);
        return;
      }

      try {
        await modal.execute(client, interaction);
        await notify.execute(client, interaction);
      } catch (error) {
        console.log(error);
      }
    } else if (interaction.isStringSelectMenu()) {
      const stringSelectMenu = client.stringMenus.get(interaction.customId);
      if (!stringSelectMenu) {
        console.log(`No matching string select menu ${interaction.customId} was found`);
        client.stringMenus.delete(interaction.customId);
        return;
      }

      try {
        await stringSelectMenu.execute(client, interaction);
        await notify.execute(client, interaction);
      } catch (error) {
        console.log(error);
      }
    } else if (interaction.isAutocomplete()) {
      const autoComplete = client.autoCompletes.get(interaction.commandName);
      if (!autoComplete) {
        console.log(`No matching auto complete ${interaction.commandName} was found`);
        client.autoCompletes.delete(interaction.commandName);
        return;
      }

      try {
        await autoComplete.execute(client, interaction);
      } catch (error) {
        if (error.message !== 'Query is required!' && error.message === 'Unknown interaction') {
          console.log(error.requestBody);
        } else if (error.message !== 'Query is required!') {
          console.log(error);
        }
      }
    }
  },
};
