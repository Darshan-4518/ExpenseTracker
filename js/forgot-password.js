let mainOtp = 0;

let mainEmail = "";

async function callOTPApi(email) {
    fetch(`http://192.168.1.142:3000/api/otp?email=${email}`).then(async (e) => {
        const response = await e.json()
        mainOtp = response.otp;
    })
}

async function checkUsereExists(email) {

    let result = false;

    const response = await fetch(`http://192.168.1.142:3000/api/is-user-exists?email=${email}`);

    const data = await response.json()

    const msg = data.msg;
    const status = data.status;

    if (status == 200) {
        result = true;
    }


    return result;
}

const stepEmail = document.getElementById('step-email');
const stepOtp = document.getElementById('step-otp');
const stepReset = document.getElementById('step-reset');
const resendBtn = document.getElementById('resendOtpBtn');

document.getElementById('emailForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('emailInput').value;
    const output = await checkUsereExists(email);

    if (output) {
        await callOTPApi(email);
    } else {
        alert("User not exists please check your email");
        return
    }


    mainEmail = email;

    stepEmail.classList.add('hidden');
    stepOtp.classList.remove('hidden');
});

document.getElementById('otpForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const otp = document.getElementById('otpInput').value;

    if (otp != mainOtp) {
        alert('Invalid OTP');
        return
    }

    stepOtp.classList.add('hidden');
    stepReset.classList.remove('hidden');
});

document.getElementById('resetForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const pass = document.getElementById('newPassword').value;

    if (pass.length < 8 || pass.length > 20) {
        isValid = false;
        alert("password length nust be between 8 to 20");
        return
    }

    const confirm = document.getElementById('confirmPassword').value;
    if (pass !== confirm) {
        alert("Passwords do not match!");
        return;
    }


    const data = {
        email: mainEmail,
        otp: mainOtp,
        password: pass
    }

    fetch(`http://192.168.1.142:3000/api/change-password`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(async (e) => {
        const response = await e.json();

    })

    alert("Password reset successful!");
    window.location.href = "login.html";
});

resendBtn.addEventListener('click', function () {
    // Simulate resending OTP
    alert("OTP resent to your email!");


    const data = {
        email: mainEmail,
        otp: mainOtp,
    }

    fetch(`http://192.168.1.142:3000/api/otp`, {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(async (e) => {
        const response = await e.json();

    })

    callOTPApi(mainEmail);
});