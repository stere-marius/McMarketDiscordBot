
const { MessageEmbed } = require("discord.js");

const createEmbedded = (title, description, color) => {
  const embed = new MessageEmbed()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp()
    .setFooter({
      text: "TripleBot",
      iconURL:
        "https://cdn.discordapp.com/attachments/939911214857871420/940298810649899048/TrippleZone_pfp_bgless.png",
    });

  return embed;
};

module.exports = { createEmbedded };