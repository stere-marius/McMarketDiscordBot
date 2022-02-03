const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("echo")
    .setDescription("Replies with your input!"),
  async execute(interaction) {
    console.log(interaction.member.roles.add("785297299004719104"));
    await interaction.reply({
      content: "Salut",
      ephemeral: true,
    });
  },
};
