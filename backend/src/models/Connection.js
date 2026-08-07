const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    nickname: {
      type: String,
      required: true,
      trim: true,
    },
    db_type: {
      type: String,
      required: true,
      enum: ['postgres', 'mysql', 'sqlite', 'mongodb'],
    },
    connection_string_encrypted: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const Connection = mongoose.model('Connection', connectionSchema);

module.exports = Connection;
