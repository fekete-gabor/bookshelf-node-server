const Book = require("../models/BookModel");

const getAllBooks = async (req, res) => {
  const books = await Book.find({ createdBy: req.user.userID });

  if (books.length === 0) {
    return res.status(200).json({
      success: true,
      numberOfBooks: books.length,
      msg: "Looks like there is nothing here, try to add some books...",
    });
  }

  res.status(200).json({ success: true, numberOfBooks: books.length, books });
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
