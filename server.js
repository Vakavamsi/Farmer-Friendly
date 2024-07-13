var express = require('express')  
var app = express()
var passwordHash=require('password-hash')
const bodyParser=require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('public'));
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore,Filter} = require('firebase-admin/firestore');
var serviceAccount = require("./key.json");
 
initializeApp({
    credential: cert(serviceAccount)
  });
  
const db = getFirestore();
  
app.get('/', function (req, res) {  
res.sendFile( __dirname + "/public/" + "main.html" );  
})  
  
app.post('/signupsubmit', function (req, res) { 
    
     db.collection('userdata').where(
        Filter.or(Filter.where('email','==',req.body.email),
        Filter.where('username','==',req.body.username))
        ).get()
     .then((docs)=>{
        if (docs.size>0){
            res.send("Hey This account is already exists with the email and username");

        }
        else{
    db.collection('userdata').add({
        username:req.body.username,
        email:req.body.email,
        password:passwordHash.generate(req.body.password),
    }).then(()=>{
      res.sendFile( __dirname + "/public/" + "login.html");
    })
    .catch(()=>{
        res.send("Something Went Wrong");
    });
}
});
});
  
app.post("/loginsubmit", function (req,res) { 
 db.collection('userdata')
   .where("username","==",req.body.username)
   .get()
   .then((docs)=>{
    let verified=false;
    docs.forEach((doc)=> {
        verified=passwordHash.verify(req.body.password,doc.data().password);
    });
    if(verified){
        res.sendFile( __dirname + "/public/" + "home.html");       
    }
    else{
        res.send("Failed to Login.U may have an account here.Please,signup.");
    }
   });
});
app.listen(4000);
