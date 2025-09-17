const express = require("express")
const cors = require('cors')
const {makeScheduler} = require('./schedule_job')
const {getRndInteger} = require('./generate_otp')
const port="3000"
app = express()
app.use(express.json(),cors())
const mongoose = require("mongoose");


const mongoConnectionString="mongodb://127.0.0.1:27017/expense_tracker"
const monthNames = ['Jan','Fab','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec']
mongoose.connect(mongoConnectionString).then(()=>{
    console.log("Connection with db Established");
}).catch((err)=>{
    console.log(`error => ${err}`)
})  

const userSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    family_name:{
        type:String,
        required:true
    },
    currency:{
        type:String,
        required:true
    },
    goal:{
        type:Number,
        required:true
    },
    isVerified:{
        type:Boolean,
        required:true
    }
});

const transactionAuditSchema = new mongoose.Schema({
    date : {
        type:Date,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    isExpense:{
        type:Boolean,
        required:true,
    },
    userId:{
        type:String,
        required:true
    }
});

const incomeExpenseTrackerSchema = new mongoose.Schema({
    month:{
        type:String,
        required:true
    },
    year:{
        type:String,
        required:true
    },
    income:{
        type:Number,
        required:true
    },
    expense:{
        type:Number,
        required:true
    },
    userId:{
        type:String,
        required:true
    }
})

const otpVerificationSchema = new mongoose.Schema({
    otpCode:{
        type:Number,
        required:true
    },
    isUsed:{
        type:Boolean,
        required:true,
        default:false
    },
     userId:{
        type:String,
        required:true
    }
}) 

const User = mongoose.model("user",userSchema);
const TransactionAudit = mongoose.model("transaction_audit",transactionAuditSchema);
const IncomeExpenseTracker = mongoose.model("income_expense_tracker",incomeExpenseTrackerSchema);
const OtpVerification = mongoose.model("otp_Verification",otpVerificationSchema);

async function countDocuments(Model,obj) {
const result = await Model.countDocuments(obj);
return result;
}

async function create(Model,obj) {
const result = await Model.create(obj);

console.log("result",result);

return result;
}

async function findOne(Model,obj){
    const result = await Model.findOne(obj);

    return result;
}


async function findMultiple(Model,obj){
    const result = await Model.find(obj);

    return result;
}

async function updateOne(Model,filterObj,updateObj){
    const result = await Model.updateOne(filterObj,updateObj);

    return result;
}

app.get('/',(req,res)=>{
    res.status(200).send("hello from express");
})

app.post('/api/user/signup',async (req,res)=>{
    const body = req.body;

    let fullName = body.fullName;
    let email = body.email;
    let password = body.pass;
    let currency = body.currency;
    let goal = body.goal;
    let family_name = body.family_name;

    let isValid = true;
    let error = []

    if(!firstName){
        isValid = false;
        error.append('firstName must be provided');
    }

    
    if(!email){
        isValid = false;
        error.append('email must be provided');
    }else if(await countDocuments(User,{'email':email})){
        isValid = false;
        error.append('email is already exists');
    }

    if(!password || password.length < 8 || password.length > 20){
        isValid = false;
        error.append('password length nust be between 8 to 20');
    }

    if(!currency){
        isValid = false;
        error.append('currency must be provided');
    }

    if(!family_name){
        isValid = false;
        error.append("Family name can not be Empty");
    }

    if(!goal){
        isValid=false;
        error.append('Please Enter Amount in Goal Field');
    }else if(goal <= 0){
        isValid=false;
        error.append("Saving Goal must be greater then 0");
    }

    if(!isValid){
        res.status(400).json({'msg':'failed','error':error});
        return
    }


    let userObj = {
        fullName:fullName,
        email:email,
        password:password,
        currency:currency,
        goal:goal,
        family_name:family_name
    }

    await create(User,userObj);
    
    res.status(201).json({'msg':"sucess"});
})

app.post("/api/user/login",async (req,res)=>{
    let body = req.body;
    let status = 401;
    let mess = "failed";
    let userId=null;

    const userObj = await findOne(User,{email:body.email,password:body.password});


    console.log(userObj);

    if(userObj){
        mess = "success";
        userId = userObj['_id'];
        status = 200;
    }

    console.log(mess);

    res.status(status).json({'mess':mess,'userId':userId});
})

app.get('/api/user',async (req,res)=>{
    const userId = req.query.userId;
    
    if(userId.length != 24){
        res.status(401).json({'msg':'failed','error':'invalid userId'});
        return
    }
    let mess = "failed";
    let status = 404;
    let user = null;

    let userObj = await findOne(User ,{_id:userId});

    if(userObj){
        mess = "success";
        status = 200;
        user = userObj;
    }

    res.status(status).json({mess:mess,user:user});

})

let createTransaction = async (transaction) => {

    const date = transaction.date;
    const amt = transaction.amount;
    const userId = transaction.userId;
    const isExpense = transaction.isExpense;
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()

    const searchFilterObj = {
        month : month,
        year : year
    }

    const updateObj = isExpense ? {
        $inc : {
            "expense" : amt
        }
    } : {
        $inc :  {
            "income" : amt
        }
    };

    await create(TransactionAudit,transaction);

    if(! await countDocuments(IncomeExpenseTracker,searchFilterObj)){
        await create(IncomeExpenseTracker,{
            month : month,
            year : year,
            userId : userId,
            income : 0,
            expense : 0
        })
    }


    await updateOne(IncomeExpenseTracker,searchFilterObj,updateObj);
}

app.post('/api/transaction',async (req,res)=>{
    const data = req.body;

    const description = data.description.trim();
    const amt = data.amount;
    const date = data.date;
    const userId = data.userId;
    const transactionType = data.transactionType.toLowerCase();

    let isValid = true;
    let error = [];

    if(!description){
        isValid = false;
        error.append('description must be provide');
    }

    if(!amt){
        isValid = false;
        error.append('Amount must be provide');
    }else if(amt < 0){
        isValid = false;
        error.append('Amount must be greater then Zero');
    } 

    if(!userId  && userId.length != 24){
        isValid = false;
        error.append('Please Provide Userid');
    }
    
    if(!date){
        isValid = false;
        error.append('Please Provide date in YYYY-MM-DD format');
    }
    
    if(transactionType != 'income' && transactionType!='expense'){
        isValid = false;
        error.append('transactionType must be provided (either income or expense)');
    }
    

    if(!isValid){
        res.status(400).json({'msg':'failed','error':error});
        return
    }

    const formatedDate = new Date(date).toLocaleString();

    const isExpense = transactionType == 'expense';

    const transactionData = {
        description:description,
        amount:amt,
        date:formatedDate,
        userId:userId,
        isExpense: isExpense
    };


    createTransaction(transactionData);

    res.status(201).json({'msg':'sucess'});

})

app.get('/api/transcation/get-income-expense',async (req,res)=>{
    const userId = req.query.userId;
    const month = req.query.month;
    const year = req.query.year;

    let isValid = true;
    let error = [];

    if(!userId  && userId.length != 24){
        isValid = false;
        error.append('Please Provide Userid');
    }

    if(!isValid){
        res.status(400).json({'msg':'failed','error':error});
        return
    }

    const data = await findOne(IncomeExpenseTracker,{userId:userId,month:month,year:year});

    res.status(200).json(data);
})

app.listen(port,()=>{
    console.log(`Server Started at port ${port}`);
})


makeScheduler('0 0 0 1 */1 *', async ()=>{
    const users = await findMultiple(User,{});

    const date = new Date();
    const currMonth = date.getMonth();
    const currYear = date.getFullYear();

    const monthToBeUsedToFindData = currMonth - 1;
    const yearToBeUsedToFindData = currYear;

    if( currMonth == 0 ){
        monthToBeUsedToFindData = 11;
        yearToBeUsedToFindData -= 1;
    }

  
    for(let user of users){
        let userId=user._id;
        let data = await findOne(IncomeExpenseTracker,{month:monthNames[monthToBeUsedToFindData],year:yearToBeUsedToFindData,userId:userId});

        let profit = data.income - data.expense;

        let transaction={
            date:date,
            userId:userId,
        }

        if(profit >= 0){
            transaction.description=`Profit of ${monthNames[monthToBeUsedToFindData]}'${yearToBeUsedToFindData}`;
            transaction.amount=profit;
            transaction.isExpense=false;
        }else{
            transaction.description=`Lose of ${monthNames[monthToBeUsedToFindData]}'${yearToBeUsedToFindData}`;
            transaction.amount=profit;
            transaction.isExpense=true;
        }

        await createTransaction(transaction);
    }
})

app.get('/api/otp',async(req,res)=>{
    const otpCode = getRndInteger(100000,999999);

    const userId = req.query.userId;

    if(userId.length != 24 || ! await countDocuments(User,{_id:userId})){
        res.status(401).json({'msg':'failed','error':'invalid userId'});
        return
    }

    await create(OtpVerification,{otpCode:otpCode,userId:userId});

    res.status(201).json({'msg':'success','otp':otpCode});

})