const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MutedSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  guildId: {
    type: String,
    required: true
  },
  mutedAt: {
    type: Date,
    required: true,
    default: new Date(),
  },
  mutedUntil: {
    type: Date
  }
})

module.exports = User = mongoose.model('muted', MutedSchema)

