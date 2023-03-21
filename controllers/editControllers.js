const Edit = require("../models/EditModel");
const crypto = require("crypto");

const getAllCategories = async (req, res) => {
  const { userID } = req.user;
  const { id: bookID } = req.params;

  const book = await Edit.findOne({ createdBy: userID, id: bookID });

  if (!book) {
    return res.status(200).send("no categories yet!");
  }

  const categories = [...new Set(book.bookEdits.map((book) => book.category))];

  res.status(200).json({ success: true, categories });
};

const getAllNotes = async (req, res) => {
  const { userID } = req.user;
  const { id: bookID } = req.params;
  const { category } = req.query;

  if (!bookID) {
    return res.status(404).send(`No book with id of ${bookID}`);
  }

  let book = await Edit.findOne({ createdBy: userID, id: bookID });

  if (!book) {
    return res.status(200).send("no categories or notes yet!");
  }

  const findCategory = book.bookEdits.find(
    (book) => book.category === category
  );

  if (!findCategory) {
    return res.status(200).send("no notes yet!");
  }

  const { inputs } = findCategory;

  res.status(200).json({ success: true, inputs });
};

const createCategory = async (req, res) => {
  const { userID } = req.user;
  const { id: bookID } = req.params;
  let { name: fieldName } = req.body;

  if (!bookID) {
    return res.status(404).send(`No book with id of ${bookID}`);
  }

  if (fieldName.length <= 2) {
    return res
      .status(500)
      .send("category name must be at least 3 letters long!");
  }

  fieldName = fieldName.toLowerCase().trim();

  const book = await Edit.findOne({ createdBy: userID, id: bookID });

  if (!book) {
    const payload = {
      id: bookID,
      createdBy: userID,
      bookEdits: [
        {
          category: fieldName,
          inputs: [],
        },
      ],
    };

    const data = await Edit.create(payload);

    return res.status(200).json({ success: true, data });
  }

  let findCategory = book.bookEdits.find((book) => book.category === fieldName);

  if (findCategory) {
    return res.status(500).send("this category already exists!");
  }

  book.bookEdits = [
    ...book.bookEdits,
    {
      category: fieldName,
      inputs: [],
    },
  ];

  await book.save();

  return res.status(200).json({ success: true, book });
};

const deleteCategory = async (req, res) => {
  const { userID } = req.user;
  const { id: bookID } = req.params;
  const { category } = req.query;

  if (!bookID) {
    return res.status(404).send(`No book with id of ${bookID}`);
  }

  let book = await Edit.findOne({ createdBy: userID, id: bookID });

  book.bookEdits = book.bookEdits.filter((book) => book.category !== category);

  await book.save();

  const categories = [...new Set(book.bookEdits.map((book) => book.category))];

  res
    .status(200)
    .json({ success: true, msg: "category successfully deleted!", categories });
};

const createNote = async (req, res) => {
  const { userID } = req.user;
  const { id: bookID } = req.params;
  const { categoryName, inputName, richText } = req.body;

  if (!bookID) {
    return res.status(404).send(`No book with id of ${bookID}`);
  }

  let book = await Edit.findOne({ createdBy: userID, id: bookID });

  let findCategory = book.bookEdits.find(
    (book) => book.category === categoryName
  );

  if (!findCategory) {
    return res.status(200).send("category not found!");
  }

  findCategory.inputs.push({
    id: crypto.randomUUID(),
    name: inputName.name,
    desc: richText.desc,
  });

  await book.save();

  res
    .status(200)
    .json({ success: true, book, msg: "Note successfully created!" });
};

const updateNote = async (req, res) => {
  const { userID } = req.user;
  const { id: bookID } = req.params;
  const { inputName, richText, editID } = req.body;

  if (!bookID) {
    return res.status(404).send(`No book with id of ${bookID}`);
  }

  const book = await Edit.findOne({ createdBy: userID, id: bookID });

  let input = book.bookEdits
    .flatMap((book) => book.inputs)
    .find((input) => input.id === editID);

  input.name = inputName.name;
  input.desc = richText.desc;

  await book.save();

  res
    .status(200)
    .json({ success: true, book, msg: "Note successfully updated!" });
};

const deleteNote = async (req, res) => {
  const { userID } = req.user;
  const { id: bookID } = req.params;
  const { id: btnID, category } = req.query;

  if (!bookID) {
    return res.status(404).send(`No book with id of ${bookID}`);
  }

  let book = await Edit.findOne({ createdBy: userID, id: bookID });

  if (!book) {
    return res.status(200).send("no notes found!");
  }

  const newList = book.bookEdits.map((book) => {
    if (book.category === category) {
      const obj = {
        ...book,
        inputs: book.inputs.filter((input) => input.id !== btnID),
      };

      return obj;
    } else {
      return book;
    }
  });

  book.bookEdits = newList;

  await book.save();

  const findCategory = book.bookEdits.find(
    (book) => book.category === category
  );

  const { inputs } = findCategory;

  res
    .status(200)
    .json({ success: true, msg: "note successfully deleted!", inputs });
};

module.exports = {
  getAllCategories,
  getAllNotes,
  createCategory,
  deleteCategory,
  createNote,
  updateNote,
  deleteNote,
};
