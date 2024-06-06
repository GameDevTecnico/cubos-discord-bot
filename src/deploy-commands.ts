import "dotenv/config";
import { REST, Routes } from 'discord.js';
import commands from './commands.js';

const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
    try {
        await rest.put(
            Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
            { body: commands.map(cmd => cmd.data.toJSON()) }
        );
    } catch (error) {
        console.error(error);
    }
})();
