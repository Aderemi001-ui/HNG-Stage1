const express=require('express')
const mongoose=require('mongoose')
const app=express()
const axios=require('axios')
const bodyParser=require('body-parser')
const ejs=require('ejs')
app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended:true}))
require('dotenv').config()
mongoose.connect(process.env.MONGODB_URI)
.then(()=>{
console.log('Mongoose Server Is Already Running!');
})
.catch(err=>{
console.log('Error connecting to mongoose server',err);
})
var gender=''
var age=''
var national=''
var age_group=''
const jsonresponse =''

const profileSchema=new mongoose.Schema({
    name:String,
    gender:String,
    gender_probability:Number,
    sample_size:Number,
    age:Number,
    age_group:String,
    country_id:String,
    country_probability:Number,
    created_at:String
})
const profile=mongoose.model('profile',profileSchema)
const jsonify=''

app.get('/',(req,res)=>{
  res.render('index')
})

app.get('/',(req,res)=>{
  res.render('index')
})

app.post('/api/profiles',async(req,res)=>{
 try{
   const name=req.query.name
 console.log(name);
 const genderData=await axios.get(`https://api.genderize.io?name=${name}`)
  .then(response=>{
     gender=response.data
    console.log(response.data);
    
  })
  .catch(err=>{
    console.log('Error processing request',err);
    
  })
 await axios.get(`https://api.agify.io?name=${name}`)
 .then(response=>{
 age=response.data
    console.log(response.data);
    
  })
  .catch(err=>{
    console.log('Error processing request',err);
    
  })
await axios.get(`https://api.nationalize.io?name=${name}`)
.then(response=>{
national=response.data
    console.log(response.data);
  })
  .catch(err=>{
    console.log('Error processing request',err);
  })
    console.log(gender,age,national);
    if(age.age>0 && age.age<=12 ){
         age_group='Child'
    }else if(age.age>=13 && age.age<=19){
        age_group='Teenager'
    }
    else if(age.age>=20 && age.age<=59){
        age_group='Adult'
    }
    else{
        age_group='Senior'
    }
    await profile.create({
        name:gender.name,
        gender:gender.gender,
        gender_probability:gender.probability,
        sample_size:gender.count,
        age:age.age,
        age_group:age_group,
        country_id:national.country[0].country_id,
        country_probability:national.country[0].probability,
        created_at:new Date().toISOString()
     })
     .then(user=>{
       const foundUser= profile.findOne()
       if(foundUser.name !== name){
        console.log(user);
        console.log('Profile Creation Successful !!');
        const profiles=[]
        profiles.push(user)
     res.status(200).json({
        status:'success',
        data:profiles
     })

       }else{
res.status(200).json({
    status:'success',
    message:'Profile already exists',
    data:profiles
})
if(name=''){
    res.status(400).json({
status:'Error',
message:'Missing Value For Name'
    })
}
       }
     })
     .catch(err=>{
        console.log('Error Creating Profile: ',err);
        res.status(500).json({
            status:'Error',
            message:'Failed To Fetch Data From External APIs'
        })
     })
 }
 catch(err){
    console.log('Error creating profile:',err)
 }
     })
app.get('/api/profiles',async(req,res)=>{

   const foundUsers= await profile.find()
   if(foundUsers){
    
     const profile=[foundUsers]
      console.log(profile);
        res.json({
status:'success',
count:profile.length,
data:profile
 })
   }else{
    console.log('Error fetching All Profiles:',err);
   }
})
app.get('/api/profiles/:id',async(req,res)=>{
  await profile.findById(req.params.id)
        .then(foundUser=>{
            console.log(foundUser);
          const profile=[foundUser]
        res.json({
            status:'success',
            data:foundUser
        })
})
 .catch(err=>{
console.log('Error Fetching Users');
      })
}) 
app.delete('/api/profiles/:id',async(req,res)=>{
const deleted=await profile.findByIdAndDelete(req.params.id)
if(deleted){
     console.log('User Successfully Deleted !!');
    res.status(204).send({
        status:'success',
    })
}else{
console.log('Error Deleting User');
}

    

})

app.listen(3000,()=>{
    console.log('Server running on port 3000!!');
})
// export default app;