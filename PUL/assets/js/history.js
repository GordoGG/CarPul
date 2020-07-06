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
var iterator = 0;
auth.onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        db.collection(USERS_COLLECTION).doc(user.uid).get().then((doc) => {
            let user = doc.data();
            let ridesAsDriver = user.ridesAsDriver;
            let ridesAsPassenger = user.ridesAsPassenger;
            let names = user.names;
            let last_names = user.last_names;
            if (ridesAsDriver.length > 0 || ridesAsPassenger.legth > 0) 
            {
                if (ridesAsDriver.length > 0) {
                    ridesAsDriver.forEach((ride) => {
                        iterator++;
                        addRides(iterator, names, last_names, ride, ROLE_DRIVER);
                    });
                }
                if (ridesAsPassenger.length > 0) {
                    ridesAsPassenger.forEach((ride) => {
                        iterator++;
                        var n = ride.length;
                        let driver_id = ride.substring(0, n - 5);
                        addRidesAsPassenger(iterator, driver_id, ride);
                    });
                }
            }
            else 
            {
                let tbody = document.querySelector("tbody");
                let tableRow = document.createElement("tr");
                tableRow.appendChild(createTableDataCell(MESSAGE_NO_RIDES));
                tbody.appendChild(tableRow);
                document.querySelector("#thead").setAttribute("hidden", "true");
                hideProgress();
            }
        });

    } else {
        window.location.href = INDEX_PAGE;
    }
});

async function addRidesAsPassenger(iterator, driver_id, ride)
{
    await db.collection(USERS_COLLECTION).doc(driver_id).get().then((doc) => {
        let driver = doc.data();
        let names_driver = driver.names;
        let last_names_driver = driver.last_names;
        addRides(iterator, names_driver, last_names_driver, ride, ROLE_PASSENGER);
    });
}

async function addRides(iterator, names, last_names, ride_id, type) {
    let tbody = document.querySelector("tbody");
    let tableRow = document.createElement("tr");
    tableRow.appendChild(createTableDataCell(iterator));
    if (type == ROLE_DRIVER) {
        tableRow.appendChild(createTableDataCell(ROLE_DRIVER));
    }
    else {
        tableRow.appendChild(createTableDataCell(ROLE_PASSENGER));
    }

    let full_name = names + " " + last_names;
    tableRow.appendChild(createTableDataCell(full_name));
    await db.collection(RIDES_COLLECTION).doc(ride_id).get().then((doc) => {
        let ride = doc.data();
        let address = ride.address;
        let vehicle = ride.vehicle;
        let date = getDateFormat(ride.creationDate.seconds);
        tableRow.appendChild(createTableDataCell(address));
        tableRow.appendChild(createTableDataCell(vehicle));
        tableRow.appendChild(createTableDataCell(date));
        tbody.appendChild(tableRow);
        hideProgress();
    });
}

function getDateFormat(timestamp) {
    let date = new Date(timestamp * 1000);
    let day = date.getDate();
    let month = date.getMonth();
    let year = date.getFullYear();
    let dateFormat = day + "/" + month + "/" + year;
    return dateFormat;
}

function createTableDataCell(value) {
    let td = document.createElement("td");
    td.innerHTML = value;
    return td;
}