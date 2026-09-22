/* ============================================================
   VEHICLES JS
   Smart Car Parking
   Screenshot Style UI
   Functionality Preserved
   ============================================================ */

document.addEventListener("DOMContentLoaded", function() {

    /* =========================================================
       ELEMENTS
    ========================================================= */

    const vehicleForm =
        document.getElementById("vehicleForm");

    const vehicleList =
        document.getElementById("vehicleList");

    const vehicleMsg =
        document.getElementById("vehicleMsg");

    const vehicleListMessage =
        document.getElementById("vehicleListMessage");

    const vehicleNumber =
        document.getElementById("vehicleNumber");

    const vehicleModel =
        document.getElementById("vehicleModel");

    const vehicleColor =
        document.getElementById("vehicleColor");

    const vehicleSize =
        document.getElementById("vehicleSize");

    const vehicleType =
        document.getElementById("vehicleType");

    const vehicleTotalCount =
        document.getElementById("vehicleTotalCount");

    const vehicleCountBadge =
        document.getElementById("vehicleCountBadge");


    /* =========================================================
       GET LOGGED-IN USER
       Supports:
       1. loggedInUser
       2. firebaseUser
       3. user
    ========================================================= */

    function getCurrentUser() {

        const keys = [
            "loggedInUser",
            "firebaseUser",
            "user"
        ];

        for (const key of keys) {

            const savedUser =
                localStorage.getItem(key);

            if (!savedUser) {
                continue;
            }

            try {

                const user =
                    JSON.parse(savedUser);

                if (user) {

                    console.log(
                        "Current user found from:",
                        key,
                        user
                    );

                    /*
                     * Firebase user may not have id.
                     * Use uid as fallback.
                     */
                    if (!user.id &&
                        user.uid
                    ) {
                        user.id = user.uid;
                    }

                    /*
                     * Name fallback
                     */
                    if (!user.name &&
                        user.displayName
                    ) {
                        user.name =
                            user.displayName;
                    }

                    return user;
                }

            } catch (error) {

                console.error(
                    "Invalid user data in:",
                    key,
                    error
                );
            }
        }

        return null;
    }


    const currentUser =
        getCurrentUser();


    /* =========================================================
       LOGIN CHECK
    ========================================================= */

    if (!currentUser) {

        console.warn(
            "No logged-in user found. Redirecting to login."
        );

        window.location.href =
            "index.html";

        return;
    }


    console.log(
        "Current logged-in user:",
        currentUser
    );


    /* =========================================================
       GET USER ID
    ========================================================= */

    const currentUserId =
        currentUser.id ||
        currentUser.userId ||
        currentUser.uid;


    console.log(
        "Current user ID:",
        currentUserId
    );


    /* =========================================================
       GET API URL
    ========================================================= */

    function getVehicleAPI() {

        if (
            window.API &&
            window.API.vehicles
        ) {

            return window.API.vehicles;

        }

        if (window.API_BASE) {

            return window.API_BASE +
                "/vehicles";

        }

        return "https://car-parking-production-5662.up.railway.app/api/vehicles";
    }


    /* =========================================================
       LOAD VEHICLES
    ========================================================= */

    async function loadVehicles() {

        try {

            /* -------------------------------------------------
               SHOW LOADING
            ------------------------------------------------- */

            if (vehicleListMessage) {

                vehicleListMessage.style.display =
                    "block";

                vehicleListMessage.innerHTML = `
                    <div class="vehicle-loading-box">

                        <div class="vehicle-loading-spinner"></div>

                        <div>
                            Loading vehicles...
                        </div>

                    </div>
                `;
            }


            if (vehicleList) {

                vehicleList.innerHTML = "";

            }


            const apiURL =
                getVehicleAPI();


            console.log(
                "Vehicle API:",
                apiURL
            );


            /* -------------------------------------------------
               API REQUEST
            ------------------------------------------------- */

            const response =
                await fetch(apiURL);


            if (!response.ok) {

                throw new Error(
                    "Vehicle API Error: HTTP " +
                    response.status
                );

            }


            const result =
                await response.json();


            console.log(
                "All vehicles:",
                result
            );


            /* =================================================
               HANDLE API RESPONSE
            ================================================= */

            let vehicles = [];


            if (Array.isArray(result)) {

                vehicles = result;

            } else if (
                result &&
                Array.isArray(result.content)
            ) {

                vehicles =
                    result.content;

            } else if (
                result &&
                Array.isArray(result.data)
            ) {

                vehicles =
                    result.data;
            }


            console.log(
                "Vehicle count:",
                vehicles.length
            );


            /* =================================================
               FILTER CURRENT USER VEHICLES
            ================================================= */

            const myVehicles =
                vehicles.filter(function(vehicle) {

                    let vehicleUserId = null;

                    if (vehicle.userId) {

                        vehicleUserId =
                            vehicle.userId;

                    } else if (
                        vehicle.user &&
                        vehicle.user.id
                    ) {

                        vehicleUserId =
                            vehicle.user.id;

                    } else if (
                        vehicle.user &&
                        vehicle.user.userId
                    ) {

                        vehicleUserId =
                            vehicle.user.userId;
                    }

                    return String(
                        vehicleUserId
                    ) === String(
                        currentUserId
                    );

                });

            console.log(
                "My vehicles:",
                myVehicles
            );

            /* =================================================
               UPDATE COUNT
            ================================================= */

            updateVehicleCount(
                myVehicles.length
            );


            /* -------------------------------------------------
               HIDE LOADING
            ------------------------------------------------- */

            if (vehicleListMessage) {

                vehicleListMessage.style.display =
                    "none";

            }


            /* =================================================
               NO VEHICLES
            ================================================= */

            if (myVehicles.length === 0) {

                if (vehicleListMessage) {

                    vehicleListMessage.style.display =
                        "block";

                    vehicleListMessage.innerHTML = `

                        <div class="vehicle-empty-state">

                            <div class="vehicle-empty-icon">

                                <i class="fa-solid fa-car"></i>

                            </div>

                            <div class="vehicle-empty-title">

                                No vehicles registered

                            </div>

                            <div class="vehicle-empty-text">

                                Add your vehicle to use
                                smart parking recommendations.

                            </div>

                        </div>

                    `;
                }

                return;
            }


            /* =================================================
               DISPLAY VEHICLES
            ================================================= */

            if (vehicleList) {

                vehicleList.innerHTML =
                    myVehicles.map(
                        function(vehicle) {

                            return createVehicleCard(
                                vehicle
                            );

                        }
                    ).join("");

            }


        } catch (error) {

            console.error(
                "Load vehicles error:",
                error
            );


            updateVehicleCount(0);


            if (vehicleList) {

                vehicleList.innerHTML =
                    "";

            }


            if (vehicleListMessage) {

                vehicleListMessage.style.display =
                    "block";

                vehicleListMessage.innerHTML = `

                    <div class="vehicle-error-state">

                        <div class="vehicle-error-icon">

                            <i class="fa-solid fa-triangle-exclamation"></i>

                        </div>

                        <div class="vehicle-error-title">

                            Unable to load vehicles

                        </div>

                        <div class="vehicle-error-text">

                            Check Spring Boot server.

                        </div>

                    </div>

                `;
            }

        }

    }


    /* =========================================================
       CREATE VEHICLE CARD
       SCREENSHOT STYLE
    ========================================================= */

    function createVehicleCard(vehicle) {

        const id =
            Number(vehicle.id);


        const number =
            escapeHTML(
                vehicle.vehicleNumber ||
                "-"
            );


        const model =
            escapeHTML(
                vehicle.vehicleModel ||
                "-"
            );


        const type =
            escapeHTML(
                vehicle.vehicleType ||
                "-"
            );


        const color =
            escapeHTML(
                vehicle.vehicleColor ||
                "-"
            );


        const size =
            escapeHTML(
                vehicle.vehicleSize ||
                "-"
            );


        const status =
            escapeHTML(
                vehicle.status ||
                "ACTIVE"
            );


        /* -----------------------------------------------------
           VEHICLE ICON
        ----------------------------------------------------- */

        let vehicleIcon =
            "fa-car";


        if (
            type.toLowerCase().includes("suv")
        ) {

            vehicleIcon =
                "fa-car-side";

        } else if (
            type.toLowerCase().includes("electric")
        ) {

            vehicleIcon =
                "fa-bolt";
        }


        /* -----------------------------------------------------
           RETURN CARD
        ----------------------------------------------------- */

        return `

            <div class="vehicle-card">

                <!-- LEFT CONTENT -->

                <div class="vehicle-card-main">

                    <div class="vehicle-card-title">

                        <div class="vehicle-card-icon">

                            <i class="fa-solid ${vehicleIcon}"></i>

                        </div>

                        <div>

                            <div class="vehicle-number">

                                ${number}

                            </div>

                            <div class="vehicle-model">

                                ${model}

                            </div>

                        </div>

                    </div>


                    <!-- VEHICLE DETAILS -->

                    <div class="vehicle-details">

                        <div class="vehicle-detail-item">

                            <span class="vehicle-detail-label">

                                Type

                            </span>

                            <strong>

                                ${type}

                            </strong>

                        </div>


                        <div class="vehicle-detail-item">

                            <span class="vehicle-detail-label">

                                Color

                            </span>

                            <strong>

                                ${color}

                            </strong>

                        </div>


                        <div class="vehicle-detail-item">

                            <span class="vehicle-detail-label">

                                Size

                            </span>

                            <strong>

                                ${size}

                            </strong>

                        </div>

                    </div>

                </div>


                <!-- RIGHT CONTENT -->

                <div class="vehicle-card-actions">

                    <!-- ACTIVE -->

                    <span class="vehicle-status">

                        <span class="vehicle-status-dot"></span>

                        ${status}

                    </span>


                    <!-- DELETE -->

                    <button
                        type="button"
                        class="vehicle-delete-btn"
                        onclick="deleteVehicle(${id})">

                        <i class="fa-solid fa-trash"></i>

                        Delete

                    </button>

                </div>

            </div>

        `;
    }


    /* =========================================================
       UPDATE VEHICLE COUNT
    ========================================================= */

    function updateVehicleCount(count) {

        if (vehicleTotalCount) {

            vehicleTotalCount.textContent =
                count;

        }


        if (vehicleCountBadge) {

            vehicleCountBadge.textContent =
                count +
                (
                    count === 1 ?
                    " Vehicle" :
                    " Vehicles"
                );

        }

    }


    /* =========================================================
       ADD VEHICLE
       FUNCTIONALITY PRESERVED
    ========================================================= */

    if (vehicleForm) {

        vehicleForm.addEventListener(
            "submit",
            async function(event) {

                event.preventDefault();


                /* -------------------------------------------------
                   GET VALUES
                ------------------------------------------------- */

                const data = {

                    userId: currentUserId,

                    vehicleNumber: vehicleNumber.value
                        .trim()
                        .toUpperCase(),

                    vehicleModel: vehicleModel.value
                        .trim(),

                    vehicleColor: vehicleColor.value
                        .trim(),

                    vehicleSize: vehicleSize.value
                        .trim(),

                    vehicleType: vehicleType.value
                        .trim(),

                    status: "ACTIVE"

                };


                console.log(
                    "Vehicle data:",
                    data
                );


                /* =================================================
                   VALIDATION
                ================================================= */

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


                    const apiURL =
                        getVehicleAPI();


                    /* =================================================
                       POST REQUEST
                    ================================================= */

                    const response =
                        await fetch(
                            apiURL, {

                                method: "POST",

                                headers: {
                                    "Content-Type": "application/json"
                                },

                                body: JSON.stringify(
                                    data
                                )

                            }
                        );


                    const result =
                        await response
                        .json()
                        .catch(
                            function() {
                                return {};
                            }
                        );


                    console.log(
                        "Add vehicle response:",
                        result
                    );


                    /* =================================================
                       API ERROR
                    ================================================= */

                    if (!response.ok) {

                        throw new Error(

                            result.message ||
                            result.error ||
                            "Vehicle could not be added."

                        );

                    }


                    /* =================================================
                       SUCCESS
                    ================================================= */

                    showMessage(
                        "Vehicle added successfully! ✅",
                        true
                    );


                    /* -------------------------------------------------
                       CLEAR FORM
                    ------------------------------------------------- */

                    vehicleForm.reset();


                    /* -------------------------------------------------
                       RELOAD VEHICLES
                    ------------------------------------------------- */

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

            }
        );

    }


    /* =========================================================
       DELETE VEHICLE
       FUNCTIONALITY PRESERVED
    ========================================================= */

    window.deleteVehicle =
        async function(id) {

            if (!id) {
                return;
            }


            const confirmed =
                confirm(
                    "Delete this vehicle?"
                );


            if (!confirmed) {
                return;
            }


            try {

                const apiURL =
                    getVehicleAPI();


                const response =
                    await fetch(
                        apiURL + "/" + id, {
                            method: "DELETE"
                        }
                    );


                if (!response.ok) {

                    let errorMessage =
                        "Delete failed.";


                    try {

                        const result =
                            await response.json();


                        errorMessage =
                            result.message ||
                            result.error ||
                            errorMessage;


                    } catch (e) {

                        // Ignore JSON error

                    }


                    throw new Error(
                        errorMessage
                    );

                }


                /* -------------------------------------------------
                   SUCCESS
                ------------------------------------------------- */

                showMessage(
                    "Vehicle deleted successfully! ✅",
                    true
                );


                /* -------------------------------------------------
                   RELOAD
                ------------------------------------------------- */

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
       SHOW MESSAGE
    ========================================================= */

    function showMessage(
        message,
        success
    ) {

        if (!vehicleMsg) {
            return;
        }


        vehicleMsg.textContent =
            message;


        vehicleMsg.style.padding =
            "9px 12px";


        vehicleMsg.style.borderRadius =
            "8px";


        vehicleMsg.style.fontSize =
            "12px";


        vehicleMsg.style.fontWeight =
            "600";


        if (success) {

            vehicleMsg.style.color =
                "#15803d";

            vehicleMsg.style.background =
                "#ecfdf5";

            vehicleMsg.style.border =
                "1px solid #bbf7d0";

        } else {

            vehicleMsg.style.color =
                "#dc2626";

            vehicleMsg.style.background =
                "#fef2f2";

            vehicleMsg.style.border =
                "1px solid #fecaca";

        }

    }


    /* =========================================================
       HTML SECURITY
    ========================================================= */

    function escapeHTML(value) {

        return String(
                value ? value : ""
            )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* =========================================================
       START
    ========================================================= */

    loadVehicles();

});