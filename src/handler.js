const { nanoid } = require('nanoid');
const books = require('./books');

// add new book
const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const id = nanoid(16);
  const insertedAt = new Date().toISOString(); // create a new data for inserted at
  const updatedAt = insertedAt; // create update date set as insertedAt
  const finished = pageCount === readPage;

  const newBook = {
    id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt,
  };

  // fail if user does not input the name
  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });

    return response.code(400);
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });

    return response.code(400);
  }

  // add new book
  books.push(newBook);

  // Check if successfully added new book
  const isSuccess = books.filter((book) => book.id === id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });

    response.code(201);
    return response;
  }


  // if failed to added new book
  const response = h.response({
    status: 'fail',
    message: 'book failed to added',
  });

  return response.code(500);
};

// GET ALL BOOK
const getAllBooksHandler = (request, h) => {
  const { reading, finished, name } = request.query;

  const unfilteredBooks = books.map((book) => ({
    id: book.id,
    name: book.name,
    publisher: book.publisher,
  }));

  const filteringFunction = (reading, finished, name) => {
    const filtered = [];

    if (reading !== undefined) {
      let booksReadingQuery = books.filter((book) => book.reading == reading ? true : false);

      booksReadingQuery = booksReadingQuery.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      }));

      filtered.push(...booksReadingQuery);
    }

    if (finished !== undefined) {
      let booksFinishedQuery = books.filter((book) => book.finished == finished ? true : false);

      booksFinishedQuery = booksFinishedQuery.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      }));

      filtered.push(...booksFinishedQuery);
    }

    if (name !== undefined) {
      let booksNameQuery = books.filter((book) => (
        book.name.toLowerCase().includes(name.toLowerCase()) ? true : false
      ));
      booksNameQuery = booksNameQuery.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      }));

      filtered.push(...booksNameQuery);
    }

    return filtered;
  };

  const filteredBooks = filteringFunction(reading, finished, name);

  const response = h.response({
    status: 'success',
    data: {
      // return only id, name, publisher property from books array
      books: filteredBooks.length !== 0 ? filteredBooks : unfilteredBooks,
    },
  });

  return response;
};

// get book with certain id
const getBookByIdHanlder = (request, h) => {
  const { bookId } = request.params;

  // filter the id book that matched the bookId
  const book = books.filter((b) => b.id === bookId)[0];

  // check if id book matched
  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book
      },
    };
  };

  // if the book id does not match any id on the array books
  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });

  response.code(404);
  return response;
};

// UPDATE EXISTING BOOK
const editBookByIdHandler = (request, h) => {
  // return id parameters by API
  const { bookId } = request.params;

  // Body of user request
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  // Error handlers
  if (name === undefined) { // if user does not input the name will return an fail response
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });

    response.code(400);
    return response;
  }

  // if user inputed readPage value greater than pageCount.
  // will send the request 400 (client-side error) status code.
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });

    response.code(400);
    return response;
  };

  // look up the index of existing searched id
  // if not found will return -1
  const index = books.findIndex((book) => book.id === bookId);

  // Update date
  const updatedAt = new Date().toISOString();

  if (index !== -1) {
    // Update a new books by index
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };

    // send
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });

    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });

  response.code(404);
  return response;

};

// DELETE BOOK BY ID
const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  // Get matched inputed id in array books
  const index = books.findIndex((book) => book.id === bookId);

  // Check if id exists (will return -1 if not exists)
  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });

    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });

  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHanlder,
  editBookByIdHandler,
  deleteBookByIdHandler,
};