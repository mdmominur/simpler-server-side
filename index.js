const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mpvkw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
      await client.connect();
      console.log("Database Connected");
      const database = client.db("simpler");
      const productCollections = database.collection("products");
      const userCollections = database.collection("users");
      
      //get products
      app.get('/products', async(req, res)=>{
          const limit = req.query.limit;
          let result = productCollections.find({});
          if(limit !== 'all'){
               result = productCollections.find({}).limit(parseInt(limit));
          }
          const products = await result.toArray();
          res.json(products);
      });

      //Add product
      app.post('/products', async(req, res)=>{
          const product = req.body;
          const result = await productCollections.insertOne(product);
          res.json(result);
      });

      //save users to the database
     app.post('/user', async(req, res)=>{
        const user = req.body;
        const result = await userCollections.insertOne(user);
        res.json(result);
     });

     //add user from admin login
     app.put('/user', async(req, res)=>{
         const user = req.body;
         const filter = {email: user.email}
         const options = { upsert: true };
         const updateDoc = {
            $set: user,
          };
          const result = await userCollections.updateOne(filter, updateDoc, options);
          res.json(result);
     });

     //Make admin
     app.put('/user/makeAdmin', async(req, res)=>{
         const email = req.body.email;
         const filter = {email: email}
         const updateDoc = {
            $set: {role: 'admin'},
          };

        const result = await userCollections.updateOne(filter, updateDoc);
        res.json(result);
     })

    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);

app.get('/', (req, res)=>{
    res.send('Simpler server running...')
});


app.listen(port, ()=>{
    console.log('Listing to port: ', port);
});