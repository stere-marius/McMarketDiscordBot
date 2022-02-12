const { Client, Intents, Collection } = require("discord.js");
const dotenv = require("dotenv");
const fs = require("fs");
const { registerCommands } = require("./deploy-commands.js");

const { run } = require("./events/guildMemberRemove.js");

dotenv.config();

registerCommands();

// Create a new client instance
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_PRESENCES,
  ],
});

// When the client is ready, run this code (only once)
client.once("ready", () => {
  const time = new Date();

  console.log(
    `I'm ready ${
      time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()
    }`
  );
});

client.commands = new Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  client.commands.set(command.data.name, command);
}

client.on("guildMemberRemove", async (member) => {
  await run(client, member);
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
