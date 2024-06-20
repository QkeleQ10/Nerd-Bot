const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('winactie')
        .setDescription('Lees het bericht in #announcements voor informatie.')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    async execute(interaction) {
        const now = new Date();
        const beginDate = new Date('2024-06-19T14:00:00+02:00');
        const endDate = new Date('2024-06-29T23:59:59+02:00');
        if (now < beginDate || now > endDate) {
            interaction.reply({ content: "Er is momenteel geen winactie gaande.", ephemeral: true })
            return
        }

        const modal = new ModalBuilder()
            .setCustomId('giveaway')
            .setTitle('Winactie');

        const random1 = Math.floor(Math.random() * 6) + 5,
            random2 = Math.floor(Math.random() * 4) + 1,
            operator = Math.random() > 0.5 ? '+' : '-'

        const verificationInput = new TextInputBuilder()
            .setCustomId('verification')
            .setLabel(`Los op: ${random1} ${operator} ${random2}`)
            .setMaxLength(2)
            .setMinLength(1)
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

        const submissionInput1 = new TextInputBuilder()
            .setCustomId('submission1')
            .setLabel("Plak deel 1 van je inzending.")
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(1)
            .setRequired(true);

        const submissionInput2 = new TextInputBuilder()
            .setCustomId('submission2')
            .setLabel("Plak deel 2 (indien van toepassing).")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);

        const submissionInput3 = new TextInputBuilder()
            .setCustomId('submission3')
            .setLabel("Plak deel 3 (indien van toepassing).")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);

        const submissionInput4 = new TextInputBuilder()
            .setCustomId('submission4')
            .setLabel("Plak deel 4 (indien van toepassing).")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);

        // An action row only holds one text input,
        // so you need one action row per text input.
        const row1 = new ActionRowBuilder().addComponents(verificationInput);
        const row2 = new ActionRowBuilder().addComponents(submissionInput1);
        const row3 = new ActionRowBuilder().addComponents(submissionInput2);
        const row4 = new ActionRowBuilder().addComponents(submissionInput3);
        const row5 = new ActionRowBuilder().addComponents(submissionInput4);

        // Add inputs to the modal
        modal.addComponents(row1, row2, row3, row4, row5);

        // Show the modal to the user
        await interaction.showModal(modal);
        await interaction.awaitModalSubmit({ time: 120_000, filter: modalInteraction => !!modalInteraction })
            .then(async modalInteraction => {
                let explanation = "Je inzending is ongeldig. Kopieer je inzending vanuit Magister door `Ctrl` `Shift` `Spatie` in te drukken en te rechtsklikken op het Magister-logo. Probeer het vervolgens opnieuw."
                try {
                    const verification = Number(modalInteraction.fields.getTextInputValue('verification'))
                    const expectedAnsw = operator === '+'
                        ? random1 + random2
                        : random1 - random2

                    if (isNaN(verification) || verification !== expectedAnsw) {
                        explanation = `Je hebt de rekenvraag niet goed beantwoord (${random1} ${operator} ${random2} ≠ ${modalInteraction.fields.getTextInputValue('verification')}). Probeer het opnieuw.`
                        throw new Error()
                    }

                    const encodedSubmission = [modalInteraction.fields.getTextInputValue('submission1'), modalInteraction.fields.getTextInputValue('submission2'), modalInteraction.fields.getTextInputValue('submission3'), modalInteraction.fields.getTextInputValue('submission4')].filter(e => e?.length > 0).join('')
                    const submission = { userId: modalInteraction.user.id, ...JSON.parse(atob(encodedSubmission)) }

                    if (!submission.title === 'Magister Theme Contest' || !submission.name?.length > 4 || !submission.school?.length > 4 || !submission.options?.ptheme) {
                        throw new Error()
                    }

                    const channelId = '1252718355291308072';
                    const channel = await interaction.client.channels.fetch(channelId);
                    const messages = await channel.messages.fetch();

                    if (messages.some((msg) => JSON.parse(msg.content.slice(7, -3))?.userId === modalInteraction.user.id || JSON.parse(msg.content.slice(7, -3))?.name === submission.name)) {
                        explanation = "Je hebt al eerder een inzending gedaan. Je mag maximaal één keer inzenden."
                        throw new Error()
                    }

                    const splitSubmission = JSON.stringify(submission, null, 2).match(new RegExp(`.{1,1085}`, 'g')) || []

                    for (let i = 0; i < splitSubmission.length; i++) {
                        await channel.send('```json\n' + splitSubmission[i] + '```')
                    }

                    await modalInteraction.reply({ content: "Thema ingezonden!", ephemeral: true })
                } catch (error) {
                    await modalInteraction.reply({ content: `Thema niet ingezonden.\n\n${explanation || error}`, ephemeral: true })
                }
            })
            .catch(err => console.log('No modal submit interaction was collected'));
    },
};
