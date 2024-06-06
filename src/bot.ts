require('dotenv').config()

import { Client, Events, GatewayIntentBits } from "discord.js";
import commands from "./commands";

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
  ]
});

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
client.on("debug", (e) => console.info(e));

client.on(Events.ClientReady, async () => {
  console.log('Cubos bot online!');
});

client.on(Events.InteractionCreate, interaction => {
  if (!interaction.isCommand()) return;

  const command = commands.find(cmd => cmd.data.name === interaction.commandName);
  if (!command) return;
  console.log(`Executing command ${command.data.name}`);

  try {
    command.execute(interaction);
  } catch (error) {
    console.error(error);
    interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

client.login(process.env.BOT_TOKEN)
