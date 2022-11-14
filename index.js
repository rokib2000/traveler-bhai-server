const express = require("express");
const cors = require("cors");
const { json } = require("express");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

//middleWare
app.use(cors());
app.use(json());

const dbUserName = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

const uri = `mongodb+srv://${dbUserName}:${dbPassword}@cluster0.d4mp0ot.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const serviceCollection = client.db("travelerBhai").collection("services");

    //   get services client side
    app.get("/services", async (req, res) => {
      const query = {};
      const sort = { date: -1 };
      const cursor = serviceCollection.find(query).sort(sort);
      const services = await cursor.toArray();
      res.send(services);
    });

    // get single post data
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    //   Add service
    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });
  } finally {
    //
  }
}
run();

app.get("/", (req, res) => {
  res.send("server running");
});

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
