const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Command used to verify your purchase of a resource!")
    .addStringOption((option) =>
      option
        .setName("resource-name")
        .setDescription("Select the resource purchased")
        .setRequired(true)
        .addChoice("Deluxe Theme", "deluxe_theme")
        .addChoice("Xenforo Theme", "xenforo_theme")
        .addChoice("Tebex Theme", "tebex_theme")
    ),
  async execute(interaction) {
    const { options } = interaction;
    const resourceName = options.getString("resource-name");
    await interaction.reply(
      `Selected resource is ${options.getString("resource-name")}`
    );
  },
};
