document.getElementById("signOut").addEventListener("click", ()=>
{
    var mesage = confirm("¿Estás seguro que deseas cerrar sesión?")
    if(mesage)
    {
        firebase.auth().signOut().then(function() {
            // Sign-out successful.
            window.location.href = "index.html";
          }).catch(function(error) {
            // An error happened.
          });
    }
});