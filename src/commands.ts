import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

export type Command = {
    data: SlashCommandBuilder;
    execute: (interaction: CommandInteraction) => Promise<void>;
};

async function extractCommands(path: string): Promise<Command[]> {
    if (fs.lstatSync(path).isDirectory()) {
        return (await Promise.all(fs.readdirSync(path).map(file => extractCommands(path + '/' + file)))).flat();
    } else if (path.endsWith('.js')) {
        const cmd = await import(path);
        if ('data' in cmd && 'execute' in cmd) {
            return [cmd];
        } else {
            console.warn(`The command at ${path} is missing a required "data" or "execute" property`);
        }
    }

    return [];
}

const commands = await extractCommands(path.join(import.meta.dirname, 'commands'));
export default commands;
