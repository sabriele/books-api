const Sequelize = require("sequelize");

// Create the connection
const sequelize = new Sequelize("books-api", "postgres", "", {
  dialect: "postgres"
});

// Pass the models to the connection
const models = {
  Book: sequelize.import("./Book"),
  Author: sequelize.import("./Author")
};

Object.keys(models).forEach(key => {
  if ("associate" in models[key]) {
    models[key].associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
};

// Link up all the models
