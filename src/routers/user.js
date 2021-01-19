const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require("multer");
const sharp = require('sharp');

const upload = multer({
    limits:{
        fileSize: 1024*1024
    }, 
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error("Please upload an image"))
        }
        cb(undefined, true)
    }
});

router.post('/users/me/avatar',auth, upload.single('avatar'), async(req, res)=>{
    
    const buffer = await sharp(req.file.buffer).resize({width: 200, height: 200}).png().toBuffer()

    req.user.avatar = buffer;
    await req.user.save();
    res.send();
},(error, req,res, next)=>{
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatars', auth, async (req, res)=>{
    req.user.avatar=undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatars', async (req, res)=>{
    const user = await User.findById({_id : req.params.id})

    if(!user || !user.avatar){
        throw new Error("avatar not found")
    }

    //res.set('Content-Type','image/jpg')
    res.set('Content-Type','image/png')

    res.send(user.avatar)

})



// create operation
router.post('/users', async (req, res)=>{
    const user = new User(req.body);
    try{
        console.log('Creating User...')
        const result = await user.save()
        res.status(201).send(result)
    }catch (e){
        res.status(400).send(e)
    }  
})

router.post('/users/login', async(req, res)=>{
    try{
        console.log(req.body);
        const user = await User.findByCredential(req.body.email, req.body.password);
        const token = await user.generateToken()
        res.status(201).send({user, token});
    }catch (e){
        res.status(400).send(e);
    }
})

// Read Operation
router.get('/users', async (req, res)=>{
    console.log("Get users....")
    try {
        const users = await User.find({})
        res.send(users)
    }
    catch (e){
        res.status(400).send(e)
    }
        
})

// router.get('/users/:id', async (req, res)=>{
//     console.log("Get users by id...")
//     const _id = req.params.id
//     try{
//         const user = await User.findById(_id)
//             if(!user){
//                 return res.status(404).send()
//             }
//         res.send(user)
//     }
//     catch (e){
//         res.status(500).send(e)
//     }
// })

router.get('/users/me', auth, (req, res)=>{
    res.send(req.user)      // implicitly toJson
})

router.get('/users/logout', auth, async (req, res)=>{
    try {
        
        req.user.tokens = req.user.tokens.filter(tempToken => {

                return req.token !== tempToken.token
            })
        //console.log(req.user)
        //console.log(req.token)
        await req.user.save()
        res.send("logout successful!")
    }
    catch (e) {
            res.status(500).send()
        }
    //res.send(req.user)
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send("logged out from all devices!")
    }
})

//update operation
router.patch('/users/me', auth,  async (req, res)=>{
    // console.log("Update users bt id...")
    // const updates = Object.keys(req.body)
    // const allowedUpdates = ['name','email', 'password', 'age']
    // const isValidOperation = updates.every((update)=>allowedUpdates.includes(update))

    // if(!isValidOperation){
    //     res.status(400).send({error:"invalid updates!"})
    // }

    try{
        // const user = await User.findByIdAndUpdate(req.params.id, req.body,{new: true})
        // console.log("update user by id...")
        // if(!user){
        //     return res.status(404).send()
        // }
        console.log(req.user)
        const updates = Object.keys(req.body)
        updates.forEach(element => {
            req.user[element] = req.body[element]    
        });
        console.log(req.user)
        await req.user.save()
        res.send(user)
    }
    catch (e){
        res.status(400).send(e)
    }
})

//delete operation
router.delete('/users/me', auth, async(req, res)=>{
    console.log('deleting user by id..')
    try{
        // const user = await User.findByIdAndDelete(req.params.id)

        // if(!user){
        //     return res.status(404).send()
        // }
        await req.user.remove()
        res.send(user)
    }
    catch (e){
        res.status(500).send(e)
    }
})

module.exports = router;
