/* ============================================================
   PARKING HISTORY
   ============================================================ */

const HISTORY_USER_ID = 10;


/* ============================================================
   LOAD PARKING HISTORY
   ============================================================ */

async function loadHistory() {

    const loading =
        document.getElementById("historyLoading");

    const empty =
        document.getElementById("historyEmpty");

    const list =
        document.getElementById("historyList");

    const errorBox =
        document.getElementById("historyError");


    /* --------------------------------------------------------
       CHECK HTML ELEMENTS
    -------------------------------------------------------- */

    if (!loading || !empty || !list || !errorBox) {

        console.error(
            "History page elements not found."
        );

        return;
    }


    /* --------------------------------------------------------
       INITIAL STATE
    -------------------------------------------------------- */

    loading.style.display = "block";

    empty.style.display = "none";

    list.innerHTML = "";

    errorBox.style.display = "none";


    try {


        /* ====================================================
           CHECK LOGIN
        ==================================================== */

        const userData =
            localStorage.getItem("loggedInUser");


        if (!userData) {

            window.location.href =
                "login.html";

            return;
        }


        /* ====================================================
           USER ID
           Current testing user = 10
        ==================================================== */

        const userId =
            HISTORY_USER_ID;


        /* ====================================================
           GET PARKING BOOKINGS
        ==================================================== */

        const bookingResponse =
            await fetch(
                `${window.API_BASE}/parking-bookings/user/${userId}`
            );


        if (!bookingResponse.ok) {

            throw new Error(
                "Unable to load parking history."
            );
        }


        let bookings =
            await bookingResponse.json();


        /* ====================================================
           HANDLE API RESPONSE
        ==================================================== */

        if (!Array.isArray(bookings)) {

            if (
                bookings &&
                Array.isArray(bookings.value)
            ) {

                bookings =
                    bookings.value;

            } else {

                bookings = [];
            }
        }


        /* ====================================================
           GET PARKING SLOTS
        ==================================================== */

        const slotResponse =
            await fetch(
                `${window.API_BASE}/parking-slots`
            );


        let slots = [];


        if (slotResponse.ok) {

            slots =
                await slotResponse.json();


            if (!Array.isArray(slots)) {

                slots = [];
            }
        }


        /* ====================================================
           GET VEHICLES
        ==================================================== */

        const vehicleResponse =
            await fetch(
                `${window.API_BASE}/vehicles`
            );


        let vehicles = [];


        if (vehicleResponse.ok) {

            vehicles =
                await vehicleResponse.json();


            if (!Array.isArray(vehicles)) {

                vehicles = [];
            }
        }


        /* ====================================================
           STOP LOADING
        ==================================================== */

        loading.style.display = "none";


        /* ====================================================
           NO BOOKINGS
        ==================================================== */

        if (bookings.length === 0) {

            empty.style.display = "block";

            return;
        }


        /* ====================================================
           SORT BOOKINGS
           NEWEST FIRST
        ==================================================== */

        bookings.sort(function(a, b) {

            const dateA =
                new Date(
                    a.bookingDate ||
                    a.entryTime ||
                    a.createdAt ||
                    0
                );


            const dateB =
                new Date(
                    b.bookingDate ||
                    b.entryTime ||
                    b.createdAt ||
                    0
                );


            return dateB - dateA;
        });


        /* ====================================================
           DISPLAY EACH BOOKING
        ==================================================== */

        bookings.forEach(function(booking) {


                    /* =================================================
                       FIND SLOT
                    ================================================= */

                    const slot =
                        slots.find(function(s) {

                            return Number(s.id) ===
                                Number(booking.slotId);

                        });


                    /* =================================================
                       FIND VEHICLE
                    ================================================= */

                    const vehicle =
                        vehicles.find(function(v) {

                            return Number(v.id) ===
                                Number(booking.vehicleId);

                        });


                    /* =================================================
                       SLOT DETAILS
                    ================================================= */

                    let slotNumber =
                        `Slot #${booking.slotId}`;


                    if (slot) {

                        if (slot.slotNumber) {

                            slotNumber =
                                slot.slotNumber;

                        } else if (slot.slotName) {

                            slotNumber =
                                slot.slotName;
                        }

                    }


                    /* =================================================
                       VEHICLE DETAILS
                    ================================================= */

                    let vehicleNumber =
                        `Vehicle #${booking.vehicleId}`;


                    if (vehicle) {

                        if (vehicle.vehicleNumber) {

                            vehicleNumber =
                                vehicle.vehicleNumber;

                        } else if (vehicle.registrationNumber) {

                            vehicleNumber =
                                vehicle.registrationNumber;
                        }

                    }


                    /* =================================================
                       VEHICLE MODEL
                    ================================================= */

                    let vehicleModel = "";


                    if (vehicle) {

                        if (vehicle.model) {

                            vehicleModel =
                                vehicle.model;

                        } else if (vehicle.vehicleModel) {

                            vehicleModel =
                                vehicle.vehicleModel;
                        }

                    }


                    /* =================================================
                       AMOUNT
                    ================================================= */

                    let amount =
                        "0.00";


                    if (
                        booking.amount !== null &&
                        booking.amount !== undefined
                    ) {

                        const numericAmount =
                            Number(booking.amount);


                        if (!isNaN(numericAmount)) {

                            amount =
                                numericAmount.toFixed(2);
                        }

                    }


                    /* =================================================
                       DURATION
                    ================================================= */

                    let duration =
                        "-";


                    if (
                        booking.durationHours !== null &&
                        booking.durationHours !== undefined
                    ) {

                        duration =
                            booking.durationHours;

                    } else if (
                        booking.duration !== null &&
                        booking.duration !== undefined
                    ) {

                        duration =
                            booking.duration;
                    }


                    /* =================================================
                       STATUS
                    ================================================= */

                    const status =
                        booking.status ||
                        "UNKNOWN";


                    /* =================================================
                       STATUS CLASS
                    ================================================= */

                    const statusClass =
                        getStatusClass(status);


                    /* =================================================
                       BOOKING DATE
                    ================================================= */

                    const bookingDate =
                        formatDate(
                            booking.bookingDate ||
                            booking.entryTime ||
                            booking.createdAt
                        );


                    /* =================================================
                       CREATE CARD
                    ================================================= */

                    const card =
                        document.createElement("div");


                    card.className =
                        "history-card";


                    /* =================================================
                       CARD HTML
                    ================================================= */

                    card.innerHTML = `

                <div class="history-top">

                    <div>

                        <div class="booking-id">

                            🅿️ Booking #

                            ${escapeHTML(
                                String(
                                    booking.id || "-"
                                )
                            )}

                        </div>


                        <div class="booking-date">

                            📅

                            ${escapeHTML(
                                bookingDate
                            )}

                        </div>

                    </div>


                    <span
                        class="status-badge ${statusClass}"
                    >

                        ${escapeHTML(
                            String(status)
                        )}

                    </span>

                </div>


                <div class="history-grid">


                    <!-- PARKING SLOT -->

                    <div class="history-info">

                        <span class="history-label">

                            Parking Slot

                        </span>


                        <span class="history-value">

                            📍

                            ${escapeHTML(
                                String(slotNumber)
                            )}

                        </span>

                    </div>


                    <!-- VEHICLE -->

                    <div class="history-info">

                        <span class="history-label">

                            Vehicle

                        </span>


                        <span class="history-value">

                            🚗

                            ${escapeHTML(
                                String(vehicleNumber)
                            )}

                        </span>


                        ${
                            vehicleModel
                                ? `
                                    <small
                                        style="
                                            display:block;
                                            margin-top:5px;
                                            color:#64748b;
                                        "
                                    >

                                        ${escapeHTML(
                                            String(
                                                vehicleModel
                                            )
                                        )}

                                    </small>
                                  `
                                : ""
                        }

                    </div>


                    <!-- DURATION -->

                    <div class="history-info">

                        <span class="history-label">

                            Duration

                        </span>


                        <span class="history-value">

                            ⏱️

                            ${escapeHTML(
                                String(duration)
                            )}

                            hour(s)

                        </span>

                    </div>


                    <!-- AMOUNT -->

                    <div class="history-info">

                        <span class="history-label">

                            Parking Amount

                        </span>


                        <span
                            class="history-value amount"
                        >

                            ₹${amount}

                        </span>

                    </div>


                </div>

            `;


            /* =================================================
               ADD CARD
            ================================================= */

            list.appendChild(card);

        });


    }
    catch (error) {

        console.error(
            "Parking History Error:",
            error
        );


        loading.style.display =
            "none";


        errorBox.textContent =
            "❌ " + error.message;


        errorBox.style.display =
            "block";
    }

}


/* ============================================================
   STATUS CLASS
   ============================================================ */

function getStatusClass(status) {

    const value =
        String(status || "")
            .toUpperCase();


    if (value === "ACTIVE") {

        return "status-active";
    }


    if (
        value === "COMPLETED" ||
        value === "CONFIRMED"
    ) {

        return "status-completed";
    }


    if (
        value === "CANCELLED" ||
        value === "CANCELED"
    ) {

        return "status-cancelled";
    }


    return "status-default";
}


/* ============================================================
   FORMAT DATE
   ============================================================ */

function formatDate(value) {

    if (!value) {

        return "Date not available";
    }


    const date =
        new Date(value);


    if (isNaN(date.getTime())) {

        return String(value);
    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* ============================================================
   ESCAPE HTML
   ============================================================ */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ============================================================
   LOAD USER DETAILS
   ============================================================ */

function loadHistoryUser() {

    try {

        const userData =
            localStorage.getItem(
                "loggedInUser"
            );


        if (!userData) {

            window.location.href =
                "login.html";

            return;
        }


        const user =
            JSON.parse(userData);


        const name =
            document.getElementById(
                "userName"
            );


        const email =
            document.getElementById(
                "userEmail"
            );


        const avatar =
            document.getElementById(
                "userAvatar"
            );


        if (name) {

            name.textContent =
                user.name || "User";
        }


        if (email) {

            email.textContent =
                user.email || "";
        }


        if (avatar) {

            const firstLetter =
                (
                    user.name ||
                    "U"
                )
                .charAt(0)
                .toUpperCase();


            avatar.textContent =
                firstLetter;
        }


    }
    catch (error) {

        console.error(
            "User information error:",
            error
        );
    }

}


/* ============================================================
   PAGE LOAD
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadHistoryUser();

        loadHistory();

    }
);