const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  getAllNotes,
  createCategoryBtn,
  createEdits,
  updateEdits,
  deleteEdits,
} = require("../controllers/editControllers");

router.route("/:id").patch(updateEdits).delete(deleteEdits);
router.route("/createCategoryBtn/:id").post(createCategoryBtn);
router.route("/createEdits/:id").post(createEdits);
router.route("/getAllCategories/:id").get(getAllCategories);
router.route("/getAllNotes/:id").get(getAllNotes);

module.exports = router;
