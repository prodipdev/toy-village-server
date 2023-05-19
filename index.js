const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// -------------------------------------------------

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.18ceobk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    const toysCollection = client.db("toyVillage").collection("allToys");

    // Get all toys from the database
    app.get("/toys", async (req, res) => {
      const cursor = toysCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Search for toys by name
    app.get("/toys/:text", async (req, res) => {
      const text = req.params.text;
      const result = await toysCollection
        .find({
          name: { $regex: text, $options: "i" },
        })
        .toArray();
      res.send(result);
    });

    // Get specific user toy collection
    app.get("/myToys/:email", async (req, res) => {
      const result = await toysCollection
        .find({ sellerMail: req.params.email })
        .toArray();
      res.send(result);
    });

    //   Get Single Toy Data by id
    app.get("/toyDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    // Add a new toy to the database
    app.post("/addToy", async (req, res) => {
      const toy = req.body;
      const result = await toysCollection.insertOne(toy);
      res.send(result);
    });

    // Update Toy Details
    app.patch("/toyUpdate/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedToy = req.body;
      console.log(updatedToy);
      const updateDoc = {
        $set: {
          name: updatedToy.name,
          photo: updatedToy.photo,
          sellerMail: updatedToy.sellerMail,
          category: updatedToy.category,
          subCategory: updatedToy.subCategory,
          price: updatedToy.price,
          rating: updatedToy.rating,
          availableQuantity: updatedToy.availableQuantity,
          sellerName: updatedToy.sellerName,
          detailsDescription: updatedToy.detailsDescription,
        },
      };

      const result = await toysCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

// --------------------------------------------------------------

// Respond with a message for the root route
app.get("/", (req, res) => {
  res.send("Toy Village is running");
});

// Start the server
app.listen(port, () => {
  console.log(`Toy Village Server is running on port ${port}`);
});
