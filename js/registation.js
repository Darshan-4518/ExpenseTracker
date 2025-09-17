document.getElementById('registerForm').addEventListener('submit', e => {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;
    const confirm_pass = document.getElementById('confirm_pass').value;
    const family_name = document.getElementById('family_name').value.trim();
    const currency = document.getElementById('curreny_type').value;
    const saving_goal = document.getElementById('saving_goal').value;
    // const profile_pic = document.getElementById('pic').files[0];

    let isValid = true;

    if(!fullName){
        isValid = false;
        alert("Name can not be Empty");
    }
    if(!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)){
        isValid = false;
        alert("email is invalid");
    }

    if(pass.length < 8 || pass.length > 20){
        isValid=false;
        alert("password length nust be between 8 to 20");
    }
    else if(pass !== confirm_pass){
        isValid = false;
        alert("password don't match with confirm password");
    }

    if(!family_name){
        isValid = false;
        alert("Family name can not be Empty");
    }

    if(!saving_goal){
        isValid=false;
        alert('Please Enter Amount in Goal Field');
    }else if(saving_goal <= 0){
        isValid=false;
        alert("Saving Goal must be greater then 0");
    }

    // console.log(saving_goal);
    
    if(isValid){

        let data = {
            fullName:fullName,
            email:email,
            pass:pass,
            currency:currency,
            goal:saving_goal,
            family_name:family_name
        }

        fetch("http://localhost:3000/api/user/signup",{
            method:"POST",
            headers:{'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
         .then((response)=>{
            if(response.status === 201){
                window.location.href="http://127.0.0.1:5500/pages/login.html";
            }else{
                console.log("failed"); 
            }
         }).catch((e)=>{
            console.log(e);
         })

    }

  });