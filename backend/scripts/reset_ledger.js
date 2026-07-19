const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');

const mongoUri = "mongodb+srv://shubhamshevkar:India2020@cluster0.svlqgzo.mongodb.net/agribridge?retryWrites=true&w=majority";

const userSchema = new mongoose.Schema({
  email: String,
  role: String,
  trustScore: Number,
  creditScore: Number
});
const User = mongoose.model('User', userSchema);

const creditLedgerSchema = new mongoose.Schema({
  farmerId: mongoose.Schema.Types.ObjectId,
  trustScore: Number,
  creditScore: Number,
  factors: {
    repaymentHistory: Number,
    transactionConsistency: Number,
    disputeRate: Number,
    incomeStability: Number
  }
}, { collection: 'creditledgers' });
const CreditLedger = mongoose.model('CreditLedger', creditLedgerSchema);

async function run() {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB!");
  
  const user = await User.findOne({ email: 'robustfarmer123@example.com' });
  if (user) {
    const res = await CreditLedger.deleteOne({ farmerId: user._id });
    console.log("Deleted old ledger:", res);
    
    // Also reset user's cached score fields
    user.trustScore = 0;
    user.creditScore = 0;
    await user.save();
    console.log("Reset user trustScore and creditScore to 0");
  } else {
    console.log("User robustfarmer123@example.com not found!");
  }
  
  await mongoose.connection.close();
}

run().catch(console.error);
