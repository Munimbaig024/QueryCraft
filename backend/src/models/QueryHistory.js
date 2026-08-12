const mongoose = require('mongoose');

const queryHistorySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    connection_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Connection',
    },
    natural_query: {
      type: String,
      required: true,
    },
    generated_sql: {
      type: String,
      required: true,
    },
    execution_time_ms: {
      type: Number,
      default: 0,
    },
    success: {
      type: Boolean,
      default: false,
    },
    error_message: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const QueryHistory = mongoose.model('QueryHistory', queryHistorySchema);

module.exports = QueryHistory;
