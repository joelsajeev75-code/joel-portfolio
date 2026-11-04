
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(express.static("public"));

const User = mongoose.model("User", {
    name: String,
    email: String,
    password: String
});

const Portfolio = mongoose.model("Portfolio", {
    userId: String,
    title: String,
    category: String,
    description: String
});

function checkLogin(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).send("Please login first");
    }
}

app.post("/register", async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
        return res.send("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        name: name,
        email: email,
        password: hashedPassword
    });

    await user.save();

    res.send("Registration successful");
});

app.post("/login", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ email: email });

    if (!user) {
        return res.send("User not found");
    }

    const correctPassword = await bcrypt.compare(
        password,
        user.password
    );

    if (!correctPassword) {
        return res.send("Incorrect password");
    }

    req.session.userId = user._id;
    req.session.userName = user.name;

    res.send("Login successful");
});

app.get("/items", checkLogin, async (req, res) => {
    const items = await Portfolio.find({
        userId: req.session.userId
    });

    res.json(items);
});

app.post("/items", checkLogin, async (req, res) => {
    const item = new Portfolio({
        userId: req.session.userId,
        title: req.body.title,
        category: req.body.category,
        description: req.body.description
    });

    await item.save();

    res.send("Item added successfully");
});

app.put("/items/:id", checkLogin, async (req, res) => {
    await Portfolio.findOneAndUpdate(
        {
            _id: req.params.id,
            userId: req.session.userId
        },
        {
            title: req.body.title,
            category: req.body.category,
            description: req.body.description
        }
    );

    res.send("Item updated");
});

app.delete("/items/:id", checkLogin, async (req, res) => {
    await Portfolio.findOneAndDelete({
        _id: req.params.id,
        userId: req.session.userId
    });

    res.send("Item deleted");
});

app.post("/logout", (req, res) => {
    req.session.destroy();

    res.send("Logged out");
});

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected");

        app.listen(process.env.PORT || 3000, () => {
            console.log("Server running on port 3000");
        });
    })
    .catch((error) => {
        console.log(error);
    });
