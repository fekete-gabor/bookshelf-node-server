const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  getAllNotes,
  createCategory,
  deleteCategory,
  createNote,
  updateNote,
  deleteNote,
} = require("../controllers/editControllers");

router.route("/:id").patch(updateNote).delete(deleteNote);
router.route("/createCategory/:id").post(createCategory);
router.route("/deleteCategory/:id").delete(deleteCategory);
router.route("/createNotes/:id").post(createNote);
router.route("/getAllCategories/:id").get(getAllCategories);
router.route("/getAllNotes/:id").get(getAllNotes);
module.exports = router;
