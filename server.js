const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./src/product/product.routes');

const port = 8001;

const init = () => {
    app.use(bodyParser.json());
    app.use(cors());
    app.use(routes);
    return app.listen(port, () => console.log(`Provider API listening on port ${port}...`));
};

init();
