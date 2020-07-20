function showProgress() {
    document.querySelector("#progressBar").removeAttribute("hidden");
    document.querySelector("#progressBar").setAttribute('visible', 'true');
    document.querySelector("#container_rides").style.visibility = 'hidden';
}

function hideProgress() {
    document.querySelector("#progressBar").removeAttribute("visible");
    document.querySelector("#progressBar").setAttribute('hidden', 'true');
    document.querySelector("#container_rides").style.visibility = 'visible';
}

function showCardNoRides()
{
    document.querySelector("#no_rides").removeAttribute("hidden");
    document.querySelector("#no_rides").setAttribute('visible', 'true');
}

function hideCardNoRides()
{
    document.querySelector("#no_rides").removeAttribute("visible");
    document.querySelector("#no_rides").setAttribute('hidden', 'true');
}
async function disableRide(ride_id)
{
    await db.collection(RIDES_COLLECTION).doc(ride_id).update(
        {
            isAvailable: false
        }
    )
}
var available_rides = 0;
auth.onAuthStateChanged(function (user) {
    if (user) {
        db.collection(USERS_COLLECTION).doc(user.uid).get().then((doc) => {
            let usuario = doc.data();
            let currentRideAsDriver = usuario.currentRideAsDriver;
            let currentRideAsPassenger = usuario.currentRideAsPassenger;
            let lastRide = usuario.lastRide;
            if(lastRide!="")
            {
                window.location.href = RATING_PAGE;
            }
            if (currentRideAsDriver != "" || currentRideAsPassenger != "") 
            {
                window.location.href = CURRENT_DRIVE_PAGE;
            }
        });
        // User is signed in.
        db.collection(RIDES_COLLECTION).get()
        .then((snapshot)=>
        {
            snapshot.forEach((snap)=>
            {
                let currentDay = new Date();
                let currentTimestamp = currentDay.getTime();
                let ride = snap.data();
                let rideTimeStamp = ride.creationDate.seconds*1000;
                if(ride.isAvailable)
                {
                    if(currentTimestamp > rideTimeStamp)
                    {
                        disableRide(snap.id);
                    }
                }
            });
        }).then(()=>
        {
            getRides(user.uid);
        });
        document.querySelector("#logo").addEventListener("click", () => 
        {
            update(user.uid);
        });
        document.querySelector("#btnNoRides").addEventListener("click", ()=>
        {
            update(user.uid);
        });
    } else {
        window.location.href = INDEX_PAGE;
    }
});

function update(uid)
{
    document.querySelector("#container_rides").innerHTML = "";
    hideCardNoRides();
    showProgress();
    getRides(uid);
    available_rides = 0;
}

async function getRides(user_id) {
    var container = document.querySelector("#container_rides");
    var currentRow = createRow();
    var items = 0;
    await db.collection(RIDES_COLLECTION)/*.where("isAvailable", "==", true)*/.orderBy("creationDate", "desc").get().then((snapshot) => 
    {
        snapshot.forEach(function (doc) {
            if (doc.data().isAvailable) 
            {
                available_rides++;
                getDatadRide(doc, items, currentRow, container, user_id);
            }
        })
    }).then(() => {
        hideProgress();
        if(available_rides==0)
        {
            showCardNoRides();
        }
    });
}

async function getDatadRide(doc, items, currentRow, container, user_id) {
    let ride = doc.data();
    let address = ride.address;
    let hour = "Hora de viaje: " + ride.hour;
    let driver_id = doc.id.split(ride.hour)[0];
    let ride_id = doc.id;
    let seats = "Asientos disponibles: " + ride.seats;
    let isAvailable = ride.isAvailable;
    let location = "Ubicación: " + ride.location;
    let vehicle = ride.vehicle;
    items = items + 1;
    let vehicleRef = db.collection(VEHICLES_COLLECTION).doc(vehicle);
    await vehicleRef.get().then((doc) => {
        let car = doc.data();
        let model = "Modelo: " + car.model;
        let plate = "Placa: " + car.plate;
        let color = "Color: " + car.color;
        var col = createDivAndSetClass("col-xl-4 col-lg-12");
        var chart = createDivAndSetClass("card card-chart")
        chart.appendChild(createCardHeader());
        chart.appendChild(createCardBody(address, model, plate, color, hour, seats, location))
        createCardFooter(chart, driver_id, ride_id, user_id, ride.seats, isAvailable);
        col.appendChild(chart);
        currentRow.appendChild(col);
        container.appendChild(currentRow);
    })
}

function createCardHeader() {
    let header = createDivAndSetClass("card-header card-header-orange");
    let chart = createDivAndSetClass("ct-chart");
    header.appendChild(chart);
    return header;
}

function createCardBody(address, model, plate, color, hour, seats, location) {
    let body = createDivAndSetClass("card-body");
    let direc = document.createElement("h4");
    direc.innerHTML = address;
    let list = document.createElement("ul");
    addElementToList(list, model);
    addElementToList(list, plate);
    addElementToList(list, color);
    addElementToList(list, hour);
    addElementToList(list, seats);
    addElementToList(list, location);
    body.appendChild(direc);
    body.appendChild(list);
    return body;

}

function createCardFooter(chart, driver_id, ride_id, user_id, seats, isAvailable) {
    var footer = createDivAndSetClass("card-footer");
    var stats = createDivAndSetClass("stats");
    var userRef = db.collection(USERS_COLLECTION).doc(driver_id);
    userRef.get().then((doc) => {
        user = doc.data();
        let driver_name = user.names + " " + user.last_names;
        let calification_driver = user.calification_driver.toFixed(2);
        console.log(driver_name);
        let title = document.createElement("h5");
        title.innerHTML = "Conductor: " + driver_name;
        title.appendChild(createCalificationElement(calification_driver));
        stats.appendChild(title);
        footer.appendChild(stats);
        let button = document.createElement("button");
        button.innerHTML = "ACEPTAR VIAJE";
        button.setAttribute("class", "btn btn-orange pull-right");
        button.addEventListener("click", () => {
            let message = confirm("¿Deseas unirte al viaje de " + driver_name + "?");
            if (message) 
            {
                showProgress();
                seats = seats - 1;
                if(seats == 0)
                {
                    isAvailable = false;
                }
                db.collection(RIDES_COLLECTION).doc(ride_id)
                    .update(
                        {
                            passengers: firebase.firestore.FieldValue.arrayUnion(user_id),
                            seats: seats,
                            isAvailable: isAvailable
                        }
                    ).then(() => 
                    {
                        updateCurrentRideAsPassenger(ride_id, user_id);
                    });
            }
        });

        footer.appendChild(button);
        chart.appendChild(footer);
    });
}

async function updateCurrentRideAsPassenger(ride_id, user_id)
{
    await db.collection(USERS_COLLECTION).doc(user_id)
    .update(
        {
            currentRideAsPassenger: ride_id,
            ridesAsPassenger: firebase.firestore.FieldValue.arrayUnion(ride_id)
        }
    ).then(()=>
    {
        hideProgress();
        window.location.href = CURRENT_DRIVE_PAGE;
    });
}

function addElementToList(list, value) {
    let elem = document.createElement("li");
    elem.innerHTML = value;
    list.appendChild(elem);
}

function createRow() {
    var row = createDivAndSetClass("row");
    return row;
}