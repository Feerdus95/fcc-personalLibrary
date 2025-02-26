const express = require('express');
const router = express.Router();
const Book = require('../models/book');

// POST /api/books
router.post('/books', async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).send('missing required field title');
  }
  try {
    const newBook = new Book({ title });
    const savedBook = await newBook.save();
    res.json(savedBook);
  } catch (err) {
    res.status(500).send('Error adding book');
  }
});

// GET /api/books
router.get('/books', async (req, res) => {
  try {
    const books = await Book.find({});
    const bookList = books.map(book => ({
      _id: book._id,
      title: book.title,
      commentcount: book.comments.length
    }));
    res.json(bookList);
  } catch (err) {
    res.status(500).send('Error retrieving books');
  }
});

// GET /api/books/:id
router.get('/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).send('no book exists');
    }
    res.json(book);
  } catch (err) {
    res.status(404).send('no book exists');
  }
});

// POST /api/books/:id
router.post('/books/:id', async (req, res) => {
  const { comment } = req.body;
  if (!comment) {
    return res.status(400).send('missing required field comment');
  }
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).send('no book exists');
    }
    book.comments.push(comment);
    book.commentcount = book.comments.length;
    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (err) {
    res.status(404).send('no book exists');
  }
});

// DELETE /api/books/:id
router.delete('/books/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).send('no book exists');
    }
    res.send('delete successful');
  } catch (err) {
    res.status(404).send('no book exists');
  }
});

// DELETE /api/books
router.delete('/books', async (req, res) => {
  try {
    await Book.deleteMany({});
    res.send('complete delete successful');
  } catch (err) {
    res.status(500).send('Error deleting all books');
  }
});

module.exports = router;