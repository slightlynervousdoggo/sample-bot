const isAfter = require('date-fns/isAfter')

const Muted = require('../models/Muted')

const MUTEDROLE = process.env.MUTEDROLE;

const checkMutedUsers = async client => {
  const mutedUsers = await Muted.find({})

  mutedUsers.forEach(async (r) => {
    const guildMember = await client.guilds.get(r.guildId).members.get(r.userId)

    // Unmute users that had their muted role manually removed
    if (!guildMember.roles.has(MUTEDROLE)) {
      await Muted.deleteOne({ _id: r._id })
      return
    }

    if (!r.mutedUntil) return

    // Unmute users past the mute date
    if (isAfter(new Date(), r.mutedUntil)) {
      await guildMember.removeRole(MUTEDROLE)
      await Muted.deleteOne({ _id: r._id })
    }
  })
}

const isNumeric = n => {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

exports.checkMutedUsers = checkMutedUsers;
exports.isNumeric = isNumeric;