import "dotenv/config";
import * as Discord from "discord.js";
import commands from "./commands.js";
import update from "./update.js";
import discord from "./api/discord.js";

discord.on("error", (e) => console.error(e));
discord.on("warn", (e) => console.warn(e));
discord.on("debug", (e) => console.info(e));

discord.on(Discord.Events.ClientReady, async () => {
  console.log('Cubos bot online!');
});

discord.on(Discord.Events.InteractionCreate, async interaction => {
  if (!interaction.isCommand()) return;

  const command = commands.find(cmd => cmd.data.name === interaction.commandName);
  if (!command) return;
  console.log(`${interaction.user.globalName} is executing command ${command.data.name}`);

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

discord.login(process.env.DISCORD_BOT_TOKEN)

// Periodically update the bot. 
setInterval(() => {
  try {
    update();
  } catch (error) {
    console.error(error);
  }
}, 1000 * 60 * 60);
