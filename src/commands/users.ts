import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import * as state from "../state.js";

export const data = new SlashCommandBuilder()
    .setName('users')
    .setDescription('Lists all registered users');

export async function execute(interaction: CommandInteraction) {
    const users = state.data.map(developer => {
        return `<@${developer.discordId}>: ${developer.githubUsername}`;
    });

    const embed = new EmbedBuilder()
        .setTitle('Registered Users')
        .setDescription(users.length === 0 ? 'No users registered' : users.join('\n'));

    await interaction.reply({ embeds: [embed], ephemeral: true });
}
