const createLogChannel = async message => {
  try {
    const channel = await message.guild.channels.create('logs', {
      type: 'text',
      permissionOverwrites: [{
        id: message.guild.roles.everyone,
        deny: ['VIEW_CHANNEL']
      },
      {
        id: message.guild.roles.cache.find(botRole => botRole.name === message.client.user.username && botRole.managed === true),
        allow: ['VIEW_CHANNEL', 'MANAGE_CHANNELS', 'SEND_MESSAGES']
      }]
    })
    return channel;
  } catch (e) {
    console.error(e);
    return message.reply(`Oops! Check the server log for errors`)
  }
}

const getLogChannel = async message => {
  return await message.guild.channels.cache.find(channel => channel.name === 'logs')
}

const createLog = async message => {
  const fetchedLogs = await message.guild.fetchAuditLogs({
    limit: 1,
    type: 'MESSAGE_DELETE',
  });
  // Since we only have 1 audit log entry in this collection, we can simply grab the first one
  const deletionLog = fetchedLogs.entries.first();

  // Let's perform a sanity check here and make sure we got *something*
  if (!deletionLog) return console.log(`A message by ${message.author.tag} was deleted, but no relevant audit logs were found.`);

  // We now grab the user object of the person who deleted the message
  // Let us also grab the target of this action to double check things
  const { executor, target } = deletionLog;

  // And now we can update our output with a bit more information
  // We will also run a check to make sure the log we got was for the same author's message

  // Get the log channel
  let logChannel;
  logChannel = await getLogChannel(message)

  // Create the log channel if it doesn't exist
  if (!logChannel) logChannel = await createLogChannel(message)

  if (target.id === message.author.id) {
    logChannel.send(`A message by ${message.author.tag} was deleted by ${executor.tag}.`);
  } else {
    logChannel.send(`A message by ${message.author.tag} was deleted, but we don't know by who.`);
  }
}

exports.createLog = createLog;