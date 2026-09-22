/* ============================================================
   PARKING HISTORY
   ============================================================ */

async function loadHistory() {

    const loading = document.getElementById("historyLoading");
    const empty = document.getElementById("historyEmpty");
    const list = document.getElementById("historyList");
    const errorBox = document.getElementById("historyError");

    if (!loading || !empty || !list || !errorBox) {
        console.error("History HTML elements not found.");
        return;
    }

    loading.style.display = "block";
    empty.style.display = "none";
    list.innerHTML = "";
    errorBox.style.display = "none";

    try {

        /* ====================================================
           GET LOGGED-IN USER
           ==================================================== */

        const userData =
            localStorage.getItem("loggedInUser") ||
            localStorage.getItem("user");

        if (!userData) {
            window.location.href = "history.html";
            return;
        }

        const user = JSON.parse(userData);
        const userId = Number(user.id);

        console.log("=================================");
        console.log("PARKING HISTORY");
        console.log("User ID:", userId);
        console.log("=================================");

        if (!userId) {
            throw new Error("Invalid user ID.");
        }


        /* ====================================================
           API BASE
           ==================================================== */

        const apiBase =
            window.API_BASE ||
            "https://car-parking-production-5662.up.railway.app/api";

        const bookingUrl =
            `${apiBase}/parking-bookings/user/${userId}`;

        console.log("Booking API:", bookingUrl);


        /* ====================================================
           GET BOOKINGS
           ==================================================== */

        const bookingResponse =
            await fetch(bookingUrl);

        if (!bookingResponse.ok) {
            throw new Error(
                "Booking API error: HTTP " +
                bookingResponse.status
            );
        }

        const bookings =
            await bookingResponse.json();

        console.log(
            "Parking Bookings:",
            bookings
        );


        /* ====================================================
           STOP LOADING
           ==================================================== */

        loading.style.display = "none";


        /* ====================================================
           NO BOOKINGS
           ==================================================== */

        if (!Array.isArray(bookings) || bookings.length === 0) {

            empty.style.display = "block";

            console.log(
                "No bookings found for User:",
                userId
            );

            return;
        }


        /* ====================================================
           GET SLOT DATA
           ==================================================== */

        let slots = [];

        try {

            const response =
                await fetch(
                    `${apiBase}/parking-slots`
                );

            if (response.ok) {
                const data =
                    await response.json();

                slots =
                    Array.isArray(data) ?
                    data : [];
            }

        } catch (error) {

            console.warn(
                "Slot API error:",
                error
            );
        }


        /* ====================================================
           GET VEHICLE DATA
           ==================================================== */

        let vehicles = [];

        try {

            const response =
                await fetch(
                    `${apiBase}/vehicles`
                );

            if (response.ok) {

                const data =
                    await response.json();

                vehicles =
                    Array.isArray(data) ?
                    data : [];
            }

        } catch (error) {

            console.warn(
                "Vehicle API error:",
                error
            );
        }


        /* ====================================================
           SORT NEWEST FIRST
           ==================================================== */

        bookings.sort(function(a, b) {

            const dateA =
                new Date(
                    a.entryTime ||
                    a.bookingDate ||
                    0
                );

            const dateB =
                new Date(
                    b.entryTime ||
                    b.bookingDate ||
                    0
                );

            return dateB - dateA;
        });


        /* ====================================================
           DISPLAY BOOKINGS
           ==================================================== */

        bookings.forEach(function(booking) {

                    /* ------------------------------------------------
                       FIND SLOT
                       ------------------------------------------------ */

                    const slot =
                        slots.find(function(item) {

                            return Number(item.id) ===
                                Number(booking.slotId);

                        });


                    /* ------------------------------------------------
                       FIND VEHICLE
                       ------------------------------------------------ */

                    const vehicle =
                        vehicles.find(function(item) {

                            return Number(item.id) ===
                                Number(booking.vehicleId);

                        });


                    /* ------------------------------------------------
                       SLOT NUMBER
                       ------------------------------------------------ */

                    const slotNumber =
                        slot ?
                        (
                            slot.slotNumber ||
                            slot.slotName ||
                            `Slot #${booking.slotId}`
                        ) :
                        `Slot #${booking.slotId}`;


                    /* ------------------------------------------------
                       VEHICLE NUMBER
                       ------------------------------------------------ */

                    const vehicleNumber =
                        vehicle ?
                        (
                            vehicle.vehicleNumber ||
                            vehicle.registrationNumber ||
                            `Vehicle #${booking.vehicleId}`
                        ) :
                        `Vehicle #${booking.vehicleId}`;


                    /* ------------------------------------------------
                       VEHICLE MODEL
                       ------------------------------------------------ */

                    const vehicleModel =
                        vehicle ?
                        (
                            vehicle.vehicleModel ||
                            vehicle.model ||
                            ""
                        ) :
                        "";


                    /* ------------------------------------------------
                       VEHICLE TYPE
                       ------------------------------------------------ */

                    const vehicleType =
                        vehicle ?
                        (
                            vehicle.vehicleType ||
                            vehicle.type ||
                            ""
                        ) :
                        "";


                    /* ------------------------------------------------
                       AMOUNT
                       ------------------------------------------------ */

                    const amount =
                        Number(
                            booking.amount || 0
                        ).toFixed(2);


                    /* ------------------------------------------------
                       DURATION
                       ------------------------------------------------ */

                    const duration =
                        booking.durationHours != null ?
                        booking.durationHours :
                        "-";


                    /* ------------------------------------------------
                       STATUS
                       ------------------------------------------------ */

                    const status =
                        booking.status ||
                        "UNKNOWN";


                    /* ------------------------------------------------
                       STATUS CLASS
                       ------------------------------------------------ */

                    const statusClass =
                        getStatusClass(status);


                    /* ------------------------------------------------
                       DATES
                       ------------------------------------------------ */

                    const bookingDate =
                        formatDate(
                            booking.entryTime ||
                            booking.bookingDate
                        );


                    const entryTime =
                        booking.entryTime ?
                        formatDate(
                            booking.entryTime
                        ) :
                        "Not available";


                    const exitTime =
                        booking.exitTime ?
                        formatDate(
                            booking.exitTime
                        ) :
                        "Parking Active";


                    /* =================================================
                       CREATE CARD
                       ================================================= */

                    const card =
                        document.createElement("div");

                    card.className =
                        "history-card";


                    card.innerHTML = `

                <div class="history-top">

                    <div>

                        <div class="booking-id">

                            🅿️ Booking #${escapeHTML(
                                String(
                                    booking.id || "-"
                                )
                            )}

                        </div>

                        <div class="booking-date">

                            📅 ${escapeHTML(
                                bookingDate
                            )}

                        </div>

                    </div>


                    <span class="status-badge ${statusClass}">

                        ${escapeHTML(
                            String(status)
                        )}

                    </span>

                </div>


                <div class="history-grid">


                    <!-- SLOT -->

                    <div class="history-info">

                        <span class="history-label">

                            Parking Slot

                        </span>

                        <span class="history-value">

                            📍 ${escapeHTML(
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

                            🚗 ${escapeHTML(
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

                        ${
                            vehicleType
                                ? `
                                    <small
                                        style="
                                            display:block;
                                            margin-top:3px;
                                            color:#64748b;
                                        "
                                    >
                                        ${escapeHTML(
                                            String(
                                                vehicleType
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

                            ⏱️ ${escapeHTML(
                                String(duration)
                            )} hour(s)

                        </span>

                    </div>


                    <!-- AMOUNT -->

                    <div class="history-info">

                        <span class="history-label">

                            Parking Amount

                        </span>

                        <span class="history-value amount">

                            ₹${amount}

                        </span>

                    </div>


                    <!-- ENTRY -->

                    <div class="history-info">

                        <span class="history-label">

                            Entry Time

                        </span>

                        <span class="history-value">

                            🕐 ${escapeHTML(
                                entryTime
                            )}

                        </span>

                    </div>


                    <!-- EXIT -->

                    <div class="history-info">

                        <span class="history-label">

                            Exit Time

                        </span>

                        <span class="history-value">

                            🕐 ${escapeHTML(
                                exitTime
                            )}

                        </span>

                    </div>

                </div>

            `;


            list.appendChild(card);

        });


        console.log(
            "History cards displayed:",
            bookings.length
        );

    }

    catch (error) {

        console.error(
            "Parking History Error:",
            error
        );

        loading.style.display = "none";
        empty.style.display = "none";

        errorBox.textContent =
            "❌ " + error.message;

        errorBox.style.display = "block";
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

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
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
            localStorage.getItem("loggedInUser") ||
            localStorage.getItem("user");

        if (!userData) {
            window.location.href = "history.html";
            return;
        }

        const user =
            JSON.parse(userData);

        const name =
            document.getElementById("userName");

        const email =
            document.getElementById("userEmail");

        const avatar =
            document.getElementById("userAvatar");

        if (name) {
            name.textContent =
                user.name || "User";
        }

        if (email) {
            email.textContent =
                user.email || "";
        }

        if (avatar) {
            avatar.textContent =
                (
                    user.name ||
                    "U"
                )
                .charAt(0)
                .toUpperCase();
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
    function() {

        loadHistoryUser();
        loadHistory();

    }
);