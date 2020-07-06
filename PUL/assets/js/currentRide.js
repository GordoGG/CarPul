function showProgress() {
    document.querySelector("#progressBar").removeAttribute("hidden");
    document.querySelector("#progressBar").setAttribute('visible', 'true');
    document.querySelector("#container_ride").style.visibility = 'hidden';
}

function hideProgress() {
    document.querySelector("#progressBar").removeAttribute("visible");
    document.querySelector("#progressBar").setAttribute('hidden', 'true');
    document.querySelector("#container_ride").style.visibility = 'visible';
}

//hideProgress();
auth.onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      db.collection(USERS_COLLECTION).doc(user.uid).get()
      .then((doc)=>
      {
          let usuario = doc.data();
          let currentRideAsDriver = usuario.currentRideAsDriver;
          let currentRideAsPassenger = usuario.currentRideAsPassenger;
          let currentDrive = "";
          let role = "";
          if(currentRideAsDriver!="")
          {
              currentDrive = currentRideAsDriver;
              role = ROLE_DRIVER;
          }
          else if(currentRideAsPassenger!="")
          {
              currentDrive = currentRideAsPassenger;
              role = ROLE_PASSENGER;
          }
          else
          {
              window.location.href = INDEX_PAGE;
          }
          fetchData(currentDrive, role);
      });
    } else 
    {
        window.location.href = INDEX_PAGE;
    }
  });


  async function fetchData(ride_id, role)
  {
      await db.collection(RIDES_COLLECTION).doc(ride_id).get()
      .then((doc)=>
      {
          let ride = doc.data();
          let driver_id = doc.id.split(ride.hour)[0];
          let address = "Dirección: " + ride.address;
          let hour = "Hora de salida: "+ride.hour;
          let seats = "Asientos disponibles: "+ride.seats;
          let location = "Ubibación del vehículo: "+ride.location;
          let vehicle = ride.vehicle;
          let passengers = ride.passengers;
          addTextToElement("role", role);
          addTextToElement("direccion", address);
          addTextToElement("horaSalida", hour);
          addTextToElement("asientos", seats);
          addTextToElement("ubicacion", location)
          let listPassengers = document.querySelector("#passengers");
          let cardPassengers = document.querySelector("#pasajeros");
          if(passengers.length > 0)
          {
              passengers.forEach((passenger)=>
              {
                  addPassengerToList(listPassengers, passenger);
              });
          }
          else
          {
              cardPassengers.style.visibility = "hidden";
          }
          db.collection(VEHICLES_COLLECTION).doc(vehicle).get()
          .then((document)=>
          {
              let car = document.data();
              let model = "Modelo: " + car.model;
              let plate = "Placa: "+car.plate;
              let color = "Color: "+car.color;
              addTextToElement("modelo", model);
              addTextToElement("placa", plate);
              addTextToElement("color", color);
          })
          db.collection(USERS_COLLECTION).doc(driver_id).get()
          .then((document)=>
          {
              let driver = document.data();
              let names = driver.names;
              let last_names = driver.last_names;
              let fullName = names + " " + last_names;
              addTextToElement("nombreConductor", "Conductor: "+fullName);
          })
      })
      .then(()=>
      {
          hideProgress();
      });
  }

  async function addPassengerToList(list, passenger)
  {
      return await db.collection(USERS_COLLECTION).doc(passenger).get()
      .then((doc)=>
      {
          let passenger = doc.data();
          let names = passenger.names;
          let last_names = passenger.last_names;
          let fullName = names + " "+ last_names;

          //Creando el elemento en la lista
          let li = document.createElement("li");
          li.innerHTML = fullName;
          list.appendChild(li);
      })
  }

  function addTextToElement(id, value)
  {
      document.querySelector("#"+id).innerHTML = value;
  }
/*var queryString = decodeURIComponent(window.location.search);
queryString = queryString.substring(1);
var queries = queryString.split("&");
var ride = queries[0].split("=")[1];
var role = queries[1].split("=")[1];*/