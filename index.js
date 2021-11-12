const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const ObjectId =  require('mongodb').ObjectId;
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
      const orderCollections = database.collection("orders");
      const reviewCollections = database.collection("reviews");
      
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

      //get single product
      app.get('/products/:id', async(req, res)=>{
          const id = ObjectId(req.params.id);
          const filter = {_id: id};
          const result = await productCollections.findOne(filter);
          res.json(result);
      });

      //Add product
      app.post('/products', async(req, res)=>{
          const product = req.body;
          const result = await productCollections.insertOne(product);
          res.json(result);
      });

      //Delete product 
      app.delete('/products/:id', async(req, res)=>{
        const id = ObjectId(req.params.id);
        const filter = {_id: id};
        const result = await productCollections.deleteOne(filter);
        res.json(result);
      });

      //  Post order
      app.post('/orders', async(req, res)=>{
        const order = req.body;
        order.status = false;
        const result = await orderCollections.insertOne(order);
        res.json(result);
      });

      //get all orders
      app.get('/orders', async(req, res)=>{
        const result = orderCollections.find({});
        const orders = await result.toArray();
        res.send(orders);
      });

      //get single user order
      app.get('/orders/:email', async(req, res)=>{
        const email = req.params.email;
        const result = orderCollections.find({email: email});
        const orders = await result.toArray();
        res.send(orders);
      });

      //cancel or delete orders
      app.delete('/orders/:id', (req, res)=>{
        const id = ObjectId(req.params.id);
        const result = orderCollections.deleteOne({_id: id});
        res.json(result);
      });

      //udpate status
      app.put('/orders/:id', (req, res)=>{
        const id = ObjectId(req.params.id);
        const update = {
          $set : {
            status: 1,
          }
        }
        const result = orderCollections.updateOne({_id: id}, update);
        res.json(result);
      });

      //Post Reviews 
      app.post('/reviews', async(req, res)=>{
        const review = req.body;
        const result = await reviewCollections.insertOne(review);
        res.json(result);
      });

      //get Reviews 
      app.get('/reviews', async(req, res)=>{
        const result = reviewCollections.find({});
        const reviews = await result.toArray();
        res.json(reviews);
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
     });

     //Check admin
     app.get('/user/:email', async(req, res)=> {
      const email = req.params.email;
      const filter = {email: email};
      const result = await userCollections.findOne(filter);
      let isAdmin = false;
      if(result?.role === 'admin'){
        isAdmin = true;
      }
      res.json(isAdmin);
     });

    

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