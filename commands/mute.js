const add = require('date-fns/add')

const { isNumeric } = require('../utils/utils')
const Muted = require('../models/Muted')

const ROLESWITHMUTEPERMISSION = process.env.ROLESWITHMUTEPERMISSION
const MUTEDROLE = process.env.MUTEDROLE;

module.exports = {
  name: 'mute',
  description: 'Mute a member for temporary amount of time',
  async execute(message, args) {
    if (!message.member.roles.some(r => ROLESWITHMUTEPERMISSION.includes(r.id))) {
      return message.reply("Sorry, you don't have permissions to use this command!")
    }

    const member = message.mentions.members.first() || message.guild.members.get(args[0]);

    // Check if the user is in the server
    if (!member) {
      return message.reply("User is not in this server")
    }

    var reason;
    var mutedUntil;

    if (args[1] === '-d') {
      const duration = args[2];
      let unit = args[3];
      if (unit === "minute" || unit === "hour" || unit === "day") {
        unit = unit.concat('s')
      }
      const acceptedUnitsOfTime = ['minutes', 'hours', 'days']
      reason = args.slice(4).join(' ');

      if (!isNumeric(duration)) {
        return message.reply("Invalid duration. Time must be a number.")
      }

      if (!acceptedUnitsOfTime.includes(unit)) {
        return message.reply("Invalid unit of time.")
      }

      mutedUntil = add(new Date(), {
        [unit]: duration
      })
    } else {
      reason = args.slice(1).join(' ');
    }

    if (!reason) {
      reason = "No reason provided"
    }

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
      await member.addRole(MUTEDROLE, reason)

      message.reply(`${member.user.tag} has been muted by ${message.author.tag}. Reason: ${reason}`)
    } catch (e) {
      message.reply(`Sorry ${message.author}, I couldnt mute because of : ${e}`)
    }
  }
}