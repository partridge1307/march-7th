const { EmbedBuilder } = require('discord.js');
const getWishData = require('../utils/getWishData');

const emojiLink = (name, emojiId) => {
  return `<:${name}:${emojiId}>`;
};

const trimText = (dataArr) => {
  const text = `${dataArr.map((val) => `${val.pity}: ${val.item.name}`).join('\n')}`;
  return text.substring(0, 400);
};

module.exports = {
  config: {
    name: 'submit-warp',
  },
  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true });
    const submitURL = interaction.fields.getTextInputValue('submit-warp');
    const typeSubmit = interaction.fields.getTextInputValue('warp-show-type');

    if (!submitURL.match(/http.+?&sign_type=.+?&lang=.+?&authkey=.+?&game_biz=.+?/)) {
      return await interaction.editReply({ content: `Invalid URL format.`, ephemeral: true });
    }
    if (!typeSubmit.match(/(Simple|Detail)/i)) {
      return await interaction.editReply({
        content: `Invalid show option value, only accept \`Simple\` or \`Detail\` value. Please try again`,
        ephemeral: true,
      });
    }

    const wish = await getWishData(submitURL);
    if (!wish.status) {
      return await interaction.editReply({ content: `URL timeout.`, ephemeral: true });
    }

    const datas = wish.data;
    const uid = datas.find((data) => data.uid).uid;
    const embed = new EmbedBuilder()
      .setTitle(`${interaction.user.tag}'s Warp`)
      .setDescription(`UID: ${uid}`)
      .setColor('Red')
      .addFields(
        datas.map((item) => {
          if (item.data !== 'No Warp detected') {
            // const five_star_text = `${item.data.five_star
            //   .map((val) => `${val.pity}: ${val.item.name}`)
            //   .join('\n')}`;
            const trimmedFiveStarText = trimText(item.data.five_star);
            // const four_star_text = `${item.data.four_star
            //   .map((val) => `${val.pity}: ${val.item.name}`)
            //   .join('\n')}`;
            const trimmedFourStarText = trimText(item.data.four_star);

            let nextFiveStar = item.list
              .reverse()
              .findIndex((item) => Number(item.rank_type) === 5);
            let nextFourStar = item.list.findIndex((item) => Number(item.rank_type) === 4);

            if (!nextFiveStar && nextFiveStar !== 0) nextFiveStar = item.list.length;
            if (!nextFourStar && nextFourStar !== 0) nextFourStar = item.list.length;

            return {
              name: item.banner,
              value: typeSubmit.match(/(Detail)/i)
                ? `||${emojiLink('jade', '1108450501474922556')}Spent: ${
                    item.length * 160
                  }\nAVG 5${emojiLink('five_star', '1108451166188224583')}: ${
                    item.data.avgFiveStar
                  }\nNext 5${emojiLink('five_star', '1108451166188224583')}: ${
                    91 - nextFiveStar
                  }\n${emojiLink('five_star', '1108451166188224583')}Pity:\n${
                    trimmedFiveStarText.length === 400
                      ? `${trimmedFiveStarText}...`
                      : `${trimmedFiveStarText}`
                  }\n\nAVG 4${emojiLink('four_star', '1108451231938121861')}: ${
                    item.data.avgFourStar
                  }\nNext 4${emojiLink('four_star', '1108451231938121861')}: ${
                    11 - nextFourStar
                  }\n${emojiLink('four_star', '1108451231938121861')}Pity:\n${
                    trimmedFourStarText.length === 400
                      ? `${trimmedFourStarText}...`
                      : `${trimmedFourStarText}`
                  }||`
                : `||${emojiLink('jade', '1108450501474922556')}Spent: ${
                    item.length * 160
                  }\nAVG 5${emojiLink('five_star', '1108451166188224583')}: ${
                    item.data.avgFiveStar
                  }\nNext 5${emojiLink('five_star', '1108451166188224583')}: ${
                    91 - nextFiveStar
                  }\nAVG 4${emojiLink('four_star', '1108451231938121861')}: ${
                    item.data.avgFourStar
                  }\nNext 4${emojiLink('four_star', '1108451231938121861')}: ${
                    11 - nextFourStar
                  }\n${emojiLink('five_star', '1108451166188224583')}Pity:\n${
                    trimmedFiveStarText.length === 400
                      ? `${trimmedFiveStarText}...`
                      : `${trimmedFiveStarText}`
                  }||`,
              inline: true,
            };
          } else {
            return {
              name: item.banner,
              value: item.data,
              //inline: true,
            };
          }
        })
      )
      .setFooter({
        iconURL: `https://cdn.discordapp.com/emojis/1104531562906779658`,
        text: `If you have any error please contact partridge#4447`,
      });

    return await interaction.editReply({ embeds: [embed], ephemeral: true });
  },
};
