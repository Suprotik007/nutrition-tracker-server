const express = require('express');
const router = express.Router();
const { getDb } = require('../db'); 

router.get('/addFood', async (req, res) => {
  try {
    const db = getDb();
      const email = req.query.email;
    const foodsCollection = db.collection('addedFoods');
    const foods = await foodsCollection.find({email}).toArray();
    res.json(foods);
  } catch (err) {
    console.error('Failed to get foods', err);
    res.status(500).json({ error: 'Failed to get foods' });
  }
});


router.post('/addFood', async (req, res) => {
  try {
   const { foodName, amount, email } = req.body;

    const newFood = { foodName, amount: Number(amount), email,createdAt: new Date() };
    
    const db = getDb();
    const foodsCollection = db.collection('addedFoods');

    const result = await foodsCollection.insertOne(newFood);


    const insertedFood = await foodsCollection.findOne({ _id: result.insertedId });
    console.log('POST /addFood received with body:', req.body);
    res.status(201).json(insertedFood);


  } catch (err) {
    console.error('Failed to add food', err);
    res.status(500).json({ error: 'Failed to add food' });
  }
});

module.exports = router;
