const express=require("express");
const mongoose=require("mongoose");
const session = require("express-session");
const flash = require("express-flash");
//routes
const userRoutes= require("./Routes/userRoutes");
const adminRoutes=require("./Routes/adminRoutes");

const app= express(); 
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  }));

//database connection
mongoose.connect("mongodb://localhost/useradminapp")
.then(()=> {console.log("Connected to Mongodb")})
.catch((error)=>{console.log('Error in connecting Mongodb',error)})

//middleware
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.set("view engine", "ejs");
app.use(flash());

app.use("/user",userRoutes);
app.use("/admin",adminRoutes);



const PORT=process.env.PORT||3000
app.listen(PORT,()=> {console.log(`Server connected to ${PORT}`)});