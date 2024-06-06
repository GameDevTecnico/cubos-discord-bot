require('dotenv').config()

import { REST, Routes } from 'discord.js';
import commands from './commands';

const rest = new REST().setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands.map(cmd => cmd.data.toJSON()) }
        );
    } catch (error) {
        console.error(error);
    }
})();
