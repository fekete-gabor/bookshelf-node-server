const Book = require("../models/BookModel");

const getAllBooks = async (req, res) => {
  const { author, title } = req.query;

  const allBooks = await Book.find({ createdBy: req.user.userID });

  let books;
  let queryObj = {};

  if (allBooks.length === 0) {
    return res.status(200).json({
      success: true,
      numberOfBooks: allBooks.length,
      msg: "Looks like there is nothing here, try to add some books...",
    });
  }

  if (author.length === 0 && title.length === 0) {
    books = allBooks;
    return res.status(200).json({
      success: true,
      numberOfBooks: books.length,
      books,
    });
  }

  if (author.length <= 2 && title.length === 0) {
    return res
      .status(500)
      .json({ msg: "name must be at least 3 letters long!" });
  }

  if (author.length > 0 && title.length === 0) {
    queryObj.authors = { $regex: author, $options: "i" };
  }

  if (author.length === 0 && title.length > 0) {
    queryObj.title = { $regex: title, $options: "i" };
  }

  if (author.length > 0 && title.length > 0) {
    queryObj.authors = { $regex: author, $options: "i" };
    queryObj.title = { $regex: title, $options: "i" };
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.maxResults) || 10;
  const skip = (page - 1) * limit;

  books = await Book.find(queryObj).skip(skip).limit(limit);

  const totalBooks = await Book.countDocuments(queryObj);
  const numberOfPages = Math.ceil(totalBooks / limit);

  return res.status(200).json({
    success: true,
    numberOfBooks: books.length,
    numberOfPages,
    books,
  });
};

const getSingleBook = async (req, res) => {
  const {
    user: { userID },
    params: { id: bookID },
  } = await req;
  const singleBook = await Book.findOne({ createdBy: userID, id: bookID });

  if (!singleBook) {
    return res.status(404).send(`No book with id: ${bookID}`);
  }

  res.status(200).json({ success: true, singleBook });
};

const createSingleBook = async (req, res) => {
  const { userID } = req.user;
  const { singleBook } = req.body;
  const payload = { ...singleBook, createdBy: userID };
  const book = await Book.create(payload);
  res.status(200).json(book);
};

const updateSingleBook = async (req, res) => {
  const { id: bookID } = req.params;
  const singleBook = await Book.findOneAndUpdate({ id: bookID }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!singleBook) {
    return res.status(404).send(`No book with id: ${bookID}`);
  }

  res.status(200).json({ singleBook });
};

const removeSingleBook = async (req, res) => {
  const { id: bookID } = req.params;
  const singleBook = await Book.findOneAndDelete({ id: bookID });

  if (!singleBook) {
    return res.status(404).send(`No book with id: ${bookID}`);
  }

  res.status(200).json(singleBook);
};

module.exports = {
  getAllBooks,
  getSingleBook,
  createSingleBook,
  updateSingleBook,
  removeSingleBook,
};
