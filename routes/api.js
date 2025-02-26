const express = require('express');
const router = express.Router();
const Book = require('../models/book');

// POST /api/books - Add a new book
router.post('/api/books', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const newBook = new Book({ title });
    await newBook.save();
    res.status(200).json(newBook);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/books - Get all books
router.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find({});
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/books/:id - Get a specific book by ID
router.get('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.status(200).json(book);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/books/:id - Add a comment to a book
router.post('/api/books/:id', async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment) return res.status(400).json({ error: 'Comment is required' });

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    book.comments.push(comment);
    book.commentcount = book.comments.length; // Update commentcount
    await book.save();

    res.status(200).json(book);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/books/:id - Delete a book by ID
router.delete('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/books - Delete all books
router.delete('/api/books', async (req, res) => {
  try {
    await Book.deleteMany({});
    res.status(200).json({ message: 'All books deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;