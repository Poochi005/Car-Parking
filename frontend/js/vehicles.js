/* ============================================================
   VEHICLES JS
   Smart Car Parking
   ============================================================ */

document.addEventListener("DOMContentLoaded", function() {

    const vehicleForm = document.getElementById("vehicleForm");
    const vehicleList = document.getElementById("vehicleList");
    const vehicleMsg = document.getElementById("vehicleMsg");
    const vehicleListMessage = document.getElementById("vehicleListMessage");

    const vehicleNumber = document.getElementById("vehicleNumber");
    const vehicleModel = document.getElementById("vehicleModel");
    const vehicleColor = document.getElementById("vehicleColor");
    const vehicleSize = document.getElementById("vehicleSize");
    const vehicleType = document.getElementById("vehicleType");


    /* =========================================================
       GET LOGGED-IN USER
       ========================================================= */

    function getCurrentUser() {

        const savedUser = localStorage.getItem("loggedInUser");

        if (!savedUser) {
            return null;
        }

        try {
            return JSON.parse(savedUser);
        } catch (error) {
            console.error("Invalid user data:", error);
            return null;
        }
    }


    const currentUser = getCurrentUser();


    /* =========================================================
       LOGIN CHECK
       ========================================================= */

    if (!currentUser) {

        window.location.href = "login.html";
        return;

    }


    console.log("Current user:", currentUser);


    /* =========================================================
       LOAD VEHICLES
       ========================================================= */

    async function loadVehicles() {

        try {

            vehicleListMessage.style.display = "block";
            vehicleListMessage.textContent = "Loading vehicles...";

            vehicleList.innerHTML = "";


            console.log("Vehicle API:", window.API.vehicles);


            const response = await fetch(window.API.vehicles);


            if (!response.ok) {

                throw new Error(
                    "Vehicle API Error: " + response.status
                );

            }


            const vehicles = await response.json();


            console.log("All vehicles:", vehicles);


            const myVehicles = vehicles.filter(function(vehicle) {

                return Number(vehicle.userId) ===
                    Number(currentUser.id);

            });


            console.log("My vehicles:", myVehicles);


            vehicleListMessage.style.display = "none";


            /* =================================================
               NO VEHICLES
               ================================================= */

            if (myVehicles.length === 0) {

                vehicleListMessage.style.display = "block";

                vehicleListMessage.textContent =
                    "No vehicles registered for this account.";

                return;

            }


            /* =================================================
               DISPLAY VEHICLES
               ================================================= */

            vehicleList.innerHTML = myVehicles.map(function(vehicle) {

                return `

                    <div class="vehicle-card">

                        <div>

                            <strong>
                                🚘 ${escapeHTML(vehicle.vehicleNumber)}
                            </strong>

                            <div class="muted">

                                ${escapeHTML(vehicle.vehicleModel || "-")}

                                • ${escapeHTML(vehicle.vehicleType || "-")}

                                • ${escapeHTML(vehicle.vehicleColor || "-")}

                            </div>

                            <small>

                                Size:
                                ${escapeHTML(vehicle.vehicleSize || "-")}

                            </small>

                        </div>


                        <button
                            class="danger"
                            onclick="deleteVehicle(${vehicle.id})">

                            Delete

                        </button>

                    </div>

                `;

            }).join("");


        } catch (error) {

            console.error("Load vehicles error:", error);


            vehicleListMessage.style.display = "block";

            vehicleListMessage.textContent =
                "Unable to load vehicles. Check Spring Boot.";

        }

    }


    /* =========================================================
       ADD VEHICLE
       ========================================================= */

    if (vehicleForm) {

        vehicleForm.addEventListener("submit", async function(event) {

            event.preventDefault();


            const data = {

                userId: Number(currentUser.id),

                vehicleNumber: vehicleNumber.value.trim(),

                vehicleModel: vehicleModel.value.trim(),

                vehicleColor: vehicleColor.value.trim(),

                vehicleSize: vehicleSize.value.trim(),

                vehicleType: vehicleType.value.trim(),

                status: "ACTIVE"

            };


            console.log("Vehicle data:", data);


            if (!data.vehicleNumber ||
                !data.vehicleModel ||
                !data.vehicleColor ||
                !data.vehicleSize ||
                !data.vehicleType
            ) {

                showMessage(
                    "Please fill all vehicle details.",
                    false
                );

                return;

            }


            try {

                showMessage(
                    "Adding vehicle...",
                    true
                );


                const response = await fetch(
                    window.API.vehicles, {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(data)
                    }
                );


                const result =
                    await response.json().catch(function() {
                        return {};
                    });


                console.log(
                    "Add vehicle response:",
                    result
                );


                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        result.error ||
                        "Vehicle could not be added."
                    );

                }


                showMessage(
                    "Vehicle added successfully! ✅",
                    true
                );


                vehicleForm.reset();


                await loadVehicles();


            } catch (error) {

                console.error(
                    "Add vehicle error:",
                    error
                );


                showMessage(
                    "Could not add vehicle. Check vehicle number/API.",
                    false
                );

            }

        });

    }


    /* =========================================================
       DELETE VEHICLE
       ========================================================= */

    window.deleteVehicle = async function(id) {

        if (!id) {
            return;
        }


        const confirmed =
            confirm("Delete this vehicle?");


        if (!confirmed) {
            return;
        }


        try {

            const response = await fetch(
                window.API.vehicles + "/" + id, {
                    method: "DELETE"
                }
            );


            if (!response.ok) {

                throw new Error(
                    "Delete failed: " +
                    response.status
                );

            }


            showMessage(
                "Vehicle deleted successfully! ✅",
                true
            );


            await loadVehicles();


        } catch (error) {

            console.error(
                "Delete vehicle error:",
                error
            );


            showMessage(
                "Delete failed. Please try again.",
                false
            );

        }

    };


    /* =========================================================
       MESSAGE
       ========================================================= */

    function showMessage(message, success) {

        if (!vehicleMsg) {
            return;
        }


        vehicleMsg.textContent = message;


        vehicleMsg.style.color =
            success ? "#198944" : "#d12f3c";

    }


    /* =========================================================
       HTML SECURITY
       ========================================================= */

    function escapeHTML(value) {

        return String(value || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }


    /* =========================================================
       START
       ========================================================= */

    loadVehicles();

});