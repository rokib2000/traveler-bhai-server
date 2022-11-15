const express = require("express");
const cors = require("cors");
const { json } = require("express");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

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

// jwt function
function verifyJWT(req, res, next) {
  // console.log(req.headers.authorization);

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      res.status(401).send({ message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const serviceCollection = client.db("travelerBhai").collection("services");
    const reviewCollection = client.db("travelerBhai").collection("reviews");

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      // console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
      res.send({ token });
    });

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

    // get review data by  service id
    app.get("/reviews", async (req, res) => {
      let query = {};
      if (req.query.id) {
        query = {
          serviceID: req.query.id,
        };
      }

      const cursor = reviewCollection.find(query);
      const review = await cursor.toArray();
      res.send(review);
    });

    // get review data by  service id
    app.get("/reviewsEmail", verifyJWT, async (req, res) => {
      // if (req.query.id) {
      //   query = {
      //     serviceID: req.query.id,
      //   };
      // }

      //jwt
      const decoded = req.decoded;

      // console.log(decoded);
      // console.log(req.query.email);

      if (decoded.email !== req.query.email) {
        return res.status(403).send({ message: "unauthorized access" });
      }

      let query = {
        userEmail: req.query.email,
      };

      // if (req.query.email) {
      //   query = {
      //     userEmail: req.query.email,
      //   };
      // }
      const cursor = reviewCollection.find(query);
      const review = await cursor.toArray();
      res.send(review);
    });

    //  add review
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    // review update
    app.patch("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body.status;
      console.log(status);
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          review: status,
        },
      };
      console.log(updateDoc);
      const result = await reviewCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    //review delete
    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
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
