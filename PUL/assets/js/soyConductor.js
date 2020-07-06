const vehicleForm = document.querySelector("#form_register_vehicle");
const poolForm = document.querySelector("#create_pool_form");
auth.onAuthStateChanged(function (user) {
    if (user) 
    {
        fetchSelect(user);
    } else {
        window.location.href = INDEX_PAGE;
    }
});

function fetchSelect(user) {    
    var userRef = db.collection(USERS_COLLECTION).doc(user.uid);
    userRef.get().then(function (doc) {
        let cars = doc.data().vehicles;
        let select = poolForm["select_vehicle"];
        cars.forEach(function (car) {
            let option = document.createElement("option");
            option.setAttribute("value", car);
            var carRef = db.collection(VEHICLES_COLLECTION).doc(car);
            carRef.get().then(function (vehicle) {
                let modelo = vehicle.data().model;
                let color = vehicle.data().color;
                option.innerHTML = modelo + " " + color;
            });
            select.appendChild(option);
        });
    });
}

vehicleForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let car_model = vehicleForm["model_field"].value;
    let car_plate = vehicleForm["placa"].value;
    let car_color = vehicleForm["color"].value;
    
    ex2 = /([A-Z][A-Z0-9][A-Z])-([0-9][0-9][0-9])/;

    if(car_model == "" || car_plate=="" || car_color== ""){
        alert("Debe ingresar todos los datos.")
        return false;
      }
    
    else if(!ex2.test(car_plate) ){
        alert("La placa del vehiculo es incorrecto");
        return false;
    }
    
    

    
    else{  
    var vehicleData =
    {
        plate: car_plate,
        model: car_model,
        color: car_color
    };
    auth.onAuthStateChanged(function (user) {
        return db.collection(VEHICLES_COLLECTION).doc(car_plate).set(vehicleData).then(() => {
            return db.collection(USERS_COLLECTION).doc(user.uid)
                .update(
                    {
                        vehicles: firebase.firestore.FieldValue.arrayUnion(car_plate)
                    }
                );
        }).then(() => {
            alert("Vehículo creado con éxito");
            fetchSelect(user);
        });
    });
    }
    vehicleForm.reset();
});


poolForm.addEventListener("submit", (e)=>
{
    e.preventDefault();
    let vehicle = poolForm["select_vehicle"].value;
    let hour = poolForm["horaSalida"].value;
    let seats = parseInt(poolForm["select_seats"].value);
    let location = poolForm["select_location"].value;
    let address = poolForm["destino"].value;

    if(vehicle == "")
    {
        alert("Primero crea un vehículo");
        return false;
    }
    else if(address == ""){
        alert("Debe ingresar la direccion de destino.")
        return false;
      }
    else if( hour == ""){
        alert("Debe ingresar hora de salida");
        return false;
    }

    else{  
    auth.onAuthStateChanged(function (user) 
    {
        let rideData = 
        {
            vehicle: vehicle,
            hour: hour,
            seats: seats,
            location: location,
            address: address,
            isAvailable: true,
            isFinished: false,
            passengers: [],
            creationDate: firebase.firestore.Timestamp.fromDate(new Date())
        };
        
        db.collection(RIDES_COLLECTION).doc(user.uid + hour)
        .set(rideData).then(function()
        {
            return db.collection(USERS_COLLECTION).doc(user.uid)
            .update(
                {
                    ridesAsDriver: firebase.firestore.FieldValue.arrayUnion(user.uid + hour),
                    currentRideAsDriver: user.uid + hour
                });
        }).then(()=>
        {   
            alert("¡Viaje creado con éxito!");
            window.location.href = CURRENT_DRIVE_PAGE;
        });
    });
    }
    poolForm.reset();
});

