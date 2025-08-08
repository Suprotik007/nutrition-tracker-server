
 const express = require('express');
const router = express.Router();
const { getDb } = require('../db'); 
router.get('/addFood', async (req, res) => {
  try {
    const db = getDb();
     const { email } = req.query;
    const query = { email };

    const foodsCollection = db.collection('addedFoods');
    const foods = await foodsCollection.find(query).toArray();
    res.json(foods);
  } catch (err) {
    console.error('Failed to get foods', err);
    res.status(500).json({ error: 'Failed to get foods' });
  }
});

router.post('/addFood', async (req, res) => {
  try {
    const { foodName, amount, email, section } = req.body;

    // Add 'section' to the newFood document
    const newFood = { foodName, amount: Number(amount), email, section, createdAt: new Date() };

    const db = getDb();
    const foodsCollection = db.collection('addedFoods');
    const result = await foodsCollection.insertOne(newFood);
    const insertedFood = await foodsCollection.findOne({ _id: result.insertedId });

    res.status(201).json(insertedFood);
  } catch (err) {
    console.error('Failed to add food', err);
    res.status(500).json({ error: 'Failed to add food' });
  }
});

module.exports = router;