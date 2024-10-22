
require('dotenv').config();
const mongoose=require("mongoose");
const express = require('express');
const { ethers } = require("ethers");
const cors = require("cors")


const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
  cors({
    origin: "*",
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
  })
)


const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")


const User=require("./modal/User");
const Business=require("./modal/Business");
const Transaction=require("./modal/Transaction");
const Application = require('./modal/Applications');

const customerAuth=(req,res,next)=>{
  try{
    const accessToken=req.headers["authorization"];
    const valToBeVerified=accessToken.split(" ")[1];

    jwt.verify(valToBeVerified,process.env.SECRET_KEY,(err,user)=>{
        if(err){
            res.status(500).json({message:err.message});
        }else{
            if(user.role=="Customer"){
                req.user=user;
                next();
            }
            else{
                res.status(500).json({message:"UnAuthorized Access !!"});
            }
        }
    });
}
catch(err){
    res.status(500).json({message:err.message});
}
}

const businessAuth=(req,res,next)=>{
  try{
    const accessToken=req.headers["authorization"];
    const valToBeVerified=accessToken.split(" ")[1];

    jwt.verify(valToBeVerified,process.env.SECRET_KEY,(err,user)=>{
        if(err){
            res.status(500).json({message:err.message});
        }else{
            if(user.role=="Business"){
                req.user=user;
                next();
            }
            else{
                res.status(500).json({message:"UnAuthorized Access !!"});
            }
        }
    });
}
catch(err){
    res.status(500).json({message:err.message});
}
}

const adminAuth=(req,res,next)=>{
  try{
    const accessToken=req.headers["authorization"];
    const valToBeVerified=accessToken.split(" ")[1];

    jwt.verify(valToBeVerified,process.env.SECRET_KEY,(err,user)=>{
        if(err){
            res.status(500).json({message:err.message});
        }else{
            if(user.role=="Admin"){
                req.user=user;
                next();
            }
            else{
                res.status(500).json({message:"UnAuthorized Access !!"});
            }
        }
    });
}
catch(err){
    res.status(500).json({message:err.message});
}
}

// see basically here : we will be using jwt to register the customer !! 
// vvimp !! 
app.post('/registerDoctor', async (req, res) => {
  try {
    console.log(req.body);
    // here add in the transactions table and User Table !!
        let saltRounds=10;
        bcrypt.hash(req.body.pwd, saltRounds, async function (err, hash) {
          if (err) {
            console.log(err);
          } else {
            // addUser in the customer Table !!
            const newUser = new User({
              name:req.body.name,
              email:req.body.email,
              pwd:hash
            });

            // Save the user
            await newUser.save().then(savedUser => {
              console.log('New Doctor Registered :', savedUser);
              const user = {
                _id: savedUser._id,
                role: "Doctor"
              }
              const accessToken = jwt.sign(user, process.env.SECRET_KEY)
              res.status(200).json({ ...user, accessToken });
            }).catch(error => {
              console.error('Error saving Doctor:', error);
            });
        }
      })

  } catch (error) {
    console.error('Error registering Doctor:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// this will be returing jwt to the user !! 
app.post("/loginDoctor",async (req,res)=>{
  const { email,pwd } = req.body;
  try {
    const results = await User.find({email:email})

    if (results.length === 0) {
       console.log({ message: "NO ENTRY FOUND !!!" })
    }

    let userFound = false;

    for (const result of results) {
      const storedHashedPassword = result.pwd;
      const passwordMatch = bcrypt.compare(pwd, storedHashedPassword);

      if (passwordMatch) {
        const user = {
          _id: result._id,
          role: "Doctor"
        }
        const accessToken = jwt.sign(user, process.env.SECRET_KEY)
        console.log("Entry Found");
        res.status(200).json({ accessToken, ...user })
      }
    }
    res.status(500).json({ message: "INVALID CREDENTIALS !!!" })
  } catch (err) {
    console.log(err);
  }
});

// this will be returing jwt to the user !! 
app.post("/loginBusiness",async (req,res)=>{
  const { businessWalletAddress , pwd } = req.body; // imp !! userWalletAddress , pwd to be used !! 
  try {
    const results = await Business.find({businessWalletAddress:businessWalletAddress})

    if (results.length === 0) {
       console.log({ message: "NO ENTRY FOUND !!!" })
    }


    for (const result of results) {
      const storedHashedPassword = result.pwd;
      const passwordMatch = bcrypt.compare(pwd, storedHashedPassword);

      if (passwordMatch && result.role==="Business") {
        const user = {
          _id: result._id,
          role: "Business"
        }
        const accessToken = jwt.sign(user, process.env.SECRET_KEY)
        console.log("Entry Found");
        res.status(200).json({ accessToken, ...user })
      }
    }

    res.status(500).json({ message: "INVALID CREDENTIALS !!!" })
  } catch (err) {
    console.log(err);
  }
});


// this will be returing jwt to the user !! 
app.post("/loginAdmin",async (req,res)=>{
  const { businessWalletAddress , pwd } = req.body; // imp !! userWalletAddress , pwd to be used !! 
  try {
    const results = await Business.find({businessWalletAddress:businessWalletAddress})

    if (results.length === 0) {
       console.log({ message: "NO ENTRY FOUND !!!" })
    }


    for (const result of results) {
      const storedHashedPassword = result.pwd;
      const passwordMatch = bcrypt.compare(pwd, storedHashedPassword);

      if (passwordMatch && result.role==="Admin") {
        const user = {
          _id: result._id,
          role: "Admin"
        }
        const accessToken = jwt.sign(user, process.env.SECRET_KEY)
        console.log("Entry Found");
        res.status(200).json({ accessToken, ...user })
      }
    }

    res.status(500).json({ message: "INVALID CREDENTIALS !!!" })
  } catch (err) {
    console.log(err);
  }
});


app.post("/getUserDetails",customerAuth,async(req,res)=>{

  try{
    const userId=req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
    }   
    console.log(user);
    res.status(200).json(user);
  }
  catch(error){
    console.log(error);
    res.status(400).json({error:"In Catch error"});
  }



});


// Rectify them !!
app.get('/get-transaction-recipt/customer/:transactionHash'
,customerAuth, async (req, res) => {
    try {

      const { transactionHash } = req.params;
      const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_API_KEY);
    
      const receipt = await provider.getTransactionReceipt(transactionHash);
      res.json(receipt);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
});


app.get('/get-transaction-recipt/business/:transactionHash'
,businessAuth, async (req, res) => {
    try {

      const { transactionHash } = req.params;
      const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_API_KEY);
    
      const receipt = await provider.getTransactionReceipt(transactionHash);
      res.json(receipt);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
});



app.get('/getListOfBusiness',async(req,res)=>{

  try{
    const businesses = await Business.find().select('_id tokenSymbol businessWalletAddress name tokenContractAddress');
    res.json(businesses);
  }
  catch(error){
    console.log(error);
    res.json({message:error.message});
  }


});

// get the transaction hashes !! for a customer !!
app.post('/getTransactionHistroy',customerAuth,async(req,res)=>{
  
  try{
    const userId=req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
    } 
    else{
      
      const transactionIds = user.transactions;

      // Find transactions by their IDs
      const transactions = await Transaction.find({ _id: { $in: transactionIds } });
      
      if (!transactions || transactions.length === 0) {
          return res.status(404).json({ error: 'No transactions found' });
      }
      
      const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_API_KEY);
      const responseArray = [];
      
      console.log(transactions);
      // Loop through each transaction and fetch its receipt
      for(let i=0;i<transactions.length;i++) {
          const receipt = await provider.getTransactionReceipt(transactions[i].txHash);
          responseArray.push(receipt);
      }

      console.log(responseArray);
      
      // Send the response array containing transaction receipt objects
      res.send(responseArray);      

    }
  }
  catch(error){
    console.log(error);
    res.json({message:error.message});
  }

});

// see we want not only the transaction recipts but also the name/details of the user to which 
// that grant is associated !! 
app.get("/getTransactionsForAudit",adminAuth,async(req,res)=>{

  try{

    const transactions=Transaction.find();
    const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_API_KEY);
      const responseArray = [];
      
      console.log(transactions);
      // Loop through each transaction and fetch its receipt
      for(let i=0;i<transactions.length;i++) {
          const receipt = await provider.getTransactionReceipt(transactions[i].txHash);
          const newObj={
            receipt:receipt,
            Application:foundApplication
          }
          responseArray.push(receipt);
      }

      console.log(responseArray);
      
      // Send the response array containing transaction receipt objects
      res.send(responseArray); 

  }
  catch(error){
    console.log(error);
    res.json({message:error.message});
  }


})
  
  
app.set("port", process.env.port || 3000)
app.listen(app.get("port"), async() => {
  try{
    
  console.log(`Server Started on http://localhost:${app.get("port")}`)
  console.log(process.env.MONGODB_URI);
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`MongoDbConnected`);
  }
  catch(error){
    console.log("Unsucess :"+error);
  }
});