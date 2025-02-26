const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongoose').Types;

// Mock database (replace with MongoDB if needed)
let books = [];

// POST /api/books
router.post('/books', (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).send('missing required field title'); // Plain text error
  }
  const newBook = { title, _id: new ObjectId(), comments: [] };
  books.push(newBook);
  res.status(200).json(newBook);
});

// GET /api/books
router.get('/books', (req, res) => {
  if (books.length === 0) {
    return res.status(200).json([]);
  }
  const bookList = books.map(book => ({
    title: book.title,
    _id: book._id,
    commentcount: book.comments.length,
  }));
  res.status(200).json(bookList);
});

// GET /api/books/:id
router.get('/books/:id', (req, res) => {
  const book = books.find(b => b._id.toString() === req.params.id);
  if (!book) {
    return res.status(404).send('no book exists'); // Plain text error
  }
  res.status(200).json(book);
});

// POST /api/books/:id (Add Comment)
router.post('/books/:id', (req, res) => {
  const { comment } = req.body;
  const book = books.find(b => b._id.toString() === req.params.id);
  if (!book) {
    return res.status(404).send('no book exists'); // Plain text error
  }
  if (!comment) {
    return res.status(400).send('missing required field comment'); // Plain text error
  }
  book.comments.push(comment);
  res.status(200).json(book);
});

// DELETE /api/books/:id
router.delete('/books/:id', (req, res) => {
  const bookIndex = books.findIndex(b => b._id.toString() === req.params.id);
  if (bookIndex === -1) {
    return res.status(404).send('no book exists'); // Plain text error
  }
  books.splice(bookIndex, 1);
  res.status(200).send('delete successful'); // Plain text success
});

// DELETE /api/books
router.delete('/books', (req, res) => {
  books = [];
  res.status(200).send('complete delete successful');
});

module.exports = router;