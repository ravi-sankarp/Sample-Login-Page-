const { default: mongoose } = require("mongoose");
const uuid = require('uuid');


const SessionSchema= new mongoose.Schema({

    sessionId:{
        type:String
    },
    userId:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'User'
    },
    createdAt:{
        type:Date,
        index:{
            expires:'14d',
        },
        default:()=>Date.now(),
        
    }
});
SessionSchema.method('createSessionDetails', async(req,Session,data) => {
    req.session.loggedIn = true;
    req.session.id = uuid.v1();
    await Session.create({ sessionId: req.session.id, userId:data });
    return req;
});

const Session=mongoose.model('Session',SessionSchema);


module.exports=Session;
