import { CommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import * as state from "../state.js";

export const data = new SlashCommandBuilder()
    .setName('deregister')
    .setDescription('Deregisters a previously registered GitHub username')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option => option.setName('discord-user').setDescription('The Discord user to register').setRequired(true));

export async function execute(interaction: CommandInteraction) {
    const discordUser = interaction.options.get('discord-user').user;

    // Check if the Discord user is registered.
    const developerIndex = state.data.findIndex(developer => developer.discordId === discordUser.id);

    if (developerIndex === -1) {
        await interaction.reply({ content: `The Discord user ${discordUser.id} is not registered`, ephemeral: true });
        return;
    }

    // Deregister the GitHub username.
    state.data.splice(developerIndex, 1);

    state.save();

    await interaction.reply({ content: `The Discord user ${discordUser.id} has been deregistered`, ephemeral: true });
}
