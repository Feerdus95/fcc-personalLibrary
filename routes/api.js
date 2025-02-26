/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const mongoose = require('mongoose');
const Book = require('../models/book');

mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res) {
      try {
        const books = await Book.find({});
        res.json(books.map(book => ({
          _id: book._id,
          title: book.title,
          commentcount: book.comments.length
        })));
      } catch (err) {
        res.status(500).send('Error retrieving books');
      }
    })
    
    .post(async function (req, res) {
      const title = req.body.title;
      if (!title) return res.send('missing required field title');
      try {
        const newBook = new Book({ title });
        await newBook.save();
        res.json({ _id: newBook._id, title: newBook.title });
      } catch (err) {
        res.status(500).send('Error creating book');
      }
    })
    
    .delete(async function(req, res) {
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
        const book = await Book.findById(bookid);
        if (!book) return res.send('no book exists');
        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments
        });
      } catch (err) {
        res.status(500).send('Error retrieving book');
      }
    })
    
    .post(async function(req, res) {
      const bookid = req.params.id;
      const comment = req.body.comment;
      if (!comment) return res.send('missing required field comment');
      try {
        const book = await Book.findById(bookid);
        if (!book) return res.send('no book exists');
        book.comments.push(comment);
        await book.save();
        res.json({
          _id: book._id,
          title: book.title,
          comments: book.comments
        });
      } catch (err) {
        res.status(500).send('Error adding comment');
      }
    })
    
    .delete(async function(req, res) {
      const bookid = req.params.id;
      try {
        const result = await Book.findByIdAndDelete(bookid);
        if (!result) return res.send('no book exists');
        res.send('delete successful');
      } catch (err) {
        res.status(500).send('Error deleting book');
      }
    });
};
