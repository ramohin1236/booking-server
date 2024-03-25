const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 8000

app.use(cors({
    origin: 'http://localhost:5173', // Set the allowed origin
    credentials: true // Allow credentials (cookies)
  }));

app.use(express.json())
app.use(cookieParser())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vjcdyry.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;




const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });



  async function run() {
    try {
  
      const userCollection =client.db('hotel-managment').collection('User')
      const bookingCollection =client.db('hotel-managment').collection('Bookings')

  
     // jwt generate
     app.post('/jwt', async(req,res)=>{
        const user = req.body;
        console.log("I need a jwt", user);
        const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
            expiresIn: '365d'
        })
        res
         
            .cookie('token',token,{
                httpOnly:true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none': 'strict'
            })
            .send({success: true})
       })
    
// Save user email & generate JWT
app.put('/user/:email', async (req, res) => {
    const email = req.params.email
    const user = req.body
    const filter = { email: email }
    const options = { upsert: true }
    const updateDoc = {
      $set: user,
    }
    const result = await userCollection.updateOne(filter, updateDoc, options)


    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '365d',
    })
    res.send({ result, token })
  })

   //    logout
 app.get('/logout', async(req,res)=>{
    try{
      res.clearCookie('token',{
        maxAge: 0,
        secure: process.env.NODE_ENV=== "production",
        sameSite: process.env.NODE.ENV === 'production' ? 'none' : 'strict'
      })
        .send({success: true})
      
    }catch{
      res.status(500)
    }
  })


//   save a booking
app.post('/bookings', async(req,res)=>{
    const bookingData = req.body;

    const result = await bookingCollection.insertOne(bookingData);
   
    res.send(result)

})



// get all bookings for a user

app.get('/bookings', async (req, res) => {
    let query = {}
    const email = req.query.email
    if (email) {
      query = {
        guestEmail: email,
      }
    }

    const booking = await bookingCollection.find(query).toArray()
  
    res.send(booking)
  })


// get a single user by email

app.get('/user/:email', async(req,res)=>{
    const email= req.params.email;

    const query={
       email: email,
    }

    const user = await userCollection.findOne(query)

    res.send(user)
})


// get all Users

app.get('/users', async (req, res) => {
   

    const users = await userCollection.find().toArray()
    console.log(users)
    res.send(users)
  })




  
  
  
  
  
  
  
  
  
  
  
  
  
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      // Send a ping to confirm a successful connection
     
  
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
    }
  }
  run().catch(console.dir);
  
  app.get('/', (req,res)=>{
      res.send("doctor is running")
  })
  
  app.listen(port, ()=>{
      console.log(`Car docrotr server is running on  port ${port}`);
  })