$(document).ready(function() {
  let items = [];
  let itemsRaw = [];

  // Initial book list display
  $.getJSON('/api/books', function(data) {
    itemsRaw = data;
    console.log("itemsRaw (initial):", itemsRaw);
    refreshBookList();
  });

  let comments = [];
  $('#newBook').click(function(event) {
    event.preventDefault();
    $.ajax({
      url: '/api/books',
      type: 'post',
      dataType: 'json',
      data: $('#newBookForm').serialize(),
      success: function(data) {
        $('#bookTitleToAdd').val('');
        // Directly update itemsRaw after adding a book
        $.getJSON('/api/books', function(data) {
          itemsRaw = data;
          refreshBookList();
        });
      }
    });
  });

  function refreshBookList() {
    $('#display').empty();
    $.getJSON('/api/books', function(data) {
      itemsRaw = data; // Update itemsRaw
      $.each(data, function(i, val) {
        let bookItem = $(`
          <div class="book-item p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 animate-fade-in">
            <h3 class="font-semibold text-lg text-purple-700">${val.title}</h3>
            <p class="text-gray-600">${val.commentcount} comments</p>
          </div>
        `);
        $('#display').append(bookItem);
      });
      adjustBookLayout();
    });
  }

  // Initially hide the book details
  $('#bookDetail').hide();

  $('#display').on('click', '.book-item', function() {
    const index = $('#display .book-item').index(this);
    console.log("itemsRaw (click):", itemsRaw); //Added log
    if (itemsRaw && itemsRaw[index] && itemsRaw[index]._id) {
      const bookId = itemsRaw[index]._id;
      $.getJSON('/api/books/' + bookId, function(data) {
        let comments = [];
        $.each(data.comments, function(i, val) {
          comments.push('<li>' + val + '</li>');
        });
        comments.push('<br><form id="newCommentForm"><input style="width:300px" type="text" class="form-control" id="commentToAdd" name="comment" placeholder="New Comment"></form>');
        comments.push('<br><button class="btn btn-info addComment" id="' + data._id + '">Add Comment</button>');
        comments.push('<button class="btn btn-danger deleteBook" id="' + data._id + '">Delete Book</button>');
        $('#detailComments').html(comments.join(''));
        $('#bookDetail').show();
      });
    } else {
      console.error("Book data is not available or index is out of bounds.");
    }
  });

  $('#bookDetail').on('click', 'button.addComment', function() {
    let newComment = $('#commentToAdd').val();
    if (!newComment) {
      console.error("Comment field is empty.");
      return;
    }
    $.ajax({
      url: '/api/books/' + this.id,
      type: 'post',
      dataType: 'json',
      data: $('#newCommentForm').serialize(),
      success: function(data) {
        comments.unshift(newComment);
        $('#detailComments').html(comments.join(''));
      }
    });
  });

  $('#bookDetail').on('click', 'button.deleteBook', function() {
    $.ajax({
      url: '/api/books/' + this.id,
      type: 'delete',
      success: function(data) {
        $('#detailComments').html('<p style="color: red;">' + data + '<p><p>Refresh the page</p>');
      }
    });
  });

  $('#deleteAllBooks').click(function() {
    $.ajax({
      url: '/api/books',
      type: 'delete',
      success: function(data) {
        refreshBookList();
      }
    });
  });

  function adjustBookLayout() {
    let bookHeight = $('.book-item').outerHeight(true);
    let displayHeight = $('#display').innerHeight();
    let booksPerRow = $('#display').css('grid-template-columns').split(' ').length;
    let maxBooks = Math.floor(displayHeight / bookHeight) * booksPerRow;

    let currentBooks = $('#display .book-item').length;
    if (currentBooks > maxBooks) {
      $('#display .book-item:gt(' + (maxBooks - 1) + ')').remove();
    }
  }
});