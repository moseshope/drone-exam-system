const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PasswordRestTokensSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
    token: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const PasswordRestTokensModel = mongoose.model('passwordresettokens', PasswordRestTokensSchema);

module.exports = PasswordRestTokensModel;
