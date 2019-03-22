const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];
let sequelize;

if (env === "production") sequelize = new Sequelize(config.url, config.options);
else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config.options
  );
}

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
