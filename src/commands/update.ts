import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { update } from "../reminders.js";

export const data = new SlashCommandBuilder()
    .setName('update')
    .setDescription('Triggers a bot update');

export async function execute(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    update();
    await interaction.editReply('Bot update triggered!');
}
