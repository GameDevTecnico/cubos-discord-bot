import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import * as state from "../state.js";

export const data = new SlashCommandBuilder()
    .setName('users')
    .setDescription('Lists all registered users');

export async function execute(interaction: CommandInteraction) {
    const users = state.data.map(developer => {
        return `${developer.discordId} -> ${developer.githubUsername}`;
    });

    if (users.length === 0) {
        await interaction.reply({ content: 'No users registered', ephemeral: true });
    } else {
        await interaction.reply({ content: users.join('\n'), ephemeral: true });
    }
}
