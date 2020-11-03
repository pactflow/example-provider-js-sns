const createEvent = (product, type) => ({
  ...product,
  event: type,
  version: incrementVersion(product.version),
});

const incrementVersion = (v) => {
  const version = (v) ? parseInt(v.match(/[0-9]+/g)[0], 10) + 1 : 1
  return `v${version}`;
};

module.exports = {
  createEvent
}