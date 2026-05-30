const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/ecommerce")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

/* USER MODEL */

const User = mongoose.model("User",{
name:String,
email:String,
password:String
});

/* PRODUCT MODEL */

const Product = mongoose.model("Product",{
name:String,
price:Number,
image:String,
description:String
});

/* ======================
   ADMIN LOGIN
====================== */

app.post("/admin-login",(req,res)=>{

const {email,password}=req.body;

if(email==="admin@gmail.com" && password==="123456"){
res.json({success:true});
}else{
res.json({success:false});
}

});

/* ======================
   USER REGISTER
====================== */

app.post("/register", async(req,res)=>{

const {name,email,password}=req.body;

const user=new User({name,email,password});

await user.save();

res.json({message:"User registered"});

});

/* ======================
   USER LOGIN
====================== */

app.post("/login", async(req,res)=>{

const {email,password}=req.body;

const user=await User.findOne({email,password});

if(user){
res.json({success:true});
}else{
res.json({success:false});
}

});

/* ======================
   ADD PRODUCT
====================== */

app.post("/add-product",async(req,res)=>{

const product=new Product(req.body);

await product.save();

res.json({message:"Product added"});

});

/* ======================
   GET PRODUCTS
====================== */

app.get("/products",async(req,res)=>{

const products=await Product.find();

res.json(products);

});

/* ======================
   SEARCH PRODUCTS
====================== */

app.get("/search",async(req,res)=>{

const q=req.query.q;

const products=await Product.find({
name:{$regex:q,$options:"i"}
});

res.json(products);

});

/* ======================
   START SERVER
====================== */

app.listen(3000,()=>{
console.log("Server running on port 3000");
});