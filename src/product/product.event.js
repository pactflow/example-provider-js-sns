const createEvent = (product, type) => ({
  ...product,
  event: type,
  version: incrementVersion(product.version),
});

module.exports = {
  createEvent
}