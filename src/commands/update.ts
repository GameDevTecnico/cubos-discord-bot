import { CommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import update from "../update.js";

export const data = new SlashCommandBuilder()
    .setName('update')
    .setDescription('Triggers a bot update')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    update();
    await interaction.editReply('Bot update triggered!');
}
