
 const express = require('express');
const router = express.Router();
const { getDb } = require('../db'); 
const axios=require('axios');

const APP_ID = process.env.NUTRITION_APP_ID;
const API_KEY = process.env.NUTRITION_API_KEY;

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
console.log("Nutritionix Keys loaded:", !!APP_ID, !!API_KEY);

// api call
      const nutritionResponse = await axios.post(
      'https://trackapi.nutritionix.com/v2/natural/nutrients',
      {
        query: `${amount} grams ${foodName}`
      },
      {
        headers: {
          'x-app-id': APP_ID,
          'x-app-key': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('nutritionResponse', nutritionResponse.data);
    
    

    if (!nutritionResponse.data || !nutritionResponse.data.foods || nutritionResponse.data.foods.length === 0) {
      return res.status(400).json({ error: 'No food data found' });}
const foodData = nutritionResponse.data.foods[0]; 

    // const newFood = { foodName, amount: Number(amount), email, section, createdAt: new Date() };

     const newFood = {
      foodName,
      amount: Number(amount),
      email,
      section,
        calories: foodData.nf_calories ?? 0,
      protein: foodData.nf_protein ?? 0,
      fat: foodData.nf_total_fat ?? 0,
      carbs: foodData.nf_total_carbohydrate ?? 0,
      createdAt: new Date()
    };

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