const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port= process.env.PORT || 5000;

// middleware army
app.use(cors());
app.use(express.json());


const ourBrands =[
  {id:1, name:"Elegant", img:"https://i.ibb.co/D8CP7Qw/elegant.jpg"},
  {id:2, name:"Khansa", img:"https://i.ibb.co/C92W5yP/khansa.jpg"},
  {id:3, name:"Libura", img:"https://i.ibb.co/7jmt1kp/libura.jpg"},
  {id:4, name:"Lines", img:"https://i.ibb.co/9yMg8WF/Lines.jpg"},
  {id:5, name:"Novaline", img:"https://i.ibb.co/3m9mSMy/novaline.jpg"},
  {id:6, name:"Sama", img:"https://i.ibb.co/nzST2Xb/sama.jpg"},
]

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.skku3ga.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("productsDB");
    const products = database.collection("products");
// all products loading from DataBase and send to clientSide
    app.get('/products', async(req,res)=>{
      const cursor=products.find()
      const allProducts= await cursor.toArray();
      res.send(allProducts);
    })
// single data loading from dataBase and sending to clientSide for product details
    app.get('/productdetails/:_id',async(req,res)=>{
      const id= req.params._id
      const query = { _id: new ObjectId(id) };
      const product = await products.findOne(query);
      res.send(product);
    })

    // single data loading from database for update
    app.get('/updateproduct/:_id', async(req,res)=>{
      const id=req.params._id
      const query={_id:new ObjectId(id)};
      const product=await products.findOne(query);
      res.send(product);
    })
    // for single data update
    app.put('/updateproduct/:_id', async(req,res)=>{
      const id=req.params._id;
      const updateProduct=req.body;
      console.log(updateProduct);
      const query={_id:new ObjectId(id)};
      const options = { upsert: true };
      const updatedProduct={
        $set:{
          // name, photo, brandname, product_type, price, description, rating
          name:updateProduct.name,
          photo:updateProduct.photo,
          brandname:updateProduct.brandname,
          product_type:updateProduct.product_type,
          price:updateProduct.price,
          description:updateProduct.description,
          rating:updateProduct.rating,
        }
      }
      const result= await products.updateOne(query,updatedProduct,options);
      res.send(result);
    })
// adding product in database
    app.post('/addproduct', async(req,res)=>{
      const product=req.body;
      console.log(product)
      const result = await products.insertOne(product);
      res.send(result);
    });
    // adding to cart data sending to database
    const cartProducts = database.collection("cartProducts");

    app.post('/addToCart', async(req,res)=>{
      const product=req.body;
      console.log(product)
      const result = await cartProducts.insertOne(product);
      res.send(result);
    });

    // reading myCart data and sending to client side
    app.get('/myCart',async(req,res)=>{
      const cursor = cartProducts.find();
      const product = await cursor.toArray();
      res.send(product);
    })
    // deleting a product from my cart
    app.delete('/myCart/:id', async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)}
      const result= await cartProducts.deleteOne(query);
      res.send(result);
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send("server side is working")
});

app.get('/ourBrands',(req,res)=>{
  res.send(ourBrands)
})

app.listen(port, ()=>{
    console.log(`server side is running on port ${port}`)
})