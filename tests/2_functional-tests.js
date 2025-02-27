var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
const mongoose = require('mongoose');

chai.use(chaiHttp);

let testId = '';

suite('Functional Tests', function() {
  suite('Routing tests', function() {
    
    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({
            title: 'Crime and Punishment'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.title, 'Crime and Punishment');
            assert.isNotNull(res.body._id);
            testId = res.body._id;
            done();
          });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({})
          .end(function(err, res) {
            assert.equal(res.status, 400); // Changed from 200 to 400
            assert.equal(res.text, 'missing required field title');
            done();
          });
      });
      
    });

    suite('GET /api/books => array of books', function() {
      
      test('Test GET /api/books', function(done) {
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

    suite('GET /api/books/[id] => book object with [id]', function() {
      
      test('Test GET /api/books/[id] with id not in db', function(done) {
        chai.request(server)
          .get('/api/books/invalidid123')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });
      
      test('Test GET /api/books/[id] with valid id in db', function(done) {
        chai.request(server)
          .get('/api/books/' + testId)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body._id, testId);
            assert.equal(res.body.title, 'Crime and Punishment');
            assert.isArray(res.body.comments);
            done();
          });
      });
      
    });

    suite('POST /api/books/[id] => add comment/expect book object with id', function() {
      
      test('Test POST /api/books/[id] with comment', function(done) {
        chai.request(server)
          .post('/api/books/' + testId)
          .send({
            comment: 'Great book!'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body.comments);
            assert.include(res.body.comments, 'Great book!');
            done();
          });
      });

      test('Test POST /api/books/[id] without comment field', function(done) {
        chai.request(server)
          .post('/api/books/' + testId)
          .send({})
          .end(function(err, res) {
            assert.equal(res.status, 400); // Changed from 200 to 400
            assert.equal(res.text, 'missing required field comment');
            done();
          });
      });

      test('Test POST /api/books/[id] with invalid id', function(done) {
        chai.request(server)
          .post('/api/books/invalidid123')
          .send({
            comment: 'Invalid ID test'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });
      
      test('Test POST /api/books/[id] and then GET /api/books/[id] to verify comment', function(done) {
        const newBook = {
          title: 'Test Book for Comments'
        };
        
        chai.request(server)
          .post('/api/books')
          .send(newBook)
          .end(function(err, res) {
            const bookId = res.body._id;
            
            chai.request(server)
              .post('/api/books/' + bookId)
              .send({ comment: 'Test comment' })
              .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body.comments);
                assert.include(res.body.comments, 'Test comment');
                
                chai.request(server)
                  .get('/api/books/' + bookId)
                  .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body.comments);
                    assert.include(res.body.comments, 'Test comment');
                    done();
                  });
              });
          });
      });
      
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {
      
      test('Test DELETE /api/books/[id] with valid id', function(done) {
        chai.request(server)
          .delete('/api/books/' + testId)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'delete successful');
            done();
          });
      });

      test('Test DELETE /api/books/[id] with invalid id', function(done) {
        chai.request(server)
          .delete('/api/books/invalidid123')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });
      
    });

    suite('DELETE /api/books => delete all books', function() {
      
      test('Test DELETE /api/books', function(done) {
        chai.request(server)
          .delete('/api/books')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'complete delete successful');
            done();
          });
      });
      
    });

  });
});