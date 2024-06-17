const { Events } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const roleId = '808030499653025833';

        try {
            // Assign the role to the member
            await member.roles.add(roleId);
            console.log(`Assigned role ${roleId} to ${member.user.tag}`);
        } catch (error) {
            console.error(`Failed to assign role ${roleId} to ${member.user.tag}:`, error);
        }
    },
};
