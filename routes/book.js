const authMiddleware = require("../middleware");
const bookModel = require("../models/book");
const userModel = require("../models/user");
const { addBookValidation } = require("../src/validation");
const router = require("express").Router();
router.get("/", async (req, res) => {
  const books = await bookModel.find({});
  res.send(books);
});

router.post("/", authMiddleware, async (req, res) => {
  const { error } = addBookValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const { title, ISBN, stock, author, description, category } = req.body;
  const bookExist = await bookModel.findOne({ ISBN });

  if (bookExist) {
    bookExist.stock = bookExist.stock + stock;
    try {
      await bookExist.save();
      res.status(200).send({
        message: "Book Stock Updated",
      });
    } catch (err) {
      res.status(500).send(err);
    }
  } else {
    const newBook = new bookModel({
      title,
      ISBN,
      stock,
      author,
      description,
      category,
    });
    try {
      await newBook.save();
      res.status(201).send({
        message: "Book Added Successfully",
      });
    } catch (err) {
      res.status(500).send(err);
    }
  }
});

router.post("/issue", authMiddleware, async (req, res) => {
  const { ISBN } = req.body;
  const bookExist = await bookModel.findOne({ ISBN });
  const quantity = req.body.quantity ? req.body.quantity : 1;

  if (!bookExist)
    return res.status(400).send({
      message: "No book available with the given ISBN",
    });
  if (bookExist.stock < quantity)
    return res.status(400).send({
      message: "Stock shortage with the given value",
    });
  const { id } = req.user;
  // console.log(id);
  try {
    bookExist.stock = bookExist.stock - quantity;
    await bookExist.save();
    const bookInfo = {
      id: bookExist._id,
      title: bookExist.title,
      ISBN: bookExist.ISBN,
      author: bookExist.author,
      description: bookExist.description,
      issueDate: new Date(Date.now()).toLocaleDateString(),
      returnDate: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
    };
    // console.log(bookInfo);
    const user = await userModel.findById(id);
    // console.log(user);
    user.bookIssueInfo.push(bookInfo);
    await user.save();
    res.status(200).send({
      message: "Book Issued Successfully",
    });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post("/return", authMiddleware, async (req, res) => {
  const { ISBN } = req.body;
  const bookExist = await bookModel.findOne({ ISBN });
  const quantity = req.body.quantity ? req.body.quantity : 1;
  const { id } = req.user;
  const user = await userModel.findById(id);
  const index = user.bookIssueInfo.findIndex((item) => item.ISBN === ISBN);
  if (index === -1)
    return res.status(400).send({
      message: "No such book issued",
    });

  try {
    bookExist.stock += quantity;
    user.bookIssueInfo.splice(index, 1);
    await bookExist.save();
    await user.save();
    res.status(200).send({
      message: "Book Returned Successfully",
    });
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
