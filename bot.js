const Discord = require('discord.js');
const add = require('date-fns/add')
const isAfter = require('date-fns/isAfter')

const { isNumeric } = require('./utils/utils')
const Muted = require('./models/Muted')
const client = new Discord.Client();

const BOT_TOKEN = process.env.BOT_TOKEN;
const PREFIX = process.env.PREFIX;
const MUTEDROLE = process.env.MUTEDROLE;
const ROLESWITHMUTEPERMISSION = process.env.ROLESWITHMUTEPERMISSION
const ROLESWITHKICKPERMISSION = process.env.ROLESWITHKICKPERMISSION
const ROLESWITHBANPERMISSION = process.env.ROLESWITHBANPERMISSION;

const startBot = async () => {
  try {
    // Called when the server starts
    client.on('ready', () => {
      console.log(`Logged in as ${client.user.tag}!`);

      // Check the database for muted users, and see if they can be unmuted
      setInterval(async () => {
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
      }, 5000)
    });

    // Called whenever a message is created
    client.on(`message`, async message => {
      // Ignore other bots
      if (message.author.bot) return;

      // Ignore messages without prefix
      if (message.content.indexOf(PREFIX) !== 0) return;

      // Splice "command" away from "arguments"
      const args = message.content
        .slice(PREFIX.length)
        .trim()
        .split(/ +/g);
      const command = args.shift().toLowerCase();

      if (command === 'mute') {
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

          mutedUntil = add(mutedAt, {
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

      if (command === 'unmute') {
        if (!message.member.roles.some(r => ROLESWITHMUTEPERMISSION.includes(r.id))) {
          return message.reply("Sorry, you don't have permissions to use this command!")
        }

        const member = message.mentions.members.first() || message.guild.members.get(args[0]);

        // Check if the user is in the server
        if (!member) {
          return message.reply("User is not in this server")
        }

        try {
          const mutedUser = await Muted.findOne({ userId: member.id, guildId: member.guild.id })

          // If the user isn't in db, check if they have the muted role (in case they were manually assigned the muted role)
          if (!mutedUser) {
            if (!member.roles.some(r => r.id === MUTEDROLE)) {
              return message.reply(`${member.user.tag} is already unmuted`)
            }
            await member.removeRole(MUTEDROLE)
            return message.reply(`${member.user.tag} is now unmuted`)
          }

          await member.removeRole(MUTEDROLE)
          await Muted.deleteOne({ _id: mutedUser._id })
          message.reply(`${member.user.tag} is now unmuted`)
        } catch (e) {
          message.reply(`Sorry ${message.author}, I couldn't unmute because of : ${e}`)
        }
      }

      if (command === 'kick') {
        if (!message.member.roles.some(r => ROLESWITHKICKPERMISSION.includes(r.id))) {
          return message.reply("Sorry, you don't have permissions to use this command!")
        }

        const member = message.mentions.members.first() || message.guild.members.get(args[0]);

        // Check if the user is in the server
        if (!member) {
          return message.reply("User is not in this server")
        }

        if (!member.kickable) {
          return message.reply("I cannot kick this user! Do they have a higher role?");
        }

        let reason = args.slice(1).join(' ');
        if (!reason) {
          reason = "No reason provided"
        }

        try {
          await member.kick(reason)
          message.reply(`${member.user.tag} has been kicked by ${message.author.tag}. Reason: ${reason}`)
        } catch (e) {
          message.reply(`Sorry ${message.author}, I couldn't kick because of : ${e}`)
        }
      }

      if (command === 'ban') {
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

    });

    client.login(BOT_TOKEN);
  } catch (err) {
    console.error(`Bot failed to start`, error);
    process.exit(1);
  }
};

module.exports = startBot;
