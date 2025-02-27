'use strict';

const Book = require('../models/book');
const mongoose = require('mongoose');

module.exports = function (app) {
  app
    .route('/api/books')
    .get(async function (req, res) {
      try {
        const books = await Book.find();
        res.json(
          books.map((book) => ({
            _id: book._id,
            title: book.title,
            commentcount: book.comments.length,
          }))
        );
      } catch (err) {
        res.status(500).json([]);
      }
    })
    .post(async function (req, res) {
      const title = req.body.title;
      if (!title) {
        return res.status(200).send('missing required field title'); // Changed from 400 to 200
      }
      try {
        const newBook = new Book({ title });
        const savedBook = await newBook.save();
        res.json(savedBook);
      } catch (err) {
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

  app
    .route('/api/books/:id')
    .get(async function (req, res) { // Changed to async/await
      const bookid = req.params.id;
      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.status(200).send('no book exists');
        }
        return res.json(book);
      } catch (err) {
        return res.status(200).send('no book exists');
      }
    })
    .post(async function (req, res) { // Changed to async/await
      const bookid = req.params.id;
      const comment = req.body.comment;
      
      if (!comment) {
        return res.status(200).send('missing required field comment'); // Changed from 400 to 200
      }

      try {
        const updatedBook = await Book.findByIdAndUpdate(
          bookid,
          { $push: { comments: comment } },
          { new: true }
        );

        if (!updatedBook) {
          return res.status(200).send('no book exists');
        }

        res.json(updatedBook);
      } catch (err) {
        return res.status(200).send('no book exists');
      }
    })
    .delete(async function (req, res) { // Changed to async/await
      const bookid = req.params.id;
      
      if (!mongoose.Types.ObjectId.isValid(bookid)) {
        return res.status(200).send('no book exists');
      }

      try {
        const deletedBook = await Book.findByIdAndRemove(bookid);
        if (!deletedBook) {
          return res.status(200).send('no book exists');
        }
        return res.send('delete successful');
      } catch (err) {
        return res.status(200).send('no book exists');
      }
    });
};