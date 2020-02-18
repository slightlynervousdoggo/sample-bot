const Discord = require('discord.js');
const client = new Discord.Client();

const BOT_TOKEN = process.env.BOT_TOKEN;
const PREFIX = process.env.PREFIX;
const ROLESWITHKICKPERMISSION = process.env.ROLESWITHKICKPERMISSION
const ROLESWITHBANPERMISSION = process.env.ROLESWITHBANPERMISSION;

const startBot = async () => {
  try {
    // Called when the server starts
    client.on('ready', () => {
      console.log(`Logged in as ${client.user.tag}!`);
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
          message.reply(`Sorry ${message.author} I couldnt kick because of : ${error}`)
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
          message.reply(`Sorry ${message.author} I couldnt ban because of : ${error}`)
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
