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


auth.onAuthStateChanged(function (user) {
    if (user) {
      // User is signed in.
      db.collection(USERS_COLLECTION).doc(user.uid).get()
      .then((doc)=>
      {
          let user = doc.data();
          let id = doc.id;
          let ride_id = user.lastRide.split("-")[0];
          let role = user.lastRide.split("-")[1];
          if(role==ROLE_PASSENGER)
          {
              showCardForPassenger(ride_id, id);
          }
          else if(role==ROLE_DRIVER)
          {
              showCardForDriver(ride_id, id);
              document.querySelector("#btnCalificacionPasajero").addEventListener("click", ()=>
              {
                  showProgress();
                  updateStatusForPassengers(ride_id)
                  .then(()=>
                  {
                    updateLastRideUser(id)
                    .then(()=>
                    {
                        alert("Gracias por calificar");
                        hideProgress();
                        window.location.href=SEARCH_RIDE_PAGE;
                    });
                  })
              });
          }
      });
    } else {
      window.location.href = INDEX_PAGE;
    }
  });

  async function updateStatusForPassengers(ride_id)
  {
      return await db.collection(RIDES_COLLECTION).doc(ride_id).get()
      .then((doc)=>
      {
          let ride = doc.data();
          let passengers = ride.passengers;
          passengers.forEach(async function(pass)
          {
            await db.collection(USERS_COLLECTION).doc(pass).get()
            .then((pasajero)=>
            {
                let passenger = pasajero.data();
                let currentCalification = getCalification(pass);
                let calification = passenger.calification_passenger;
                let numberCalifications = passenger.number_califications_passenger;
                updateAfterRating(pass, currentCalification, calification, numberCalifications, ROLE_PASSENGER)
                .then(()=>
                {console.log("Updated "+pass);});
            });
          });
      });
  }

  async function showCardForDriver(ride_id, user_uid)
  {
      await db.collection(RIDES_COLLECTION).doc(ride_id).get()
      .then((rideD)=>
      {
          let ride = rideD.data();
          let hour = ride.hour;
          let driver_id = ride_id.split(hour)[0];
          let passengers = ride.passengers;
          db.collection(USERS_COLLECTION).doc(driver_id).get()
          .then((doc)=>
          {
              let driver = doc.data();
              let h5 = document.querySelector("#nombreConductorCardPassenger");
              h5.innerHTML = "Conductor: "+driver.names + " "+driver.last_names;
              passengers.forEach((pass)=>
              {
                  fetchFormPassenger(pass);
              });
          })
      }).then(()=>
      {
          document.querySelector("#calificacionPasajero").removeAttribute("hidden");
          hideProgress();
      });
  }

  async function fetchFormPassenger(passenger_id)
  {
      await db.collection(USERS_COLLECTION).doc(passenger_id).get()
      .then((pasajero)=>
      {
          let passenger = pasajero.data();
          let cardPassengers = document.querySelector("#card-passengers");
          let form = document.createElement("form");
          let h7 = document.createElement("h7");
          h7.innerHTML = passenger.names + " " + passenger.last_names;
          form.appendChild(h7);
          form.appendChild(createCalifications(passenger_id));
          cardPassengers.appendChild(form);
      });
  }

  function createCalifications(passenger_id)
  {
      let p = document.createElement("p");
      p.setAttribute("class", "clasificacion");
      let i = 5;
      while(i!=0)
      {
        let id = passenger_id+i;
        let input = document.createElement("input");
        input.setAttribute("id", id);
        input.setAttribute("type", "radio");
        input.setAttribute("name", passenger_id);
        input.setAttribute("value", i);

        let label = document.createElement("label");
        label.setAttribute("for", id);
        label.setAttribute("class", "fa fa-car");
        p.appendChild(input);
        p.appendChild(label);
        i = i-1;
      }
      return p;
  }

  async function showCardForPassenger(ride_id,  user_uid)
  {
      await db.collection(RIDES_COLLECTION).doc(ride_id).get()
      .then((rideP)=>
      {
          let ride = rideP.data();
          let hour = ride.hour;
          let driver_id = ride_id.split(hour)[0];
          db.collection(USERS_COLLECTION).doc(driver_id).get()
          .then((doc)=>
          {
              let driver = doc.data();
              let calification = driver.calification_driver;
              let numberCalifications = driver.number_califications_driver;
              let h5 = document.querySelector("#nombreConductor");
              h5.innerHTML = "Conductor: "+driver.names + " "+driver.last_names;
              document.querySelector("#rateDriver").addEventListener("click", ()=>
              {
                  showProgress();
                  let currentCalification = getCalification("conductor");
                  updateAfterRating(driver_id, currentCalification, calification, numberCalifications, ROLE_DRIVER)
                  .then(()=>
                  {
                      return updateLastRideUser(user_uid);
                  })
                  .then(()=>
                  {
                      hideProgress();
                      alert("Gracias por calificar");
                      window.location.href=SEARCH_RIDE_PAGE;
                  });
              });
          })
      })
      .then(()=>
      {
          document.querySelector("#calificacionConductor").removeAttribute("hidden");
          hideProgress();
      });
  }

  async function updateLastRideUser(uid)
  {
      return await db.collection(USERS_COLLECTION).doc(uid).update(
          {
            lastRide: ""
          }
      );
  }

  async function updateAfterRating(uid, currentCalification, calification, numberCalifications, role)
  {
      let currentNumberCalifications = numberCalifications+1;
      let calificationAverage = ((calification*numberCalifications)+currentCalification)/currentNumberCalifications;
      let userRef = db.collection(USERS_COLLECTION).doc(uid);
      if(role==ROLE_DRIVER)
      {
        return await userRef.update(
            {
              calification_driver: calificationAverage,
              number_califications_driver: currentNumberCalifications
            }
        );
      }
      else if(role==ROLE_PASSENGER)
      {
        return await userRef.update(
            {
              calification_passenger: calificationAverage,
              number_califications_passenger: currentNumberCalifications
            }
        ); 
      }
      
  }

  function getCalification(name)
  {
      let elements = document.getElementsByName(name);
      let current = null;
      let value = 0;
      elements.forEach((element)=>
      {
          if(element.checked)
          {
              current = element;
          }
      });
      if(current){value = current.value};
      return parseFloat(value);
  }