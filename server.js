const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const app = express();
const { getDb, connectDB } = require("./db"); 

app.use(express.json());
app.use(cors());

// importing routes

const addedFoodsRouter = require('./routes/addedFoods');
const usersRoutes = require("./routes/users");
const bmiRoutes = require('./routes/BMIrecord')




connectDB()
  .then(() => {

    app.use('/addedFoods', addedFoodsRouter);
    app.use("/users", usersRoutes);
    app.use('/BMIrecord', bmiRoutes);


    app.get('/', (req, res) => {
      res.send('Hello from Nutrition-tracker server!');
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  });

module.exports = app;
