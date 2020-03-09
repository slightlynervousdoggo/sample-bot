const Muted = require('../models/Muted')

const ROLESWITHMUTEPERMISSION = process.env.ROLESWITHMUTEPERMISSION
const MUTEDROLE = process.env.MUTEDROLE;

module.exports = {
  name: 'unmute',
  description: 'Unmute a member',
  async execute(message, args) {
    if (!message.member.roles.cache.some(r => ROLESWITHMUTEPERMISSION.includes(r.id))) return message.reply("Sorry, you don't have permissions to use this command!")

    const member = message.mentions.members.first() || message.guild.members.get(args[0]);

    // Check if the user is in the server
    if (!member) return message.reply("User is not in this server")

    try {
      const mutedUser = await Muted.findOne({ userId: member.id, guildId: member.guild.id })

      // If the user isn't in db, check if they have the muted role (in case they were manually assigned the muted role)
      if (!mutedUser) {
        if (!member.roles.some(r => r.id === MUTEDROLE)) return message.reply(`${member.user.tag} is already unmuted`)
        await member.roles.remove(MUTEDROLE)
        return message.reply(`${member.user.tag} is now unmuted`)
      }

      await member.roles.remove(MUTEDROLE)
      await Muted.deleteOne({ _id: mutedUser._id })
      message.reply(`${member.user.tag} is now unmuted`)
    } catch (e) {
      message.reply(`Sorry ${message.author}, I couldn't unmute because of : ${e}`)
    }
  }
}