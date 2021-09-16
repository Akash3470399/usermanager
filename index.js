let signUpForm = document.querySelector("#signupForm");
signUpForm.addEventListener('submit', signup);

let loginForm = document.querySelector("#loginForm");
loginForm.addEventListener('submit', login)


let err_div = document.querySelector("#error-div");
let login_erros = document.querySelector("#login-error-div");

let token = null;
try {
  token={
    access:window.localStorage.getItem('access_token'),
    refresh:window.localStorage.getItem('refresh_token')
  }
} catch (error) {
  null;
}

let base_url = "http://127.0.0.1:8000/";

function auth(){
  window.localStorage
}

function signup(e){
    e.preventDefault();

    formdata = new FormData(signUpForm);

    if(formdata.get('password1') != formdata.get('password2')){
        err_div.innerHTML = `<p style="color:#FF0000;"> Two passwords don't match.<p>`;
        signUpForm.reset();
        return null;
    }

    data = {
      email: formdata.get("email"),
      username: formdata.get("username"),
      password: formdata.get("password1"),
      address: formdata.get("address"),
    };

    fetch(base_url + "api/signup/", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        'Accept': "application/json",
        "x-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => {

        return res.json();
      })
      .then((data) => {
          err_div.innerHTML = "";//clearing previous errors messages
          if( 'errors' in data){
                obj_keys = Object.keys(data['errors']);
                obj_keys.forEach(field => {
                    err_div.innerHTML += `<p style="color:#FF0000;"> ${field} : ${data['errors'][field][0]}`
                });
          }
          else{
            let msg = `<p style="color:#00FF00;"> User with username ${data["username"]} is created, please <a href="#" onclick="javascript:signinform()" class="text-info text-decoration-none"> login</a></p>`;
            err_div.innerHTML += "";
            err_div.innerHTML = msg;

            // making login div visivle
            // document.querySelector("#signInSection").style.visibility ="visible";
            
          }
      });

}

function signinform() {
    document.querySelector("#signUpSection").style.display = "none";
    document.querySelector("#signUpSection").style.visibility = "hidden";
    document.querySelector("#signInSection").style.display ="block";
    document.querySelector("#signInSection").style.visibility ="visible";
    document.querySelector("#detailsSection").style.display="none";
    document.querySelector("#detailsSection").style.visibility="hiddne";
    login_erros.innerHTML = "";
}

function signupform(){
    document.querySelector("#signUpSection").style.display = "block";
    document.querySelector("#signUpSection").style.visibility = "visible";
    document.querySelector("#signInSection").style.display = "none";
    document.querySelector("#signInSection").style.visibility = "hiddne";
    document.querySelector("#detailsSection").style.display = "none";
    document.querySelector("#detailsSection").style.visibility = "hiddne";
    err_div.innerHTML = "";
}

function login(e) {
  e.preventDefault();
  formdata = new FormData(loginForm);

  data = {
    email: formdata.get("email"),
    password: formdata.get("password"),
  };

  fetch(base_url + "api/login/", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      'Accept': "application/json",
      "x-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      
      if('data' in data){
          clearScreen();
          showData(data['data']);
          window.localStorage.setItem("access_token", data["token"]["access"]);
          window.localStorage.setItem("refresh_token", data["token"]["refresh"]);

            token={
                          access:window.localStorage.getItem('access_token'),
                          refresh:window.localStorage.getItem('refresh_token')
                      }
      }
      else{
        login_erros.innerHTML += "";
        let msg = `<p style="color:#FF0000;">${data["errors"]} </p>`;

        login_erros.innerHTML = msg;
      }
      console.log(data);
    });

}

function clearScreen(){
      document.querySelector("#signUpSection").style.display = "none";
      document.querySelector("#signUpSection").style.visibility = "hiddne";
      document.querySelector("#signInSection").style.display = "none";
      document.querySelector("#signInSection").style.visibility = "hiddne";
      document.querySelector("#detailsSection").style.display = "block";
      document.querySelector("#detailsSection").style.visibility = "visible";
}

function showData(data){

  tableBody = document.querySelector("#detailTableBody");
  tableBody.innerHTML = "";
  data.forEach( (usr, i) => {
    detail = `<tr id="tr-${usr["id"]}">
                    <td>${usr["username"]}</td>
                    <td>${usr["email"]}</td>
                    <td>${usr["address"]}</td>
                    <td onclick="javascript:fillModalData(${usr["id"]})"><button class="btn btn-outline-info" data-bs-toggle="modal" data-bs-target="#editModal">Edit</button></td>
                    <td><button class="btn btn-outline-danger" onclick="deleteUser(${usr['id']})">Delete</button></td>
                  </tr>`;
    tableBody.innerHTML += detail;
  });
}

function fillModalData(id) {
  childs = document.querySelector("#tr-"+id).children;
  document.querySelector("#update-username").value = childs[0].innerText;
  document.querySelector('#update-email').value = childs[1].innerText;
  document.querySelector('#update-address').value = childs[2].innerText;
  document.querySelector('#usr-id').value = id;
  // childs = tr.children
}



function updateData(){//field

  req_data = {
    username:document.querySelector('#update-username').value,
    email:document.querySelector('#update-email').value,
    address:document.querySelector('#update-address').value,
    id:document.querySelector('#usr-id').value
  }
   fetch(base_url + "api/update/", {
     method: "POST",
     headers: {
       'Accept': "application/json",
       "x-Requested-With": "XMLHttpRequest",
       "Content-Type": "application/json",
        'Authorization':"Bearer " + token.access
     },
     body: JSON.stringify(req_data),
   })
     .then((res) => {
       return res.json();
     })
     .then((data) => {
       if ('data' in data){
         usr = data["data"];
         document.querySelector("#tr-" + req_data.id).innerHTML = `
                    <td>${usr["username"]}</td>
                    <td>${usr["email"]}</td>
                    <td>${usr["address"]}</td>
                    <td onclick="javascript:fillModalData(${req_data.id})"><button class="btn btn-outline-info" data-bs-toggle="modal" data-bs-target="#editModal">Edit</button></td>
                    <td><button class="btn btn-outline-danger" onclick="deleteUser(${req_data.id})">Delete</button></td>
                `;
                document.querySelector(".btn-close").click();
              }
              else{
                
                let errBox = document.querySelector("#updateDataErr"); 
                errBox.innerHTML = "";
                obj_keys = Object.keys(data["errors"]);
                  obj_keys.forEach((field) => {
                    errBox.innerHTML += `<p style="color:#FF0000;"> ${field} : ${data["errors"][field][0]}`;
                  });
              }
     });
}


function deleteUser(id){

     fetch(base_url + "api/delete/", {
       method: "POST",
       credentials: "same-origin",
       headers: {
         Accept: "application/json",
         "x-Requested-With": "XMLHttpRequest",
         "Content-Type": "application/json",
         'Authorization': "Bearer " + token.access,
       },
       body: JSON.stringify({ id: id }),
     })
       .then((res) => {
         return res.json();
       })
       .then((data) => {
         if ("data" in data) {
           document.querySelector("#tr-" + id).remove();
           if (document.querySelector("#detailTableBody").innerHTML == "") {
             document.querySelector("#logoutbtn").click();
           }
         }
       });
}