const uuid = require("uuid/v4");
const express = require("express");
const router = express.Router();
const { books: oldBooks } = require("../data/db.json");
const { Book, Author } = require("../models");

const filterBooksBy = (property, value) => {
  return oldBooks.filter(b => b[property] === value);
};

const verifyToken = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) return res.sendStatus(403);
  if (authorization !== "Bearer my-awesome-token") return res.sendStatus(403);
  return next();
};

router
  .route("/")
  .get(async (req, res) => {
    const { author, title } = req.query;
    if (title) {
      const books = await Book.findAll({
        where: { title },
        include: [Author]
      });
      return res.json(books);
    }
    if (author) {
      const books = await Book.findAll({
        include: [{ model: Author, where: { name: author } }]
      });
      return res.json(books);
    }
    const oldBooks = await Book.findAll({ include: [Author] });
    return res.json(oldBooks);
  })
  .post(verifyToken, (req, res) => {
    const book = req.body;
    book.id = uuid();
    res.status(201).json(req.body);
  });

router
  .route("/:id")
  .put((req, res) => {
    const book = oldBooks.find(b => b.id === req.params.id);
    if (book) return res.status(202).json(req.body);
    return res.sendStatus(400);
  })
  .delete((req, res) => {
    const book = oldBooks.find(b => b.id === req.params.id);
    if (book) return res.sendStatus(202);
    return res.sendStatus(400);
  });

module.exports = router;
