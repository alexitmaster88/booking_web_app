require("dotenv").config();
const express = require("express");
const cors = require("cors");
// Replace mongoose with Sequelize imports
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// Import models from the index.js file
const { sequelize, User, Place, Booking } = require('./models');
const cookieParser = require("cookie-parser");
const imageDownloader = require("image-downloader");
const multer = require("multer");
const fs = require("fs");
const bodyParser = require("body-parser");


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser()); // to read cookies
app.use("/uploads", express.static(__dirname + "/uploads")); // make image visible on http://localhost:4000/uploads/<photoname>
app.use(
  cors({
    // enable two sites to communicate
    credentials: true,
    origin: "http://localhost:5173",
  })
);

const bcryptSalt = bcrypt.genSaltSync(8);
const jwtSecret = "fshewfbjhcdsbchdbsckjf";

// Replace MongoDB connection with PostgreSQL connection
sequelize.authenticate()
  .then(() => {
    console.log('Connection to PostgreSQL has been established successfully.');
    // Sync all models with the database
    return sequelize.sync({ alter: true }); // In production, use migrations instead
  })
  .then(() => {
    console.log('All models were synchronized successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userData = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });
    res.json({
      id: userData.id,
      name: userData.name,
      email: userData.email
    });
  } catch (e) {
    res.status(422).json(e);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Update Mongoose query to Sequelize query
    const userData = await User.findOne({ where: { email } });
    if (userData) {
      const pass = bcrypt.compareSync(password, userData.password);
      if (pass) {
        jwt.sign(
          { email: userData.email, id: userData.id },
          jwtSecret,
          {},
          (err, token) => {
            if (err) throw err;
            res.cookie("token", token).json({
              id: userData.id,
              name: userData.name,
              email: userData.email
            }); // set a cookie
          }
        );
      } else {
        res.status(422).json("password is wrong");
      }
    } else {
      res.status(422).json("user not found");
    }
  } catch (e) {
    res.status(422).json(e);
  }
});

function getUserDataFromToken(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
      if (err) reject(err);
      resolve(userData);
    });
  });
}

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (token) {
    // reloading info of the logged in user after refreshing
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      // Update Mongoose findById to Sequelize findByPk
      const user = await User.findByPk(userData.id, {
        attributes: ['id', 'name', 'email'] // Select only needed fields
      });
      res.json(user);
    });
  } else {
    res.json(null);
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json(true);
});

app.post("/upload-by-link", async (req, res) => {
  const { link } = req.body;
  const newName = "photo" + Date.now() + ".jpg";
  await imageDownloader.image({
    url: link,
    dest: __dirname + "/uploads/" + newName,
  });
  res.json(newName);
});

// upload photos
const photoMiddleware = multer({ dest: "uploads/" });
app.post("/upload", photoMiddleware.array("photos", 100), (req, res) => {
  const uploadedFiles = [];
  for (let i = 0; i < req.files.length; i++) {
    const { path, originalname } = req.files[i];
    const parts = originalname.split(".");
    const extension = parts[parts.length - 1];
    const newPath = path + "." + extension;
    fs.renameSync(path, newPath);
    uploadedFiles.push(newPath.replace("uploads/", ""));
  }
  res.json(uploadedFiles);
});

// submit new place form
app.post("/places", async (req, res) => {
  const {
    title, address, photos,
    description, perks, extraInfo, 
    checkIn, checkOut, maxGuests, 
    price, startDate, endDate
  } = req.body;

  try {
    const userData = await getUserDataFromToken(req);
    const placeDoc = await Place.create({
      ownerId: userData.id, // Use ownerId instead of owner
      title, address, photos,
      description, perks, extraInfo,
      checkIn, checkOut, maxGuests,
      price, startDate, endDate
    });
    res.json(placeDoc);
  } catch (error) {
    res.status(422).json({ error: error.message });
  }
});

app.get("/user-places", async (req, res) => {
  try {
    const userData = await getUserDataFromToken(req);
    // Update Mongoose find to Sequelize findAll
    const places = await Place.findAll({
      where: { ownerId: userData.id }
    });
    res.json(places);
  } catch (error) {
    res.status(422).json({ error: error.message });
  }
});

app.get("/place/:id", async (req, res) => {
  const {id} = req.params;
  try {
    // Update Mongoose findById to Sequelize findByPk
    const place = await Place.findByPk(id);
    res.json(place);
  } catch (error) {
    res.status(422).json({ error: error.message });
  }
});

app.get("/place/:placeId/:bookingId", async (req, res) => {
  const {bookingId} = req.params;
  try {
    // Update Mongoose findById to Sequelize findByPk
    const booking = await Booking.findByPk(bookingId);
    res.json(booking);
  } catch (error) {
    res.status(422).json({ error: error.message });
  }
});

app.put("/places", async (req, res) => { 
  const {
    id, title, address, photos, description,
    perks, extraInfo, checkIn, checkOut, maxGuests,
    price, startDate, endDate
  } = req.body;
  
  try {
    const userData = await getUserDataFromToken(req);
    // Update Mongoose findById to Sequelize findByPk
    const place = await Place.findByPk(id);
    
    if (!place) {
      return res.status(404).json({ error: "Place not found" });
    }
    
    // Check if the current user is the owner
    if (userData.id !== place.ownerId) {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    // Update place properties
    place.title = title;
    place.address = address;
    place.photos = photos;
    place.description = description;
    place.perks = perks;
    place.extraInfo = extraInfo;
    place.checkIn = checkIn;
    place.checkOut = checkOut;
    place.maxGuests = maxGuests;
    place.price = price;
    place.startDate = startDate;
    place.endDate = endDate;
    
    await place.save();
    res.json("ok");
  } catch (error) {
    res.status(422).json({ error: error.message });
  }
});

app.get("/home", async (req, res) => {
  try {
    // Update Mongoose find to Sequelize findAll
    const places = await Place.findAll();
    res.json(places);
  } catch (error) {
    res.status(422).json({ error: error.message });
  }
});

app.post("/bookings", async (req, res) => {
  try {
    const userData = await getUserDataFromToken(req);
    const {place, checkInDate, checkOutDate, 
      numOfGuests, guestName, guestPhone, totalPrice} = req.body;

    // Create booking with Sequelize
    const booking = await Booking.create({
      userId: userData.id, // Use userId instead of user
      placeId: place, // Use placeId instead of place
      checkInDate,
      checkOutDate, 
      numOfGuests, 
      guestName, 
      guestPhone, 
      totalPrice
    });
    
    res.json(booking);
  } catch (error) {
    res.status(422).json({ error: error.message });
  }
});

app.get("/bookings", async (req, res) => {
  try {
    const userData = await getUserDataFromToken(req);
    // Update Mongoose find + populate to Sequelize findAll + include
    const bookings = await Booking.findAll({
      where: { userId: userData.id },
      include: {
        model: Place,
        as: 'place',
        attributes: ['id', 'title', 'address', 'photos', 'price', 'checkIn', 'checkOut']
      }
    });
    res.json(bookings);
  } catch (error) {
    res.status(422).json({ error: error.message });
  }
});

app.listen(4000, () => {
  console.log('Server running on port 4000');
});
