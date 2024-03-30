const express = require("express");
const cors = require("cors");
const app = express();
const port = 5000 | process.env.PORT;
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tasv8qo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const database = client.db("TasksDB");
    const tasksCollections = database.collection("tasks");

    app.get("/tasks", async (req, res) => {
      const status = req.query.status;
      const { assignee, priority, start_date, end_date } = req.query;

      console.log(req.query);
      let query = {};
      if (status) {
        query = { status: status };
      }
      if (assignee || priority || start_date || end_date) {
        query = {
          status: status,
          assignee: assignee,
          priority: priority,
          start_date: start_date,
          end_date: end_date,
        };
      }
      const result = await tasksCollections.find(query).toArray();
      res.send(result);
    });

    app.get("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tasksCollections.findOne(query);
      res.send(result);
    });

    app.post("/tasks", async (req, res) => {
      const newTask = req.body;
      const result = await tasksCollections.insertOne(newTask);
      res.send(result);
    });

    app.patch("/tasks/:id", async (req, res) => {
      // const task = req?.body;
      const id = req?.params?.id;
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          priority: req?.body?.priority,
          status: req?.body?.status,
        },
      };
      const filter = { _id: new ObjectId(id) };
      const result = await tasksCollections.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tasksCollections.deleteOne(query);
      res.send(result);
    });

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// apis
app.get("/", (req, res) => {
  res.send("Task Tracker Server is running well");
});

app.listen(port, () => {
  console.log(`Task Tracker server is running in port ${port}`);
});
