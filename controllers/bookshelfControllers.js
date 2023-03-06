const Book = require("../models/BookModel");
const Edit = require("../models/EditModel");

const getAllBooks = async (req, res) => {
  const { author, title } = req.query;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.maxResults) || 10;
  const skip = (page - 1) * limit;

  const allBooks = await Book.find({ createdBy: req.user.userID });
  const allUniqueIDs = [...new Set(allBooks.map((book) => book.id))];

  let books;
  let queryObj = {};
  let numberOfPages;
  let totalBooks;

  if (allBooks.length === 0) {
    return res.status(200).json({
      success: true,
      numberOfBooks: allBooks.length,
      msg: "Looks like there is nothing here, try to add some books...",
    });
  }

  if (author.length === 0 && title.length === 0) {
    books = await Book.find({ createdBy: req.user.userID })
      .skip(skip)
      .limit(limit);

    totalBooks = await Book.countDocuments();
    numberOfPages = Math.ceil(totalBooks / limit);

    return res.status(200).json({
      success: true,
      numberOfBooks: books.length,
      numberOfPages,
      allUniqueIDs,
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

  books = await Book.find(queryObj).skip(skip).limit(limit);

  totalBooks = await Book.countDocuments(queryObj);
  numberOfPages = Math.ceil(totalBooks / limit);

  return res.status(200).json({
    success: true,
    numberOfBooks: books.length,
    numberOfPages,
    books,
    allUniqueIDs,
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
  await Edit.findOneAndDelete({ id: bookID });

  if (!singleBook) {
    return res.status(404).send(`No book with id: ${bookID}`);
  }

  res.status(200).json(singleBook);
};

const rateBook = async (req, res) => {
  const { userID } = req.user;
  const { id: bookID } = req.params;
  const { index } = req.query;

  const book = await Book.findOne({ createdBy: userID, id: bookID });

  if (!book) {
    return res.status(404).send(`No book with id of ${bookID}`);
  }

  book.userRating = parseInt(index);

  await book.save();

  const stars = book.userRating;

  res.status(200).json({ success: true, msg: "book updated!", stars });
};

module.exports = {
  getAllBooks,
  getSingleBook,
  createSingleBook,
  updateSingleBook,
  removeSingleBook,
  rateBook,
};
