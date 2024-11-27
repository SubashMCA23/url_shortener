require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Url = require("./models/Url");
const bodyParser = require("body-parser");

const app = express();

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use("/css", express.static(__dirname + "/public/css"));

// Routes
app.get("/", async (req, res) => {
    const urls = await Url.find();
    res.render("index", { urls });
});

app.post("/shorten", async (req, res) => {
    const { fullUrl } = req.body;
    await Url.create({ full: fullUrl });
    res.redirect("/");
});

app.get("/:shortUrl", async (req, res) => {
    const shortUrl = req.params.shortUrl;
    const url = await Url.findOne({ short: shortUrl });

    if (!url) return res.sendStatus(404);

    url.clicks++;
    await url.save();
    res.redirect(url.full);
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
