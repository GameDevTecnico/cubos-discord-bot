import { Client, GatewayIntentBits } from "discord.js";

export default new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
    ]
});
