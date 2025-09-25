document.getElementById('loginForm').addEventListener('submit', e => {

  let email = document.getElementById('email').value;
  let pass = document.getElementById('pass').value;

  let data = {
    email: email,
    password: pass
  }

  e.preventDefault();
  fetch("http://192.168.1.142:3000/api/user/login", {
    "method": 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(async (response) => {

      if (response.ok) {
        let responseObj = await response.json();
        let userId = responseObj.userId;
        let role = responseObj.ROLE;
        localStorage.setItem("userId", userId);
        localStorage.setItem("role", role);

        let destination = "../index.html"


        if(responseObj.ROLE === "ADMIN"){
          console.log("inside this");
          destination = "./admin/index.html"
        }


        window.location.href = destination;
      } else {
        alert('incorrect email or password');
      }
    }).catch((e) => {
      alert("Something went wrong");
    })
});