const mongoose = require('mongoose');
const mongoURI = process.env.MONGO_URI;

const db = mongoURI;

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    })
    console.log(`MongoDB Connected...`)
  } catch (e) {
    console.log(e.message);
    process.exit(1)
  }
}

module.exports = connectDB;