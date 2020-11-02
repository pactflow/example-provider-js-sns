const assert = require("assert").strict;
const { v4 } = require("uuid");

class Product {
  constructor(id, type, name, version) {
    assert(type, "type is a mandatory field");
    assert(name, "name is a mandatory field");

    this.id = id || v4();
    this.type = type;
    this.name = name;
    this.version = version;
  }
}
const productFromJson = (json) => new Product(json.id, json.type, json.name, json.version);

module.exports = {
  Product,
  productFromJson,
};
