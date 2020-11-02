const { ProductEventRepository } = require("./product.event.repository");

const repository = new ProductEventRepository();

exports.create = async (req, res) => {
  console.log(req.body);
  try {
    await repository.create(req.body);
    res.sendStatus(201);
  } catch (e) {
    console.error(e);
    res.status(400).send({ message: "bad request" });
  }
};
exports.update = async (req, res) => {
  console.log(req.body);
  try {
    await repository.update(req.body);
    res.sendStatus(200);
  } catch {
    res.status(400).send({ message: "bad request" });
  }
};
exports.delete = async (req, res) => {
  console.log(req.body);
  try {
    await repository.delete(req.body);
    res.sendStatus(200);
  } catch {
    res.status(400).send({ message: "bad request" });
  }
};

exports.repository = repository;
