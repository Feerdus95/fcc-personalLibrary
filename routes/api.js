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
        return res.status(400).send('missing required field title');
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
    .get(function (req, res) {
      const bookid = req.params.id;
      Book.findById(bookid, (error, result) => {
        if (!error && result) {
          return res.json(result);
        } else if (!result) {
          return res.send('no book exists');
        }
      });
    })
    .post(function (req, res) {
      const bookid = req.params.id;
      const comment = req.body.comment;
      if (!comment) {
        return res.status(400).send('missing required field comment');
      }
      console.log(`Adding comment '${comment}' to book '${bookid}'`);
      Book.findByIdAndUpdate(
        bookid,
        { $push: { comments: comment } },
        { new: true },
        (error, updatedBook) => {
          if (error) {
            console.error(`Error adding comment to book '${bookid}':`, error);
            return res.status(500).send('Error adding comment');
          }
          if (!updatedBook) {
            console.log(`Book '${bookid}' not found`);
            return res.send('no book exists');
          }
          console.log(`Comment added successfully to book '${bookid}'`);
          res.json(updatedBook);
        }
      );
    })
    .delete(function (req, res) {
      const bookid = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(bookid)) {
        return res.send('no book exists');
      }
      Book.findByIdAndRemove(bookid, (error, deletedBook) => {
        if (error) {
          console.error(`Error deleting book '${bookid}':`, error);
          return res.status(500).send('Error deleting book');
        }
        if (!deletedBook) {
          return res.send('no book exists');
        }
        return res.send('delete successful');
      });
    });
};