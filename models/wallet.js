const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const walletSchema = new Schema({
    address: String,
    privateKey: String,
    amount: Number,
    authorID: String
});

module.exports = mongoose.model('Wallet', walletSchema);