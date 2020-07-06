const districtList = document.querySelector("#select_districts1");
var nombre = document.querySelector("#names_field1");
var apellido = document.querySelector("#last_names1");
var dni = document.querySelector("#dni1");
var correo = document.querySelector("#email1");

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

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
    


    var documento = db.collection("users").doc(user.uid);

    documento.get().then(function(doc) {
    if (doc.exists) {
        nombre.innerHTML= doc.data().names;
        apellido.innerHTML=doc.data().last_names;
        dni.innerHTML=doc.data().dni;
        document.getElementById("phone1").value=doc.data().phone;
        document.getElementById("select_districts1").value=doc.data().district;
        correo.innerHTML=doc.data().email;
    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
    }
    }).catch(function(error) {
    console.log("Error getting document:", error);
    });

    } else {
      // No user is signed in.
    }
  });

 

  function editar(){
    
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // User is signed in.
            var dc = db.collection("users").doc(user.uid);
            var t = document.getElementById("phone1").value;
            var d = document.getElementById("select_districts1").value;
            if(t == "" || d == ""){
                alert("Debe ingresar telefono y distrito para actualizar.")
                return false;
            }
            else if( t.length > 9 ){
                alert("El celular ingresado es incorrecto. ")
                return false;
            }
            else{
            return dc .update({
                phone:t,
                district:d
            })
            .then(function() {
                console.log("datos actualizados.");
                alert("Sus datos han sido actualizados.")
                returnPage();
                return false;
                
            })
            .catch(function(error){
                console.error("Error al actualizar." + error);
            });
            }
        } else {
          // No user is signed in.
        }
      });

    function returnPage(){
        window.location.href="Perfil.html";
    }

    














        
            
        
      
  }