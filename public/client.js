$(document).ready(function() {
  let items = [];
  let itemsRaw = [];

  $.getJSON('/api/books', function(data) {
    //let  items = [];
    itemsRaw = data;
    $.each(data, function(i, val) {
      items.push('<li class="bookItem" id="' + i + '">' + val.title + ' - ' + val.commentcount + ' comments</li>');
      return (i !== 14);
    });
    if (items.length >= 15) {
      items.push('<p>...and ' + (data.length - 15) + ' more!</p>');
    }
    $('<ul/>', {
      'class': 'listWrapper',
      html: items.join('')
    }).appendTo('#display');
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
        $('#bookTitleToAdd').val(''); // Clear input field
        // Refresh the book list
        refreshBookList();
      }
    });
  });

  function refreshBookList() {
    $('#display').empty();
    $.getJSON('/api/books', function(data) {
      let items = [];
      $.each(data, function(i, val) {
        items.push('<li class="bookItem" id="' + i + '">' + val.title + ' - ' + val.commentcount + ' comments</li>');
        return (i !== 14);
      });
      if (items.length >= 15) {
        items.push('<p>...and ' + (data.length - 15) + ' more!</p>');
      }
      $('<ul/>', {
        'class': 'listWrapper',
        html: items.join('')
      }).appendTo('#display');
    });
  }

  $('#display').on('click', 'li.bookItem', function() {
    const bookId = itemsRaw[this.id]._id;
    $.getJSON('/api/books/' + bookId, function(data) {
      let comments = [];
      $.each(data.comments, function(i, val) {
        comments.push('<li>' + val + '</li>');
      });
      comments.push('<br><form id="newCommentForm"><input style="width:300px" type="text" class="form-control" id="commentToAdd" name="comment" placeholder="New Comment"></form>');
      comments.push('<br><button class="btn btn-info addComment" id="' + data._id + '">Add Comment</button>');
      comments.push('<button class="btn btn-danger deleteBook" id="' + data._id + '">Delete Book</button>');
      $('#detailComments').html(comments.join(''));
    });
  });

  $('#bookDetail').on('click', 'button.addComment', function() {
    let newComment = $('#commentToAdd').val();
    $.ajax({
      url: '/api/books/' + this.id,
      type: 'post',
      dataType: 'json',
      data: $('#newCommentForm').serialize(),
      success: function(data) {
        comments.unshift(newComment); //adds new comment to top of list
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
});