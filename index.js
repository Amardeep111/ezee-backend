const express=require('express')
const {MongoClient}=require('mongodb')
const bodyParser=require('body-parser')
const cors=require('cors')
const dotenv=require('dotenv')
const path=require('path')

dotenv.config()


const app=express()
const PORT= process.env.PORT || 5000

app.use(express.static(path.join(__dirname, 'Public')));
app.use(cors())
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const connection=async()=>{
  const client=new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  try{
    await client.connect();
    console.log('Connected to the MongoDB')
    return client
  }catch(err){
    console.log(err)
  }
}
let collection;

const connect = async () => {
  try {
      const client=await connection();
      const db = client.db(process.env.DB_NAME);
      collection = db.collection(process.env.COLLECTION_NAME);
      console.log('Connected to the database');
      // return collection;
  } catch (error) {
      console.log(error);
  }
}
connect();
app.post('/login', async (req, res) => {
  try {
    // await connect();
    const { email, password } = req.body;
    // console.log('Received email:', email);
    // console.log('Received password:', password);
    const user = await collection.findOne({ email: email });
    if(!user){
      // console.log("User with this email do not exists")
      return res.status(404).json({ error: 'User with this email do not  exists' });
    }
    if(user.password !== password){
      console.log("Invalid Password")
      return res.status(400).json({ error: 'Invalid Password' });

    }
    // console.log("User logged in successfully")
    return res.status(200).json({ message: 'User logged in successfully' });
    // return res.status(302).setHeader('Location', '/index.html').end();
    // res.redirect('/index.html');
  } catch (error) {
    console.error('Error processing form submission:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/',(req,res)=>{
  res.status(200).json({message:'Welcome to the login and signup API'})
})
app.post('/signup', async (req, res) => {
  try{
      // await connect();
      const {fullname,email,password}=req.body;
      const user=await collection.findOne({email:email});
      if(user){
          // console.log("User already exists")
          return res.status(404).json({error:'User already exists'})
      }
      const newUser=await collection.insertOne({fullname,email,password});
      // console.log("User created successfully")
      return res.status(200).json({message:'User created successfully'})
  }catch(err){
    console.error('Error processing form submission:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})
