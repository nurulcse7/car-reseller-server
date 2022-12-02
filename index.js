const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken');
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.70yiu6o.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
// 75-5 - JWT Verify (Middleware) function
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send('unauthorized access');
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'forbidden access' });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const carsCollection = client.db('carSeller').collection('cars');
    const bmwsCollection = client.db('carSeller').collection('bmws');
    const mercedesesCollection = client
      .db('carSeller')
      .collection('mercedeses');
    const toyotasCollection = client.db('carSeller').collection('toyotas');
    const bmwBookingsCollection = client
      .db('carSeller')
      .collection('bmwBookings');
    const mercedesBookingsCollection = client
      .db('carSeller')
      .collection('mercedesBookings');
    const toyotaBookingsCollection = client
      .db('carSeller')
      .collection('toyotaBookings');
    const usersCollection = client.db('carSeller').collection('users');
    const sellersCollection = client.db('carSeller').collection('sellers');
    const productsCollection = client.db('carSeller').collection('products');
    const paymentsCollection = client.db('carSeller').collection('payments');

    // ========================= Admin verify (Middleware) Start===================== //
    // Admin verify middleware (use verifyAdmin after verifyJWT)
    const verifyAdmin = async (req, res, next) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await usersCollection.findOne(query);
      if (user?.role !== 'admin') {
        return res.status(403).send({ message: 'forbidden access' });
      }
      next();
    };
    // ================================ Admin verify Stop================================= //

    // all brand cars (first time create db and store info)
    app.get('/cars', async (req, res) => {
      const query = {};
      const results = await carsCollection.find(query).toArray();
      res.send(results);
    });

    // ================================ BMW Start================================= //
    // BMW brand cars (first time create db and store info)
    app.get('/bmws', async (req, res) => {
      const query = {};
      const results = await bmwsCollection.find(query).toArray();
      res.send(results);
    });
    // BMW Bookings (click to BOOK NOW button for send booking info to store database) store like my order
    app.post('/bmwBookings', async (req, res) => {
      const bmwBooking = req.body;
      // console.log(bmwBooking);
      const result = await bmwBookingsCollection.insertOne(bmwBooking);
      res.send(result);
    });
    // after stored booking info, show to UI (My Orders page that's private routed also verifyJWT)
    app.get('/bmwBookings', verifyJWT, async (req, res) => {
      const email = req.query.email;
      // console.log('token', req.headers.authorization)
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      const query = { email: email };
      const bmwBookings = await bmwBookingsCollection.find(query).toArray();
      res.send(bmwBookings);
    });
    // ================================ BMW Stop================================= //
    // ================================ Mercedes Start=========================== //
    // Mercedes brand cars (first time create db and store info)
    app.get('/mercedeses', async (req, res) => {
      const query = {};
      const results = await mercedesesCollection.find(query).toArray();
      res.send(results);
    });
    // Mercedes Bookings (click to BOOK NOW button for send booking info to store database) store like my order
    app.post('/mercedesBookings', async (req, res) => {
      const mercedesBooking = req.body;
      // console.log(mercedesBooking);
      const result = await mercedesBookingsCollection.insertOne(
        mercedesBooking
      );
      res.send(result);
    });
    // after stored booking info, show to UI (My Orders page that's private routed also verifyJWT)
    app.get('/mercedesBookings', verifyJWT, async (req, res) => {
      const email = req.query.email;
      // console.log('token', req.headers.authorization)
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      const query = { email: email };
      const mercedesBookings = await mercedesBookingsCollection
        .find(query)
        .toArray();
      res.send(mercedesBookings);
    });
    // ================================ Mercedes Stop============================ //
    // ================================ Toyota Start============================= //
    // Toyotas brand cars (first time create db and store info)
    app.get('/toyotas', async (req, res) => {
      const query = {};
      const results = await toyotasCollection.find(query).toArray();
      res.send(results);
    });
    // Toyota Bookings (click to BOOK NOW button for send booking info to store database) store like my order
    app.post('/toyotaBookings', async (req, res) => {
      const toyotaBooking = req.body;
      console.log(toyotaBooking);
      const result = await toyotaBookingsCollection.insertOne(toyotaBooking);
      res.send(result);
    });
    // after stored booking info, show to UI (My Orders page that's private routed also verifyJWT)
    app.get('/toyotaBookings', verifyJWT, async (req, res) => {
      const email = req.query.email;
      // console.log('token', req.headers.authorization)
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res.status(403).send({ message: 'forbidden access' });
      }
      const query = { email: email };
      const toyotaBookings = await toyotaBookingsCollection
        .find(query)
        .toArray();
      res.send(toyotaBookings);
    });
    // ================================ Toyota Stop============================== //
    // ================================ Users, jwt Start============================== //
    //75-4 jwt token generate for user verify
    app.get('/jwt', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      console.log(user);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: '7d',
        });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: '' });
    });
    //75-3 users data/ info store in db When user SignUp with email and password (saveUser)
    app.post('/users', async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    // 75-7 06:00 - after stored user info, show to UI(dashboard/allusers)
    app.get('/users', async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });
    //75-8 user update (make an Admin from User! and if user not to be an admin, he can't make an admin)
    app.put('/users/admin/:id', verifyJWT, verifyAdmin, async (req, res) => {
      // const decodedEmail = req.decoded.email;
      // const query = { email: decodedEmail };
      // const user = await usersCollection.findOne(query);
      // if (user?.role !== 'admin') {
      //     return res.status(403).send({ message: 'forbidden access' })
      // }
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: 'admin',
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });
    //75-9 if user not an admin, he can't access dashboard
    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === 'admin' });
    });
    // =============== Users (add, manage, delete), jwt Stop===================== //

    // ======================= Sellers (add, manage, delete) start ================ //
    // Add a seller and store in db
    app.post('/sellers', verifyJWT, verifyAdmin, async (req, res) => {
      const seller = req.body;
      const result = await sellersCollection.insertOne(seller);
      res.send(result);
    });
    // after stored seller, show to UI
    app.get('/sellers', verifyJWT, verifyAdmin, async (req, res) => {
      const query = {};
      const sellers = await sellersCollection.find(query).toArray();
      res.send(sellers);
    });
    // delete a seller from UI
    app.delete('/sellers/:id', verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await sellersCollection.deleteOne(filter);
      res.send(result);
    });
    // =================== Sellers (add, manage, delete) stop ==================== //

    // ==================== Products (add, manage, delete) start ==================== //
    // Add a product and store in db
    app.post('/products', verifyJWT, verifyAdmin, async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });
    // after stored product, show to UI
    app.get('/products', verifyJWT, verifyAdmin, async (req, res) => {
      const query = {};
      const products = await productsCollection.find(query).toArray();
      res.send(products);
    });
    // delete a product from UI
    app.delete('/products/:id', verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(filter);
      res.send(result);
    });
    // ======================= Products (add, manage, delete) stop ======================= //

    // ============================ Payment Start ========================== //
    // payment for specific booking id from bmwBookingsCollection
    app.get('/bmwBookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const booking = await bmwBookingsCollection.findOne(query);
      res.send(booking);
    });
    // payment for specific booking id from mercedesBookingsCollection
    app.get('/mercedesBookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const booking2 = await mercedesBookingsCollection.findOne(query);
      res.send(booking2);
    });
    // payment for specific booking id from toyotaBookingsCollection
    app.get('/toyotaBookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const booking3 = await toyotaBookingsCollection.findOne(query);
      res.send(booking3);
    });
    // 77-6 Create PaymentIntent as soon as the page loads
    app.post('/create-payment-intent', async (req, res) => {
      const booking = req.body;
      const price = booking.price;
      const amount = price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        currency: 'usd',
        amount: amount,
        payment_method_types: ['card'],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });
    // 77-9 store payment info in the database And show TransactionId in Payment UI
    app.post('/payments', async (req, res) => {
      const payment = req.body;
      const result = await paymentsCollection.insertOne(payment);
      const id = payment.bookingId;
      const filter = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          paid: true,
          transactionId: payment.transactionId,
        },
      };
      const updatedResult = await bmwBookingsCollection.updateOne(
        filter,
        updatedDoc
      );
      res.send(result);
    });

    // // 77-1 temporary to update price field on bmwsCollection
    // // You can insert in db any properties and value (propertyName:value, like = name:"Nurul, price: 100")
    //     app.get('/addPrice', async (req, res) => {
    //         const filter = {}
    //         const options = { upsert: true }
    //         const updatedDoc = {
    //             $set: {
    //                 price: 99
    //             }
    //         }
    //         const result = await bmwsCollection.updateMany(filter, updatedDoc, options);
    //         res.send(result);
    //     })
    // ======================= Payment Stop ======================= //
  } finally {
  }
}
run().catch(console.log);

app.get('/', async (req, res) => {
  res.send('Car Reseller server is running');
});

app.listen(port, () => console.log(`Car Reseller running on ${port}`));
