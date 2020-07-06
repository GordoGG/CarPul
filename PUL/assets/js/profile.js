auth.onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in.
    getUserData(user.uid);
  } else {
    window.location.href = INDEX_PAGE;
  }
});

function showProgress() {
  document.querySelector("#progressBar").style.visibility = 'visible';
  document.querySelector("#cartaPerfil").style.visibility = 'hidden';
}

function hideProgress() {
  document.querySelector("#progressBar").setAttribute('hidden', 'true');
  document.querySelector("#cartaPerfil").style.visibility = 'visible';
}
showProgress();
function getUserData(uid) {
  var docRef = db.collection(USERS_COLLECTION).doc(uid);
  docRef.get().then(function (doc) {
    let user = doc.data();
    let objects = [
      {
        element: document.querySelector("#names"),
        value: user.names
      },
      {
        element: document.querySelector("#last_names"),
        value: user.last_names
      },
      {
        element: document.querySelector("#dni"),
        value: user.dni
      },
      {
        element: document.querySelector("#phone"),
        value: user.phone
      },
      {
        element: document.querySelector("#district"),
        value: user.district
      },
      {
        element: document.querySelector("#email"),
        value: user.email
      }
    ]

    objects.forEach(Object => {
      fetchData(Object.element, Object.value);
    });
    let divVehicle = document.querySelector("#vehicles");
    let vehicles = user.vehicles;
    let list_vehicles = document.querySelector("#list_vehicles");
    if (vehicles.length != 0) {
      vehicles.forEach(function (vehicle) {
        let element = document.createElement("li");
        let vehicleRef = db.collection(VEHICLES_COLLECTION).doc(vehicle);
        vehicleRef.get().then((car) => {
          let model = car.data().model;
          let color = car.data().color;
          let plate = car.data().plate;
          element.innerHTML = model + " " + color + " " + plate;
        });
        list_vehicles.appendChild(element);
      })
    }
    else {
      divVehicle.setAttribute("class", "text-hide");
    }
  }).then(function () {
    hideProgress();
  }).catch(function (error) {
    console.log("Error getting document:", error);
  });
}

function fetchData(element, value) {
  element.innerHTML = value;
}