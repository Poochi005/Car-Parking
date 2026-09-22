/* ============================================================
   MY BOOKINGS
   Show actual Slot Number + Vehicle Number
   ============================================================ */

const PARKING_API_BASE = "https://car-parking-production-5662.up.railway.app/api";
const CURRENT_USER_ID = 10;

let bookings = [];
let parkingSlots = [];
let vehicles = [];


/* ============================================================
   LOAD ALL DATA
   ============================================================ */

async function loadBookings() {

    try {

        showLoading();

        const [bookingResponse, slotResponse, vehicleResponse] =
        await Promise.all([
            fetch(`${PARKING_API_BASE}/parking-bookings/user/${CURRENT_USER_ID}`),
            fetch(`${PARKING_API_BASE}/parking-slots`),
            fetch(`${PARKING_API_BASE}/vehicles`)
        ]);


        /* ================= BOOKING DATA ================= */

        const bookingText = await bookingResponse.text();

        let bookingData = [];

        try {
            bookingData = bookingText ? JSON.parse(bookingText) : [];
        } catch (error) {
            throw new Error("Invalid booking API response");
        }


        if (!bookingResponse.ok) {
            throw new Error(
                bookingData.message || bookingText || "Failed to load bookings"
            );
        }


        /*
         * PowerShell sometimes displays Java List
         * as { value: [...], Count: ... }
         */

        if (Array.isArray(bookingData)) {

            bookings = bookingData;

        } else if (bookingData && Array.isArray(bookingData.value)) {

            bookings = bookingData.value;

        } else {

            bookings = [];

        }


        /* ================= SLOT DATA ================= */

        const slotText = await slotResponse.text();

        let slotData = [];

        try {
            slotData = slotText ? JSON.parse(slotText) : [];
        } catch (error) {
            console.error("Slot JSON error:", error);
        }


        if (Array.isArray(slotData)) {
            parkingSlots = slotData;
        } else if (slotData && Array.isArray(slotData.value)) {
            parkingSlots = slotData.value;
        } else {
            parkingSlots = [];
        }


        /* ================= VEHICLE DATA ================= */

        const vehicleText = await vehicleResponse.text();

        let vehicleData = [];

        try {
            vehicleData = vehicleText ? JSON.parse(vehicleText) : [];
        } catch (error) {
            console.error("Vehicle JSON error:", error);
        }


        if (Array.isArray(vehicleData)) {
            vehicles = vehicleData;
        } else if (vehicleData && Array.isArray(vehicleData.value)) {
            vehicles = vehicleData.value;
        } else {
            vehicles = [];
        }


        console.log("Bookings:", bookings);
        console.log("Parking Slots:", parkingSlots);
        console.log("Vehicles:", vehicles);


        updateStatistics();
        renderBookings();

    } catch (error) {

        console.error("Booking loading error:", error);

        showError(error.message);

    }

}


/* ============================================================
   GET SLOT
   ============================================================ */

function getSlotById(slotId) {

    return parkingSlots.find(function(slot) {

        return Number(slot.id) === Number(slotId);

    }) || null;

}


/* ============================================================
   GET VEHICLE
   ============================================================ */

function getVehicleById(vehicleId) {

    return vehicles.find(function(vehicle) {

        return Number(vehicle.id) === Number(vehicleId);

    }) || null;

}


/* ============================================================
   STATISTICS
   ============================================================ */

function updateStatistics() {

    const totalElement =
        document.getElementById("totalBookings");

    const activeElement =
        document.getElementById("activeBookings");

    const completedElement =
        document.getElementById("completedBookings");

    const cancelledElement =
        document.getElementById("cancelledBookings");


    const total = bookings.length;

    const active = bookings.filter(function(booking) {

        return String(booking.status).toUpperCase() === "ACTIVE";

    }).length;


    const completed = bookings.filter(function(booking) {

        return String(booking.status).toUpperCase() === "COMPLETED";

    }).length;


    const cancelled = bookings.filter(function(booking) {

        return String(booking.status).toUpperCase() === "CANCELLED";

    }).length;


    if (totalElement) {
        totalElement.textContent = total;
    }

    if (activeElement) {
        activeElement.textContent = active;
    }

    if (completedElement) {
        completedElement.textContent = completed;
    }

    if (cancelledElement) {
        cancelledElement.textContent = cancelled;
    }

}


/* ============================================================
   RENDER BOOKINGS
   ============================================================ */

function renderBookings() {

    const list =
        document.getElementById("bookingList");

    const message =
        document.getElementById("vehicleListMessage");


    if (!list) {
        console.error("bookingList element not found");
        return;
    }


    let filteredBookings = [...bookings];


    /* ================= STATUS FILTER ================= */

    const statusFilter =
        document.getElementById("statusFilter");


    if (statusFilter) {

        const selectedStatus =
            statusFilter.value.toUpperCase();


        if (selectedStatus && selectedStatus !== "ALL") {

            filteredBookings =
                filteredBookings.filter(function(booking) {

                    return String(booking.status).toUpperCase() ===
                        selectedStatus;

                });

        }

    }


    /* ================= SEARCH ================= */

    const searchInput =
        document.getElementById("bookingSearch");


    if (searchInput) {

        const searchText =
            searchInput.value.trim().toLowerCase();


        if (searchText) {

            filteredBookings =
                filteredBookings.filter(function(booking) {

                    const slot =
                        getSlotById(booking.slotId);

                    const vehicle =
                        getVehicleById(booking.vehicleId);


                    const slotNumber =
                        slot && slot.slotNumber ?
                        slot.slotNumber :
                        "";


                    const vehicleNumber =
                        vehicle && vehicle.vehicleNumber ?
                        vehicle.vehicleNumber :
                        "";


                    return (
                        String(booking.id).includes(searchText) ||
                        slotNumber.toLowerCase().includes(searchText) ||
                        vehicleNumber.toLowerCase().includes(searchText)
                    );

                });

        }

    }


    /* ================= EMPTY ================= */

    if (filteredBookings.length === 0) {

        list.innerHTML = "";

        if (message) {

            message.style.display = "block";

            message.textContent =
                bookings.length === 0 ?
                "No bookings found." :
                "No bookings match your filter.";

        }

        return;

    }


    if (message) {
        message.style.display = "none";
    }


    /* ================= SORT ================= */

    filteredBookings.sort(function(a, b) {

        return Number(b.id) - Number(a.id);

    });


    list.innerHTML = "";


    filteredBookings.forEach(function(booking) {

        const slot =
            getSlotById(booking.slotId);

        const vehicle =
            getVehicleById(booking.vehicleId);


        /* ================= ACTUAL VALUES ================= */

        const slotNumber =
            slot && slot.slotNumber ?
            slot.slotNumber :
            `Slot ID ${booking.slotId}`;


        const vehicleNumber =
            vehicle && vehicle.vehicleNumber ?
            vehicle.vehicleNumber :
            `Vehicle ID ${booking.vehicleId}`;


        const vehicleModel =
            vehicle && vehicle.model ?
            vehicle.model :
            "";


        const status =
            String(booking.status || "UNKNOWN").toUpperCase();


        const amount =
            Number(booking.amount || 0);


        const duration =
            Number(booking.durationHours || 0);


        /* ================= CARD ================= */

        const card =
            document.createElement("div");

        card.className =
            "booking-card";


        card.innerHTML = `

            <div class="booking-card-header">

                <div>

                    <h3>
                        Booking #${booking.id}
                    </h3>

                    <span class="booking-status ${status.toLowerCase()}">
                        ${status}
                    </span>

                </div>

            </div>


            <div class="booking-info-grid">

                <div class="booking-info">

                    <span class="label">
                        🅿️ Parking Slot
                    </span>

                    <strong>
                        ${escapeHTML(slotNumber)}
                    </strong>

                </div>


                <div class="booking-info">

                    <span class="label">
                        🚗 Vehicle
                    </span>

                    <strong>
                        ${escapeHTML(vehicleNumber)}
                    </strong>

                </div>


                <div class="booking-info">

                    <span class="label">
                        🚘 Model
                    </span>

                    <strong>
                        ${escapeHTML(vehicleModel || "N/A")}
                    </strong>

                </div>


                <div class="booking-info">

                    <span class="label">
                        📅 Date
                    </span>

                    <strong>
                        ${formatDate(booking.bookingDate)}
                    </strong>

                </div>


                <div class="booking-info">

                    <span class="label">
                        ⏱️ Duration
                    </span>

                    <strong>
                        ${duration} hour${duration === 1 ? "" : "s"}
                    </strong>

                </div>


                <div class="booking-info">

                    <span class="label">
                        💰 Amount
                    </span>

                    <strong>
                        ₹${amount.toFixed(2)}
                    </strong>

                </div>

            </div>


            <button
                class="secondary-btn"
                onclick="showBookingDetails(${booking.id})"
            >
                View Details
            </button>

        `;


        list.appendChild(card);

    });

}


/* ============================================================
   BOOKING DETAILS
   ============================================================ */

function showBookingDetails(bookingId) {

    const booking =
        bookings.find(function(item) {

            return Number(item.id) === Number(bookingId);

        });


    if (!booking) {
        return;
    }


    const slot =
        getSlotById(booking.slotId);


    const vehicle =
        getVehicleById(booking.vehicleId);


    const details =
        document.getElementById("bookingDetails");


    const modal =
        document.getElementById("bookingModal");


    if (!details || !modal) {
        return;
    }


    const slotNumber =
        slot && slot.slotNumber ?
        slot.slotNumber :
        `Slot ID ${booking.slotId}`;


    const vehicleNumber =
        vehicle && vehicle.vehicleNumber ?
        vehicle.vehicleNumber :
        `Vehicle ID ${booking.vehicleId}`;


    const vehicleModel =
        vehicle && vehicle.model ?
        vehicle.model :
        "N/A";


    details.innerHTML = `

        <div class="detail-row">
            <span>Booking ID</span>
            <strong>#${booking.id}</strong>
        </div>


        <div class="detail-row">
            <span>Parking Slot</span>
            <strong>🅿️ ${escapeHTML(slotNumber)}</strong>
        </div>


        <div class="detail-row">
            <span>Vehicle Number</span>
            <strong>🚗 ${escapeHTML(vehicleNumber)}</strong>
        </div>


        <div class="detail-row">
            <span>Vehicle Model</span>
            <strong>${escapeHTML(vehicleModel)}</strong>
        </div>


        <div class="detail-row">
            <span>Booking Date</span>
            <strong>${formatDate(booking.bookingDate)}</strong>
        </div>


        <div class="detail-row">
            <span>Entry Time</span>
            <strong>${formatDateTime(booking.entryTime)}</strong>
        </div>


        <div class="detail-row">
            <span>Exit Time</span>
            <strong>
                ${
                    booking.exitTime
                        ? formatDateTime(booking.exitTime)
                        : "Not exited"
                }
            </strong>
        </div>


        <div class="detail-row">
            <span>Duration</span>
            <strong>
                ${Number(booking.durationHours || 0)} hours
            </strong>
        </div>


        <div class="detail-row">
            <span>Amount</span>
            <strong>
                ₹${Number(booking.amount || 0).toFixed(2)}
            </strong>
        </div>


        <div class="detail-row">
            <span>Status</span>
            <strong>
                ${escapeHTML(
                    String(booking.status || "UNKNOWN")
                )}
            </strong>
        </div>

    `;


    modal.style.display = "flex";

}


/* ============================================================
   CLOSE MODAL
   ============================================================ */

function closeBookingModal() {

    const modal =
        document.getElementById("bookingModal");


    if (modal) {
        modal.style.display = "none";
    }

}


/* ============================================================
   DATE FORMAT
   ============================================================ */

function formatDate(dateValue) {

    if (!dateValue) {
        return "N/A";
    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {
        return dateValue;
    }


    return date.toLocaleDateString(
        "en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* ============================================================
   DATE + TIME FORMAT
   ============================================================ */

function formatDateTime(dateValue) {

    if (!dateValue) {
        return "N/A";
    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {
        return dateValue;
    }


    return date.toLocaleString(
        "en-IN", {
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

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ============================================================
   LOADING
   ============================================================ */

function showLoading() {

    const list =
        document.getElementById("bookingList");

    const message =
        document.getElementById("vehicleListMessage");


    if (list) {
        list.innerHTML = "";
    }


    if (message) {

        message.style.display = "block";

        message.textContent =
            "Loading bookings...";

    }

}


/* ============================================================
   ERROR
   ============================================================ */

function showError(messageText) {

    const list =
        document.getElementById("bookingList");

    const message =
        document.getElementById("vehicleListMessage");


    if (list) {
        list.innerHTML = "";
    }


    if (message) {

        message.style.display = "block";

        message.textContent =
            "❌ " + messageText;

    }

}


/* ============================================================
   FILTER EVENTS
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const statusFilter =
            document.getElementById("statusFilter");


        const searchInput =
            document.getElementById("bookingSearch");


        if (statusFilter) {

            statusFilter.addEventListener(
                "change",
                renderBookings
            );

        }


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                renderBookings
            );

        }


        loadBookings();

    }
);


/* ============================================================
   CLOSE MODAL EVENTS
   ============================================================ */

window.addEventListener(
    "click",
    function(event) {

        const modal =
            document.getElementById("bookingModal");


        if (modal && event.target === modal) {

            closeBookingModal();

        }

    }
);


document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {

            closeBookingModal();

        }

    }
);