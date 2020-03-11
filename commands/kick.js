const ROLESWITHKICKPERMISSION = process.env.ROLESWITHKICKPERMISSION

module.exports = {
  name: 'kick',
  description: 'Kick a user from the server',
  guildOnly: true,
  args: true,
  usage: `<user|ID>`,
  async execute(message, args) {
    if (!message.member.roles.cache.some(r => ROLESWITHKICKPERMISSION.includes(r.id))) return message.reply("Sorry, you don't have permissions to use this command!")

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    // Check if the user is in the server
    if (!member) return message.reply("User is not in this server")

    if (!member.kickable) return message.reply("I cannot kick this user! Do they have a higher role?");

    let reason = args.slice(1).join(' ');
    if (!reason) reason = "No reason provided"

    try {
      await member.kick(reason)
      message.reply(`${member.user.tag} has been kicked by ${message.author.tag}. Reason: ${reason}`)
    } catch (e) {
      message.reply(`Sorry ${message.author}, I couldn't kick because of : ${e}`)
    }
  }
}