const add = require('date-fns/add')

const { isNumeric } = require('../utils/utils')
const Muted = require('../models/Muted')

const ROLESWITHMUTEPERMISSION = process.env.ROLESWITHMUTEPERMISSION
const MUTEDROLE = process.env.MUTEDROLE;

module.exports = {
  name: 'mute',
  description: 'Mute a member for temporary amount of time',
  guildOnly: true,
  args: true,
  usage: `<user|ID> [-d duration <minutes|hours|days>] [reason]`,
  async execute(message, args) {
    if (!message.member.roles.cache.some(r => ROLESWITHMUTEPERMISSION.includes(r.id))) return message.reply("Sorry, you don't have permissions to use this command!")

    const member = message.mentions.members.first() || message.guild.members.get(args[0]);

    // Check if the user is in the server
    if (!member) return message.reply("User is not in this server")

    if (member.roles.cache.has(MUTEDROLE)) return message.reply("User is already muted!")

    let reason;
    let mutedUntil;

    if (args[1] === '-d') {
      const acceptedUnitsOfTime = ['minutes', 'hours', 'days']
      var duration = args[2];
      var unit = args[3];
      reason = args.slice(4).join(' ');

      if (unit === "minute" || unit === "hour" || unit === "day") unit = unit.concat('s')

      if (!isNumeric(duration)) return message.reply("Invalid duration. Time must be a number.")

      if (!acceptedUnitsOfTime.includes(unit)) return message.reply("Invalid unit of time.")

      mutedUntil = add(new Date(), {
        [unit]: duration
      })
    } else {
      reason = args.slice(1).join(' ');
    }

    if (!reason) reason = "No reason provided"

    const guildId = member.guild.id;

    const query = {
      userId: member.user.id,
      username: member.user.username,
      guildId,
      mutedUntil
    }

    const muted = new Muted(query)

    try {
      // Create muted object for db
      await muted.save()

      // Set to muted role so they can't send messages
      await member.roles.add(MUTEDROLE, reason)

      message.reply(`${member.user.tag} has been muted ${mutedUntil ? `for ${duration} ${unit}` : null}. Reason: ${reason}`)
    } catch (e) {
      message.reply(`Sorry ${message.author}, I couldnt mute because of : ${e}`)
    }
  }
}