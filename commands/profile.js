const format = require('date-fns/format')
const formatDistance = require('date-fns/formatDistance')

module.exports = {
  name: 'profile',
  description: 'Get information on any Discord user',
  async execute(message, args) {
    const guildMember = message.mentions.members.first() || await message.guild.member(args[0])
    guildMember ? user = guildMember.user : user = await message.client.users.fetch(args[0])
    if (!user) return message.reply("User ID is not valid")
    const createdAt = format(user.createdAt, 'MMM do yyyy, H:mm:ss')
    const createdAtFromNow = formatDistance(new Date(), user.createdAt)

    if (guildMember) {
      const joinedAt = format(guildMember.joinedAt, 'MMM do yyyy, H:mm:ss')
      const joinedAtFromNow = formatDistance(new Date(), guildMember.joinedAt)
      try {
        message.channel.send({
          embed: {
            color: 3447003,
            title: 'User Profile',
            description: `User data for <@${user.id}>`,
            thumbnail: {
              url: user.displayAvatarURL()
            },
            fields: [
              {
                name: 'Username',
                value: user.tag,
                inline: true
              },
              {
                name: 'ID',
                value: user.id,
                inline: true
              },
              {
                name: 'Status',
                value: guildMember.presence.status,
                inline: true
              },
              {
                name: 'Highest Role',
                value: guildMember.roles.highest,
                inline: true
              },
              {
                name: 'Created',
                value: `${createdAt} 
                      (${createdAtFromNow})`,
                inline: true
              },
              {
                name: 'Joined',
                value: `${joinedAt}
                      (${joinedAtFromNow})`,
                inline: true
              }
            ],
            timestamp: new Date()
          }
        });
      } catch (e) {
        message.reply(`Sorry ${message.author}, I couldnt display this profile because of : ${e}`)
        console.log(e)
      }
    } else {
      try {
        message.channel.send({
          embed: {
            color: 3447003,
            title: 'User Profile',
            description: `User data for <@${user.id}>`,
            thumbnail: {
              url: user.displayAvatarURL()
            },
            fields: [
              {
                name: 'Username',
                value: user.tag,
                inline: true
              },
              {
                name: 'ID',
                value: user.id,
                inline: true
              },
              {
                name: 'Created',
                value: `${createdAt} 
                (${createdAtFromNow})`,
                inline: true
              }
            ],
            timestamp: new Date()
          }
        });
      } catch (e) {
        message.reply(`Sorry ${message.author}, I couldnt display this profile because of : ${e}`)
        console.log(e)
      }
    }
  }
}

