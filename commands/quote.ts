import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import fetchAll from "../utils/fetchAll";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Een willekeurig citaat uit het kanaal #quotes.')
        .setDefaultMemberPermissions('0'),
    async execute(interaction, client) {
        await interaction.deferReply();

        const messages = await fetchAll(client.channels.cache.get('1020039878295179334')),
            message = messages[Math.floor(Math.random() * messages.length)];
        
        const
            messageText = message.content?.replace('_ _', '').replace(/^\s+|\s+$/g, '') || null,
            messageAttachment = message.attachments?.first()?.url || null;
        
        const quoteContent = messageAttachment || `>>> ${messageText}` || 'Er is een fout opgetreden.'

        await interaction.editReply({
            content: quoteContent,
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('Naar citaat navigeren')
                            .setStyle(ButtonStyle.Link)
                            .setURL(message.url)
                    )
            ]
        });
    },
};
