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

auth.onAuthStateChanged(function (user) {
    if (user) {
        db.collection(USERS_COLLECTION).doc(user.uid).get().then((doc) => {
            let usuario = doc.data();
            let currentRideAsDriver = usuario.currentRideAsDriver;
            let currentRideAsPassenger = usuario.currentRideAsPassenger;
            if (currentRideAsDriver != "" || currentRideAsPassenger != "") 
            {
                /*var queryString = "";
                if(currentRideAsDriver!="")
                {
                    queryString= makeQueryString(currentRideAsDriver, ROLE_DRIVER);
                }
                else if(currentRideAsPassenger!="")
                {
                    queryString = makeQueryString(currentRideAsPassenger, ROLE_PASSENGER);
                }*/
                window.location.href = CURRENT_DRIVE_PAGE;
            }
        });
        // User is signed in.
        getRides(user.uid);
        document.querySelector("#logo").addEventListener("click", () => {
            document.querySelector("#container_rides").innerHTML = "";
            showProgress();
            getRides(user.uid);
        });
    } else {
        window.location.href = INDEX_PAGE;
    }
});

function makeQueryString(ride_id, role)
{
    var queryString = "?currentRide="+ride_id +"&role="+role;
    return queryString;
}

function getRides(user_id) {
    var container = document.querySelector("#container_rides");
    var currentRow = createRow();
    var items = 0;
    db.collection(RIDES_COLLECTION)/*.where("isAvailable", "==", true)*/.orderBy("creationDate", "desc").get().then((snapshot) => 
    {
        snapshot.forEach(function (doc) {
            if (doc.data().isAvailable) {
                getDatadRide(doc, items, currentRow, container, user_id);
            }
        })
    }).then(() => {
        hideProgress();
    });
}

function getDatadRide(doc, items, currentRow, container, user_id) {
    let ride = doc.data();
    //if(ride.creationDate) alert(new Date(ride.creationDate.seconds*1000));
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
    vehicleRef.get().then((doc) => {
        let car = doc.data();
        let model = "Modelo: " + car.model;
        let plate = "Placa: " + car.plate;
        let color = "Color: " + car.color;

        var col = document.createElement("div");
        col.setAttribute("class", "col-xl-4 col-lg-12");
        var chart = document.createElement("div");
        chart.setAttribute("class", "card card-chart");

        chart.appendChild(createCardHeader());
        chart.appendChild(createCardBody(address, model, plate, color, hour, seats, location))
        createCardFooter(chart, driver_id, ride_id, user_id, ride.seats, isAvailable);

        col.appendChild(chart);
        currentRow.appendChild(col);
        container.appendChild(currentRow);
    })
}

function createCardHeader() {
    let header = document.createElement("div");
    header.setAttribute("class", "card-header card-header-orange");
    let chart = document.createElement("div");
    chart.setAttribute("class", "ct-chart");
    header.appendChild(chart);
    return header;
}

function createCardBody(address, model, plate, color, hour, seats, location) {
    let body = document.createElement("div");
    body.setAttribute("class", "card-body");

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
        console.log(driver_name);
        let title = document.createElement("h5");
        title.innerHTML = "Conductor: " + driver_name;
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
            currentRideAsPassenger: ride_id
        }
    ).then(()=>
    {
        hideProgress();
        window.location.href = CURRENT_DRIVE_PAGE;
    });
}

function createDivAndSetClass(value) {
    var div = document.createElement("div");
    div.setAttribute("class", value);
    return div;
}

function addElementToList(list, value) {
    let elem = document.createElement("li");
    elem.innerHTML = value;
    list.appendChild(elem);
}

function createRow() {
    var row = document.createElement("div");
    row.setAttribute("class", "row");
    return row;
}