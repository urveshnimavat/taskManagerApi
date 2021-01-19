const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

//create
router.post('/tasks', async(req, res)=>{
    const task = new Task(req.body)
    console.log('creating task..')
    try{
        await task.save()
        res.status(201).send(task)
    }
    catch(e){
        res.status(400).send(e)
    }
})

//read
// router.get('/tasks', async (req, res)=>{
//     console.log("Get tasks....")
//     try {
//         const tasks = await Task.find({})
//         res.send(tasks)
//     } catch (e) {
//         res.status(500).send()
//     }
// })

router.get('/tasks',auth, async (req, res) => {
    try {
        //const tasks = await Task.find({})
        await req.user.populate('tasks').execPopulate();
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', async (req, res) => {
    const _id = req.params.id
    console.log("get task by id..")
    try {
        const task = await Task.findById(_id)

        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

//update
router.patch('/tasks/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    console.log("update task by id...")

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true})

        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

//delete
router.delete('/tasks/:id', async (req, res) => {
    console.log("deleting task by id...")
    try {
        const task = await Task.findByIdAndDelete(req.params.id)

        if (!task) {
            res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router;
