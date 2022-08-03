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


const userRoutes = require('./routes/userRoutes')
const cosumerRoutes = require('./routes/cosumerRoutes')
const agentRoutes = require('./routes/agentRoutes')
const authRoutes = require('./routes/Auth')
const adminRoutes = require('./routes/adminRoutes')
const bussinesRoutes = require('./routes/bussinesRoutes')

app.use('/api/v1', userRoutes)
app.use('/api/v1', cosumerRoutes)
app.use('/api/v1', agentRoutes)
app.use('/api/v1', authRoutes)
app.use('/api/v1', adminRoutes)
app.use('/api/v1', bussinesRoutes)

app.get('/app', (req, res) => {
    return res.status(200).send({ "message": "App Response from server1!" });
});
app.listen(port, () => {
    console.table([
        {
            port: `${port}`
        }
    ])
}); 
