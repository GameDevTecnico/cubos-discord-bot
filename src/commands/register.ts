import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import * as state from "../state.js";

export const data = new SlashCommandBuilder()
    .setName('register')
    .setDescription('Registers a GitHub username with a Discord user')
    .addUserOption(option => option.setName('discord-user').setDescription('The Discord user to register').setRequired(true))
    .addStringOption(option => option.setName('github-username').setDescription('The GitHub username to register').setRequired(true));

export async function execute(interaction: CommandInteraction) {
    const discordUser = interaction.options.get('discord-user').user;
    const githubUsername = interaction.options.get('github-username').value as string;

    // Check if the GitHub username is already registered.
    if (state.data.some(developer => developer.githubUsername === githubUsername)) {
        await interaction.reply({ content: `The GitHub username ${githubUsername} is already registered`, ephemeral: true });
        return;
    }

    // Check if the Discord user is already registered.
    if (state.data.some(developer => developer.discordId === discordUser.id)) {
        await interaction.reply({ content: `The Discord user ${discordUser.id} is already registered`, ephemeral: true });
        return;
    }

    // Register the GitHub username.
    state.data.push({
        discordId: discordUser.id,
        githubUsername,
        pendingReviews: [],
    });

    state.save();

    await interaction.reply({ content: `The Discord user id ${discordUser.id} has been registered with GitHub username ${githubUsername}`, ephemeral: true });
}
