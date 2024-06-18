const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription("I'll repeat!")
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('The message to send.')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The channel the message should be sent in.')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel')
        const message = interaction.options.getString('message')?.replace('\\n', '\n')
        if (channel) {
            await channel.send(message)
            await interaction.reply({ content: "Sent!", ephemeral: true });
        } else {
            await interaction.channel.send(message)
            await interaction.reply({ content: "Sent!", ephemeral: true });
        }
    },
};
