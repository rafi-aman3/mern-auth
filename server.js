const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./configs/db')

require('dotenv').config({
  path: './configs/.env'
});

const port = process.env.PORT

const app = express()

connectDB()



app.use(express.json());
app.use(express.urlencoded({extended: false}));



if(process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: process.env.CLIENT_URL
  }))

  app.use(morgan('dev'))
}

const authRouter = require('./routes/auth.route');


app.use('/api/', authRouter)

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.use((req,res,next) => {
  res.status(404).json({
    success: false,
    message: "Page Not Found"
  })

})


app.listen(port, () => {
  console.log(`listening at ${port}`)
})