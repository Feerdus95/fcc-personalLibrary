'use strict';

const Book = require('../models/book');

module.exports = function (app) {
  app.route('/api/books')
    .get(async function (req, res) {
      try {
        const books = await Book.find();
        res.json(books.map(book => ({
          _id: book._id,
          title: book.title,
          commentcount: book.comments.length
        })));
      } catch (err) {
        console.error(err);
        res.status(500).json([]);
      }
    })

    .post(async function (req, res) {
      const title = req.body.title;
      if (!title) {
        return res.status(400).send('missing required field title');
      }
      try {
        const newBook = new Book({ title });
        const savedBook = await newBook.save();
        res.json({
          _id: savedBook._id,
          title: savedBook.title
        });
      } catch (err) {
        console.error(err);
        res.status(500).send('Error adding book');
      }
    })

    .delete(async function (req, res) {
      try {
        await Book.deleteMany({});
        res.send('complete delete successful');
      } catch (err) {
        res.status(500).send('Error deleting books');
      }
    });

  app.route('/api/books/:id')
    .get(async function (req, res) {
      const bookid = req.params.id;
      try {
        if (!bookid.match(/^[0-9a-fA-F]{24}$/)) {
          return res.status(404).send('no book exists');
        }
        const book = await Book.findById(bookid);
        if (!book) {
          return res.status(404).send('no book exists');
        }
        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments
        });
      } catch (err) {
        res.status(404).send('no book exists');
      }
    })

    .post(async function (req, res) {
      const bookid = req.params.id;
      const comment = req.body.comment;
      if (!comment) {
        return res.status(400).send('missing required field comment');
      }
      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.status(404).send('no book exists');
        }
        book.comments.push(comment);
        const updatedBook = await book.save();
        res.json({
          _id: updatedBook._id,
          title: updatedBook.title,
          comments: updatedBook.comments
        });
      } catch (err) {
        res.status(404).send('no book exists');
      }
    })

    .delete(async function (req, res) {
      const bookid = req.params.id;
      try {
        if (!bookid.match(/^[0-9a-fA-F]{24}$/)) {
          return res.status(404).send('no book exists');
        }
        const result = await Book.findByIdAndDelete(bookid);
        if (!result) {
          return res.status(404).send('no book exists');
        }
        res.send('delete successful');
      } catch (err) {
        res.status(404).send('no book exists');
      }
    });
};