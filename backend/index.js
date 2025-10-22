const express = require("express")
const cors = require('cors')
const {makeScheduler} = require('./schedule_job')
const {getRndInteger} = require('./generate_otp')
const port="3000"
app = express()
app.use(express.json(),cors())
const {mongoose} = require("mongoose");
const { sendMail } = require("./mail_service")

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
        default:Date.now,
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
    email:{
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



return result;
}

async function findOne(Model,obj){
    const result = await Model.findOne(obj);

    return result;
}

async function findDataAndSortedByDate(Model,obj,isDesc) {

    let value = 1;

    if(isDesc){
        value = -1;
    }

    const result = await Model.find(obj).sort({ date: value });
    
    return result;
}

async function find(Model,obj) {
    const result = await Model.find(obj);
    
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

async function deleteOne(Model,obj) {
    const result = await Model.deleteOne(obj);

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
        error.push('firstName must be provided');
    }

    
    if(!email){
        isValid = false;
        error.push('email must be provided');
    }else if(await countDocuments(User,{'email':email})){
        isValid = false;
        error.push('email is already exists');
    }

    if(!password || password.length < 8 || password.length > 20){
        isValid = false;
        error.push('password length nust be between 8 to 20');
    }

    if(!currency){
        isValid = false;
        error.push('currency must be provided');
    }

    if(!family_name){
        isValid = false;
        error.push("Family name can not be Empty");
    }

    if(!goal){
        isValid=false;
        error.push('Please Enter Amount in Goal Field');
    }else if(goal <= 0){
        isValid=false;
        error.push("Saving Goal must be greater then 0");
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


    if(userObj){
        mess = "success";
        userId = userObj['_id'];
        status = 200;
    }


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

    const date = new Date();


    const amt = transaction.amount;
    const userId = transaction.userId;
    const isExpense = transaction.isExpense;
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

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

app.get('/api/transaction',async (req,res)=>{

    const monthInNumbers=["0","01","02","03","04","05","06","07","08","09","10","11","12"];

    const userId = req.query.userId;
    const month = req.query.month;
    const year = req.query.year;
    const actualMonth = monthInNumbers[month];
    const error = []

    let isValid = true;

    if(month < 1 || month > 12){
        isValid = false;
        error.push('Please Provide Valid Month');
    }

    if(year.length != 4){
        isValid = false;
        error.push('Please Provide Year of 4 digits');
    }

    if(!userId){
        isValid = false;
        error.push('Please Provide Userid ');
        // res.status(400).json({'msg':'Please Provide Userid'});
        return
    }else if(userId.length != 24){
        isValid = false;
        error.push('Userid must be of 24 Characters');
    }

    
    if(!isValid){
        res.status(400).json({'msg':'failed','error':error,'status':400});
        return
    }


    // res.status(200).json({'data':await find(TransactionAudit,{})});

    // res.status(200).json({'msg':'success'});

    res.status(200).json({'status':200,'msg':'success','data':await findDataAndSortedByDate(TransactionAudit,{date:{$gte:`${year}-${actualMonth}-01T00:00:00.000Z`,$lte:`${year}-${actualMonth}-31T23:59:59.999Z`},userId:userId},true)});

})

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
        error.push('description must be provide');
    }

    if(!amt){
        isValid = false;
        error.push('Amount must be provide');
    }else if(amt < 0){
        isValid = false;
        error.push('Amount must be greater then Zero');
    } 

    if(!userId  && userId.length != 24){
        isValid = false;
        error.push('Please Provide Userid');
    }
    
    if(!date){
        isValid = false;
        error.push('Please Provide date in YYYY-MM-DD format');
    }
    
    if(transactionType != 'income' && transactionType!='expense'){
        isValid = false;
        error.push('transactionType must be provided (either income or expense)');
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
        error.push('Please Provide Userid');
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

app.get(`/api/is-user-exists`,async (req,res)=>{
    const email = req.query.email;

    if(!email){
        isValid = false;
        res.status(404).json({'msg':'email must be provided','status':404});
        return
    }

    let msg = "not exists";
    let status = 404;
    if(await countDocuments(User,{email:email})){
        status = 200;
        msg = "exists";
    }

    res.status(status).json({'msg':msg,status:status});
})



app.get('/api/otp',async(req,res)=>{
    const otpCode = getRndInteger(100000,999999);
    const to = req.query.email;

    // console.log(userId);

    // if(userId.length != 24 || ! await countDocuments(User,{_id: new ObjectId(userId)})){
    //     res.status(401).json({'msg':'failed','error':'invalid userId'});
    //     return
    // }

    await create(OtpVerification,{otpCode:otpCode,email:to});

    const from = "darshanvirani010@gmail.com";
    const subject = "OTP Verifications"

    sendMail(from,to,subject,"Your OTP is " + otpCode);

    res.status(201).json({'msg':'success','otp':otpCode});

})

app.delete("/api/otp",async (req,res) =>{
    const data = req.body;

    const email = data.email;
    const otp = data.otp;

    
    if(!email){
        res.status(400).json({'msg':'email must be provided'});
        return
    }else if(! await countDocuments(User,{'email':email})){
        isValid = false;
        res.status(404).json({'msg':'email is not exists'});
        return
    }


    await deleteOne(OtpVerification,{email:email,otpCode:otp});

    res.status(200).json({'msg':"sucessfully deleted"});

})

app.put('/api/change-password',async (req,res) =>{
    const data = req.body;

    const email = data.email;
    const password = data.password;
    const otp = data.otp;
    const isValid = true;
    const error = [];
    
    if(!email){
        isValid = false;
        error.push('email must be provided');
    }else if(! await countDocuments(User,{'email':email})){
        isValid = false;
        error.push('email is not exists');
    }

    if(!password || password.length < 8 || password.length > 20){
        isValid = false;
        error.push('password length nust be between 8 to 20');
    }

    if(!isValid){
        res.status(400).json({'msg':'failed','error':error});
        return
    }

    await updateOne(User,{email:email},{password:password});

    await deleteOne(OtpVerification,{email:email,otpCode:otp});

    res.status(200).json({'msg':'Password Succesfully Upadted'});

} )
