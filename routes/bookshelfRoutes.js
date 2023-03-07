const express = require("express");
const router = express.Router();
const {
  getAllBooks,
  getUniqueIDs,
  getSingleBook,
  createSingleBook,
  updateSingleBook,
  removeSingleBook,
  rateBook,
} = require("../controllers/bookshelfControllers");

router.route("/getUniqueIDs").get(getUniqueIDs);

router.route("/").get(getAllBooks).post(createSingleBook);
router
  .route("/:id")
  .get(getSingleBook)
  .patch(updateSingleBook)
  .delete(removeSingleBook);

router.route("/rateBook/:id").post(rateBook);

module.exports = router;
