const { SlashCommandBuilder } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});

const openai = new OpenAIApi(configuration);

module.exports = {
  config: new SlashCommandBuilder()
    .setName('chat')
    .setDescription('Chat with ChatGPT')
    .addStringOption((option) =>
      option.setName('content').setDescription('Enter your query').setRequired(true)
    ),
  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true });
    const input = interaction.options.getString('content');

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: `${input.trim()}` }],
      max_tokens: 700,
    });
    const result = completion.data.choices[0].message.content;

    return await interaction.followUp({ content: `${result}`, ephemeral: true });
  },
};
