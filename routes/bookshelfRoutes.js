const express = require("express");
const router = express.Router();
const {
  getAllBooks,
  getSingleBook,
  createSingleBook,
  updateSingleBook,
  removeSingleBook,
} = require("../controllers/bookshelfControllers");

router.route("/").get(getAllBooks).post(createSingleBook);
router
  .route("/:id")
  .get(getSingleBook)
  .patch(updateSingleBook)
  .delete(removeSingleBook);

module.exports = router;
