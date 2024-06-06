import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

export type Command = {
    data: SlashCommandBuilder;
    execute: (interaction: CommandInteraction) => void;
};

function extractCommands(path: string): Command[] {
    if (fs.lstatSync(path).isDirectory()) {
        return fs.readdirSync(path).flatMap(file => extractCommands(path + '/' + file));
    } else if (path.endsWith('.js')) {
        const cmd = require(path);
        if ('data' in cmd && 'execute' in cmd) {
            return [cmd];
        } else {
            console.warn(`The command at ${path} is missing a required "data" or "execute" property`);
        }
    }

    return [];
}

const commands = extractCommands(path.join(__dirname, 'commands'));
export default commands;
