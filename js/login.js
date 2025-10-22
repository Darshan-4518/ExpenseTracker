document.getElementById('loginForm').addEventListener('submit', e => {

  let email = document.getElementById('email').value;
  let pass = document.getElementById('pass').value;

  let data = {
    email: email,
    password: pass
  }

  e.preventDefault();
  fetch("http://localhost:3000/api/user/login", {
    "method": 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(async (response) => {

      if (response.ok) {
        let responseObj = await response.json();
        let userId = responseObj.userId;

        localStorage.setItem("userId", userId);

        window.location.href = "../index.html"
      } else {
        alert('incorrect email or password');
      }
    }).catch((e) => {
      alert("Something went wrong");
    })
});