const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fetchAll = require('discord-fetch-all');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clip')
        .setDescription('Een willekeurige videoclip uit het kanaal #clips.')
        .setDefaultMemberPermissions('0'),
    async execute(interaction, client) {
        await interaction.deferReply();

        const messages = await fetchAll.messages(client.channels.cache.get('995766209708576829')),
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
                            .setLabel('Naar clip navigeren')
                            .setStyle(ButtonStyle.Link)
                            .setURL(message.url)
                    )
            ]
        });
    },
};
