let firstNameEle = document.getElementById('firstName');
let emailEle = document.getElementById('email');
let passEle = document.getElementById('pass');
let confirmPassEle = document.getElementById('confirm_pass');
let familyNameEle = document.getElementById('family_name');
let currenyEle = document.getElementById('curreny_type');
let savingGoalEle = document.getElementById('saving_goal')

let firstNameVal = "";
let emailVal = "";
let pass = "";
let confirmPass = "";
let familyName = "";
let currency = "";
let savingGoal = "";

let generatedOtp = "";

async function callOTPApi(email) {
    fetch(`http://localhost:3000/api/otp?email=${email}`).then(async (e) => {
        const response = await e.json()
        generatedOtp = response.otp;

        console.log(response.otp);

    })
}

async function checkUsereExists(email) {

    let result = false;

    const response = await fetch(`http://localhost:3000/api/is-user-exists?email=${email}`);

    const data = await response.json()

    const msg = data.msg;
    const status = data.status;

    if (status == 200) {
        result = true;
    }

    return result;
}

function verifyOtp() {
    const enteredOtp = document.getElementById('otpInput').value;
    if (enteredOtp == generatedOtp) {
        alert("Account verified successfully!");
        document.getElementById('otpModal').classList.add('hidden');

        let data = {
            firstName: firstNameVal,
            email: emailVal,
            pass: pass,
            currency: currency,
            goal: savingGoal,
            family_name: familyName,
            otp:generatedOtp
        }

        fetch("http://localhost:3000/api/user/signup", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(async (response) => {
                if (response.status === 201) {
                    window.location.href = "http://127.0.0.1:5500/pages/login.html";
                } else {
                    console.log("failed",await response.json());
                }
            }).catch((e) => {
                console.log(e);
            })
        

        document.getElementById('registerForm').reset();
    } else {
        alert("Invalid OTP. Please try again.");
    }
}

function resendOtp() {

    const data = {
        email: emailVal,
        otp: generatedOtp,
    }

    fetch(`http://localhost:3000/api/otp`, {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(async (e) => {
        const response = await e.json();

        console.log(response.msg);

    })

    callOTPApi(emailVal);
    alert("A new OTP has been sent to your email.");
}

function cancelOtp() {
    document.getElementById('otpModal').classList.add('hidden');
    document.getElementById('otpInput').value = '';
}


document.getElementById('registerForm').addEventListener('submit',async (e) => {
    e.preventDefault();

    firstNameVal = firstNameEle.value.trim();
    emailVal = emailEle.value.trim();
    pass = passEle.value;
    confirmPass = confirmPassEle.value;
    familyName = familyNameEle.value.trim();
    currency = currenyEle.value;
    savingGoal = savingGoalEle.value;
    // const profile_pic = document.getElementById('pic').files[0];

    let isValid = true;

    if (!firstNameVal) {
        isValid = false;
        alert("Name can not be Empty");
    }
    if (!emailVal.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
        isValid = false;
        alert("email is invalid");
    }else if(await checkUsereExists(emailVal)){
        isValid = false;
        alert("email is already exists");
    }

    if (pass.length < 8 || pass.length > 20) {
        isValid = false;
        alert("password length nust be between 8 to 20");
    }
    else if (pass !== confirmPass) {
        isValid = false;
        alert("password don't match with confirm password");
    }

    if (!familyName) {
        isValid = false;
        alert("Family name can not be Empty");
    }

    if (!savingGoal) {
        isValid = false;
        alert('Please Enter Amount in Goal Field');
    } else if (savingGoal <= 0) {
        isValid = false;
        alert("Saving Goal must be greater then 0");
    }

    // console.log(saving_goal);

    if (isValid) {
        callOTPApi(emailVal);
        document.getElementById('otpModal').classList.remove('hidden');
    }

});