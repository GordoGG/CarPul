//Colecciones
const VEHICLES_COLLECTION = "vehicles";
const USERS_COLLECTION = "users";
const RIDES_COLLECTION = "rides";
const DISTRICTS_COLLECTION = 'districts';

//HTMLS
const INDEX_PAGE = "index.html";
const SEARCH_RIDE_PAGE = "BuscarViaje.html";
const CURRENT_DRIVE_PAGE = "ViajeActual.html";
const RATING_PAGE = "CalificarConductor.html";

//ERRORS
const ERROR_USER_ALREADY_EXIST = "auth/email-already-in-use";
const ERROR_WEAK_PASSWORD = "auth/weak-password";
const ERROR_AUTH_WRONG_PASSWORD = "auth/wrong-password";
const ERROR_USER_NOT_FOUND = "auth/user-not-found";
const ERROR_INVALID_EMAIL = "auth/invalid-email";

//STRINGS
const ROLE_DRIVER = "Conductor";
const ROLE_PASSENGER = "Pasajero";
const MESSAGE_NO_RIDES = "Aún no tienes nigún viaje, ¡Busca un viaje y comienza la experiencia con PUL!";


//FUNCTIONS
function createCalificationElement(calification) 
{
    let p = document.createElement("p");
    p.innerHTML = 'Calificación: ' + calification + '  <span class="fa fa-car"></span>';
    return p;
}

function createDivAndSetClass(value) {
    var div = document.createElement("div");
    div.setAttribute("class", value);
    return div;
}