const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('winactie')
        .setDescription('Lees het bericht in #announcements voor informatie.')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute(interaction) {
        const now = new Date();
        const beginDate = new Date('2024-06-19T15:00:00+02:00');
        const endDate = new Date('2024-06-29T23:59:59+02:00');
        if (now < beginDate || now > endDate) {
            interaction.reply("Er is momenteel geen winactie gaande.")
            return
        }

        const modal = new ModalBuilder()
            .setCustomId('giveaway')
            .setTitle('Winactie');

        const favoriteColorInput = new TextInputBuilder()
            .setCustomId('submission')
            .setLabel("Plak je inzending in dit tekstvak.")
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(1)
            .setRequired(true);

        const random1 = Math.floor(Math.random() * 6) + 5,
            random2 = Math.floor(Math.random() * 4) + 1,
            operator = Math.random() > 0.5 ? '+' : '-'

        const hobbiesInput = new TextInputBuilder()
            .setCustomId('verification')
            .setLabel(`Los op: ${random1} ${operator} ${random2}`)
            .setMaxLength(2)
            .setMinLength(1)
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

        // An action row only holds one text input,
        // so you need one action row per text input.
        const firstActionRow = new ActionRowBuilder().addComponents(favoriteColorInput);
        const secondActionRow = new ActionRowBuilder().addComponents(hobbiesInput);

        // Add inputs to the modal
        modal.addComponents(firstActionRow, secondActionRow);

        // Show the modal to the user
        await interaction.showModal(modal);
        await interaction.awaitModalSubmit({ time: 120_000, filter: modalInteraction => !!modalInteraction })
            .then(async modalInteraction => {
                try {
                    const verification = Number(modalInteraction.fields.getTextInputValue('verification'))
                    const expectedAnsw = operator === '+'
                        ? random1 + random2
                        : random1 - random2

                    if (isNaN(verification) || verification !== expectedAnsw) {
                        throw new Error(`Je hebt de rekenvraag niet goed beantwoord (${random1} ${operator} ${random2} ≠ ${modalInteraction.fields.getTextInputValue('verification')}). Probeer het opnieuw.`)
                    }

                    const submission = { userId: modalInteraction.user.id, ...JSON.parse(atob(modalInteraction.fields.getTextInputValue('submission'))) }

                    if (!submission.title === 'Magister Theme Contest' || !submission.name?.length > 4 || !submission.school?.length > 4 || !submission.options) {
                        throw new Error("Je inzending is ongeldig. Kopieer je inzending vanuit Magister door `Ctrl` `Shift` `\\` in te drukken en te rechtsklikken op het Magister-logo. Probeer het vervolgens opnieuw.")
                    }

                    const channelId = '1252718355291308072';
                    const channel = await interaction.client.channels.fetch(channelId);
                    const messages = await channel.messages.fetch();

                    if (messages.some((msg) => JSON.parse(msg.content.slice(7, -3))?.userId === modalInteraction.user.id || JSON.parse(msg.content.slice(7, -3))?.name === submission.name)) {
                        throw new Error("Je hebt al eerder een inzending gedaan. Je mag maximaal één keer inzenden.")
                    }

                    channel.send('```json\n' + JSON.stringify(submission, null, 2) + '```')

                    modalInteraction.reply({ content: "Thema ingezonden!", ephemeral: true })
                } catch (error) {
                    modalInteraction.reply({ content: `Thema niet ingezonden.\n\n${error}`.replace('Error: ', ''), ephemeral: true })
                }
            })
            .catch(err => console.log('No modal submit interaction was collected'));
    },
};
