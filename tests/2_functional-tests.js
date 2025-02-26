/*
*
*
* FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
* -----[Keep the tests in the same order!]-----
* */

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const mongoose = require('mongoose');
const Book = require('../models/book');

chai.use(chaiHttp);

suiteSetup(async function() {
  try {
    await mongoose.connect(process.env.DB);
    await Book.deleteMany({});
  } catch (err) {
    console.error('Error in test setup:', err);
    throw err;
  }
});

suite('Functional Tests', function() {
  this.timeout(10000);
  
  let bookId;

  // Remove duplicate DELETE test and keep it in the correct suite
  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
    chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        if(res.body.length > 0) {
          assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
          assert.property(res.body[0], 'title', 'Books in array should contain title');
          assert.property(res.body[0], '_id', 'Books in array should contain _id');
        }
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {
    // Add test for DELETE all books
    test('Test DELETE /api/books', function(done) {
      chai.request(server)
        .delete('/api/books')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'complete delete successful');
          done();
        });
    });

    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Test Book' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response should be an object');
            assert.property(res.body, 'title', 'response should contain title');
            assert.property(res.body, '_id', 'response should contain _id');
            assert.equal(res.body.title, 'Test Book');
            bookId = res.body._id; // Store book ID for later tests
            done();
          });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({})
          .end(function(err, res) {
            assert.equal(res.status, 400);
            assert.equal(res.text, 'missing required field title');
            done();
          });
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
          .get('/api/books')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
            assert.property(res.body[0], 'title', 'Books in array should contain title');
            assert.property(res.body[0], '_id', 'Books in array should contain _id');
            done();
          });
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
          .get('/api/books/invalid-id')
          .end(function(err, res) {
            assert.equal(res.status, 404);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
          .get('/api/books/' + bookId)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response should be an object');
            assert.property(res.body, 'title', 'response should contain title');
            assert.property(res.body, '_id', 'response should contain _id');
            assert.isArray(res.body.comments, 'response should contain comments array');
            done();
          });
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
          .post('/api/books/' + bookId)
          .send({ comment: 'Test Comment' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response should be an object');
            assert.property(res.body, 'comments', 'response should contain comments array');
            assert.include(res.body.comments, 'Test Comment', 'comments array should include test comment');
            done();
          });
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        chai.request(server)
          .post('/api/books/' + bookId)
          .send({})
          .end(function(err, res) {
            assert.equal(res.status, 400);
            assert.equal(res.text, 'missing required field comment');
            done();
          });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        chai.request(server)
          .post('/api/books/invalid-id')
          .send({ comment: 'Test Comment' })
          .end(function(err, res) {
            assert.equal(res.status, 404);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });
      
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        chai.request(server)
          .delete('/api/books/' + bookId)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'delete successful');
            done();
          });
      });

      test('Test DELETE /api/books/[id] with  id not in db', function(done){
        chai.request(server)
          .delete('/api/books/invalid-id')
          .end(function(err, res) {
            assert.equal(res.status, 404);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });

    });

  });

});

suiteTeardown(async function() {
  try {
    await Book.deleteMany({});
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error in test teardown:', err);
    throw err;
  }
});