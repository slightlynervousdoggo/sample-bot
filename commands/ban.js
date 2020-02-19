const ROLESWITHBANPERMISSION = process.env.ROLESWITHBANPERMISSION;

module.exports = {
  name: 'ban',
  description: 'Ban a user from the server',
  async execute(message, args) {
    if (!message.member.roles.some(r => ROLESWITHBANPERMISSION.includes(r.id))) {
      return message.reply("Sorry, you don't have permissions to use this command!")
    }

    const member = message.mentions.members.first() || message.guild.members.get(args[0]);

    // Check if the user is in the server
    if (!member) {
      return message.reply("Member is not in this server")
    }

    if (!member.bannable) {
      return message.reply("I cannot ban this user! Do they have a higher role?");
    }

    let reason = args.slice(1).join(' ');
    if (!reason) {
      reason = "No reason provided"
    }

    try {
      await member.kick(reason)
      message.reply(`${member.user.tag} has been banned by ${message.author.tag}. Reason: ${reason}`)
    } catch (e) {
      message.reply(`Sorry ${message.author}, I couldn't ban because of : ${e}`)
    }

  }
}