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
          let lastRide = usuario.lastRide;
          let currentDrive = "";
          let role = "";
          if(lastRide!="")
          {
            window.location.href = RATING_PAGE;
          }
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
          fetchData(doc.id, currentDrive, role);
      });
    } else 
    {
        window.location.href = INDEX_PAGE;
    }
  });


  async function fetchData(user_id, ride_id, role)
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
          .then((conductor)=>
          {
              let driver = conductor.data();
              let names = driver.names;
              let last_names = driver.last_names;
              let fullName = names + " " + last_names;
              let calification_driver = driver.calification_driver;
              addTextToElement("nombreConductor", "Conductor: "+fullName);
              document.querySelector("#nombreConductor").appendChild(createCalificationElement(calification_driver));
          })
          document.querySelector("#finish").addEventListener("click", ()=>
          {
              let message = confirm("¿Deseas finalizar este viaje?");
              if(message)
              {
                  switch(role)
                  {
                      case ROLE_DRIVER:
                          finishRideAsDriver(user_id, ride_id);
                          break;
                      case ROLE_PASSENGER:
                          showProgress();
                          finishRideAsPassenger(user_id, ride_id);
                          break;
                  }
              }
          });
      })
      .then(()=>
      {
          hideProgress();
      });
  }

  async function finishRideAsDriver(user_id, ride_id)
  {
      await db.collection(RIDES_COLLECTION).doc(ride_id).get().then((doc)=>
      {
          let ride = doc.data();
          let lastRide = ride_id+"-"+ROLE_DRIVER;
          let passengers = ride.passengers;
          passengers.forEach((passenger)=>
          {
              let lastRidePassenger = ride_id +"-"+ ROLE_PASSENGER;
              updateCurrentRideAsPassengerForPassengers(passenger, lastRidePassenger);
          });
          db.collection(RIDES_COLLECTION).doc(ride_id).update(
            {
                isFinished: true,
                isAvailable: false
            }
          ).then(()=>
          {
              db.collection(USERS_COLLECTION).doc(user_id).update(
                  {
                      currentRideAsDriver: "",
                      lastRide: lastRide
                  }
              ).then(()=>
              {
                alert("Gracias por viajar con PUL");
                hideProgress();
                window.location.href = RATING_PAGE;
              });
          })
      });
  }

  async function updateCurrentRideAsPassengerForPassengers(passenger_id, lastRide)
  {
      await db.collection(USERS_COLLECTION).doc(passenger_id).update(
          {
              currentRideAsPassenger: "",
              lastRide: lastRide
          }
      ).then(()=>
      {
          console.log('Pasajero '+passenger_id + "Eliminado");
      });
  }

  async function finishRideAsPassenger(user_id, ride_id)
  {
      await db.collection(RIDES_COLLECTION).doc(ride_id).get().then((doc)=>
      {
          let ride = doc.data();
          let lastRide = doc.id + "-" +ROLE_PASSENGER;
          let seats = ride.seats;
          let isAvailable = ride.isAvailable;
          if(isAvailable)
          {
              seats = seats + 1;
          }
          db.collection(RIDES_COLLECTION).doc(ride_id).update(
              {
                  seats: seats,
                  passengers: firebase.firestore.FieldValue.arrayRemove(user_id)
              }
          ).then(()=>
          {
              db.collection(USERS_COLLECTION).doc(user_id).update(
                  {
                      currentRideAsPassenger: "",
                      lastRide: lastRide
                  }
              ).then(()=>
              {
                  window.location.href = RATING_PAGE;
                  hideProgress();
              })
          });
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
          let calification = passenger.calification_passenger;

          //Creando el elemento en la lista
          let li = document.createElement("li");
          li.innerHTML = fullName;
          li.appendChild(createCalificationElement(calification));
          list.appendChild(li);
      })
  }

  function addTextToElement(id, value)
  {
      document.querySelector("#"+id).innerHTML = value;
  }