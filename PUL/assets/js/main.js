const loginForm = document.querySelector("#login_form");


loginForm.addEventListener("submit", (e)=>
{
  e.preventDefault();

  const email = loginForm["emailField"].value;
  const password = loginForm["passwordField"].value;

  expresion1 = /^([a-z0-9_\.-]+)@aloe\.ulima\.edu\.pe/             
  if(email== "" || password== ""){
    alert("Los campos email y password son obligatorios.")
    return false;
  }
  else if(!expresion1.test(email)){
    alert("El correo no es valido.")
    return false;

  }
  else{
  auth.signInWithEmailAndPassword(email, password)
  .then((user)=>
  {
    console.log(user.uid + " logged!");
    loginForm.reset();
  })
  
  .catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    switch(errorCode)
    {
      case ERROR_AUTH_WRONG_PASSWORD:
        alert("Correo o contraseña incorrectos.");
        break;
      case ERROR_USER_NOT_FOUND:
        alert("El usuario no se encuentra registrado.");
        break;
      case ERROR_INVALID_EMAIL:
        alert("Dirección de correo electrónico no válida.");
        break;
    }
  });
  }

});


firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    var displayName = user.displayName;
    var email = user.email;
    var emailVerified = user.emailVerified;
    var photoURL = user.photoURL;
    var isAnonymous = user.isAnonymous;
    var uid = user.uid;
    var providerData = user.providerData;
    // ...
    console.log("Sign in!")
    window.user = user
    window.location.href = SEARCH_RIDE_PAGE;
  } else {
    // User is signed out.
    // ...
  }
});