const express = require('express');
const router = express.Router();
const { getDb } = require('../db'); 


router.post("/", async (req, res) => {
  const { name, email, photoURL } = req.body;
  const db = getDb();
  const users = db.collection("users");

  const existing = await users.findOne({ email });
  if (existing) {
    return res.status(200).json(existing); 
  }
const newUser = { 
    name, 
    email,
    photoURL: photoURL || null, 
     
  };
  const result = await users.insertOne(newUser);
  res.status(201).json(newUser);
});


module.exports = router;