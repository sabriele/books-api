const express = require("express");
const router = express.Router();
const { books: oldBooks } = require("../data/db.json");
const { Book, Author } = require("../models");

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
  .post(verifyToken, async (req, res) => {
    const { title, author } = req.body;
    const [foundAuthor] = await Author.findOrCreate({
      where: { name: author }
    });
    const newBook = await Book.create({ title });
    await newBook.setAuthor(foundAuthor);
    const newBookWithAuthor = await Book.findOne({
      where: { id: newBook.id },
      include: [Author]
    });
    return res.status(201).json(newBookWithAuthor);

    /* With Associations */
    // const { title, author } = req.body;
    // const foundAuthor = await Author.findOne({ where: { name: author } });
    // if (!foundAuthor) {
    //   const createdBook = await Book.create(
    //     { title, author: { name: author } },
    //     { include: [Author] }
    //   );
    //   return res.status(201).json(createdBook);
    // }
    // const createdBook = await Book.create(
    //   { title, authorId: foundAuthor.id },
    //   { include: [Author] }
    // );
    // return res.status(201).json(createdBook);
  });

router
  .route("/:id")
  .put(async (req, res) => {
    try {
      const book = await Book.findOne({
        where: { id: req.params.id },
        include: [Author]
      });
      const [foundAuthor] = await Author.findOrCreate({
        where: { name: req.body.author }
      });
      await book.update({ title: req.body.title });
      await book.setAuthor(foundAuthor);

      const result = await Book.findOne({
        where: { id: book.id },
        include: [Author]
      });

      return res.status(202).json(result);
    } catch (error) {
      return res.sendStatus(400);
    }
  })
  .delete(async (req, res) => {
    try {
      const book = await Book.destroy({ where: { id: req.params.id } });
      if (book) return res.sendStatus(202);
      return res.sendStatus(400);
    } catch (error) {
      return res.sendStatus(400);
    }
  });

module.exports = router;
