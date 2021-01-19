const mongoose = require('mongoose')
require('../db/mongoose');


const Task = new mongoose.model('Task', {
    name:{
        type: 'String',
        trim: true,
        required: true,
    },
    completed: {
        type: 'boolean',
        default: false
    },
    owner:{
        type:mongoose.Schema.Types.ObjectID,
        required: true,
        ref: 'User'
    }
})

module.exports = Task;