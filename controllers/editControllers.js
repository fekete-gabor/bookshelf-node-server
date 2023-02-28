const mongoose = require("mongoose");
const Edit = require("../models/EditModel");

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

  if (!userID) {
    return res
      .status(401)
      .send("User not found, please provide valid credentials!");
  }

  let book = await Edit.findOne({ createdBy: userID, id: bookID });

  const findCategory = book.bookEdits.find(
    (book) => book.category === category
  );

  if (!findCategory) {
    return res.status(200);
  }

  const { inputs } = findCategory;

  res.status(200).json({ success: true, inputs });
};

const createCategoryBtn = async (req, res) => {
  const { userID } = req.user;
  const { id: bookID } = req.params;
  const { name: fieldName } = req.body;

  if (!bookID) {
    return res.status(404).send(`No book with id of ${bookID}`);
  }

  if (!userID) {
    return res
      .status(401)
      .send("User not found, please provide valid credentials!");
  }

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
    return res.status(200).send("this category already exists!");
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

const createEdits = async (req, res) => {
  const { userID } = req.user;
  const { id: bookID } = req.params;
  const { categoryName, inputName, richText } = req.body;

  if (!bookID) {
    return res.status(404).send(`No book with id of ${bookID}`);
  }

  if (!userID) {
    return res
      .status(401)
      .send("User not found, please provide valid credentials!");
  }

  let book = await Edit.findOne({ createdBy: userID, id: bookID });

  let findCategory = book.bookEdits.find(
    (book) => book.category === categoryName
  );

  findCategory.inputs.push({
    name: inputName.name,
    desc: richText.desc,
  });

  for (let i = 0; i < findCategory.inputs.length; i++) {
    findCategory.inputs[i].id = i;
  }

  await book.save();

  res
    .status(200)
    .json({ success: true, book, msg: "Notes successfully created!" });
};

const updateEdits = async (req, res) => {
  const { userID } = req.user;
  const { id: bookID } = req.params;
  const { categoryName, inputName, richText, editID } = req.body;

  if (!bookID) {
    return res.status(404).send(`No book with id of ${bookID}`);
  }

  if (!userID) {
    return res
      .status(401)
      .send("User not found, please provide valid credentials!");
  }

  const book = await Edit.findOne({ createdBy: userID, id: bookID });

  let findCategory = book.bookEdits.find(
    (book) => book.category === categoryName
  );

  findCategory = findCategory.inputs.filter((input) => {
    if (input.id === editID) {
      input.name = inputName.name;
      input.desc = richText.desc;
      return input;
    } else {
      return input;
    }
  });

  await book.save();

  res
    .status(200)
    .json({ success: true, book, msg: "Field successfully updated!" });
};

const deleteEdits = async (req, res) => {
  res.status(200).send("delete edits route");
};

module.exports = {
  getAllCategories,
  getAllNotes,
  createCategoryBtn,
  createEdits,
  updateEdits,
  deleteEdits,
};
