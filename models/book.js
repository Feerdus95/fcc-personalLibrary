const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: { type: [String], default: [] },
  commentcount: { type: Number, default: 0 }
});

// Add pre-save middleware to update commentcount
BookSchema.pre('save', function(next) {
  if (this.comments) {
    this.commentcount = this.comments.length;
  }
  next();
});

module.exports = mongoose.model('Book', BookSchema);
