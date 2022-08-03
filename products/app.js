const express = require("express");
const app = express();
const morgan = require('morgan')
const config = require("./config/config");

require('./database/db')

const cors = require('cors');
app.use(cors());

app.use(express.json());
app.use(morgan('dev'))
app.use(express.static("uploadfile"))
port = config.port || 80
// var multer = require('multer');

const CatgeoryRouter = require('./routes/CategoryRoutes')
const Menu = require('./routes/MenuRoutes')
const product = require('./routes/ProductRoutes')
app.use('/api/v1',CatgeoryRouter)
app.use('/api/v1',Menu)
app.use('/api/v1',product)
app.get('/app', (req, res) => {
    return res.status(200).send({ "message": "App Response from server 2 product!" });
});
app.listen(port, () => {
    console.table([
        {
            port: `${port}`
        }
    ])
}); 
