//registro al sistema
const signupForm = document.querySelector("#signup_form");
const districtList = document.querySelector("#select_districts");
signupForm.addEventListener("submit", (e)=>
{
    e.preventDefault();

    const email = signupForm["email_field"].value;
    const password = signupForm["password_field"].value;
    const nombres = signupForm["names_field"].value;
    const apellidos = signupForm["lastnames_field"].value;
    const celular = signupForm["phone_field"].value;
    const dni = signupForm["dni_field"].value;
    const distrito = signupForm["select_districts"].value;
    const password2 = signupForm["confirm_password_field"].value;
    expresion1 = /^([0-9_\.-]+)@aloe\.ulima\.edu\.pe/ ;
    const code = email.split("@")[0];

    if(email== "" || password== "" || nombres=="" || apellidos == "" || celular == "" || dni == "" ||
        distrito == " " || password2 == "" ){
        alert("Todos los campos son obligatorios.")
        return false;
      }
    else if(!expresion1.test(email)){
        alert("El correo no es valido.")
        return false;
    }
    else if(code.length!=8)
    {
        alert("El código universitario debe tener 8 caracteres.")
        return false;
    }
    else if(dni.length != 8)
    {
        alert("DNI inválido.")
        return false;
    }
    else if(celular.length!=9)
    {
        alert("Número de teléfono inválido.")
        return false;
    }
    else if( password != password2 ){
        alert("Ambas contraseñas no coinciden. ")
        return false;
    }
    else if( celular.length > 9 ){
        alert("El celular ingresado es incorrecto. ")
        return false;
    }
    else if( dni.length > 8 ){
        alert("El DNI ingresado es incorrecto. ")
        return false;
    }
    //else if(password.length> 8){

      //  alert("La contraseña debe tener al menos 6 caracteres.");
       // return false;
    //}
      
    else{

    //Crear el usuario en Firebase Auth
    auth.createUserWithEmailAndPassword(email, password)
    .then(cred => 
        {
            return db.collection(USERS_COLLECTION).doc(cred.user.uid).set(
                {
                    names: signupForm["names_field"].value,
                    last_names: signupForm["lastnames_field"].value,
                    email: email,
                    phone: signupForm["phone_field"].value,
                    dni: signupForm["dni_field"].value,
                    district: signupForm["select_districts"].value,
                    ridesAsDriver: [],
                    ridesAsPassenger: [],
                    vehicles: [],
                    calification_passenger: 0,
                    calification_driver: 0,
                    currentRideAsDriver: "",
                    currentRideAsPassenger: ""
                }
            );
        })
    .then(()=>
    {
        window.location.href = INDEX_PAGE;
    })
    .catch(function(error) 
    {
        // Handle Errors here.
        switch(error.code)
        {
            case ERROR_USER_ALREADY_EXIST:
                alert("El correo ya se encuentra siendo utilizado por otro usuario.");
                break;
            case ERROR_WEAK_PASSWORD:
                alert("La contraseña debe ser a partir de 6 carácteres.");
                break;
        }
      }).then(()=>
      {
          signupForm.reset();
      });
      }
});

function addElementToSelect(select, doc)
{
    let option = document.createElement("option");
    option.setAttribute("value", doc.data().nombre);
    option.innerHTML = doc.data().nombre;
    select.appendChild(option);
}

db.collection(DISTRICTS_COLLECTION).get().then((snapshot)=>
{
    snapshot.forEach(function(doc) {
        addElementToSelect(districtList, doc);
    });
});
