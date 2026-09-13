/* =====================================================
   SMART CAR PARKING FRONTEND
   REAL-TIME VERSION
===================================================== */

const API_BASE_URL = "http://localhost:8081";

let allSlots = [];
let allBookings = [];

let selectedSlot = null;

let refreshTimer = null;
let bookingTimer = null;
let toastTimer = null;


/* =====================================================
   DOM READY
===================================================== */

document.addEventListener("DOMContentLoaded", function() {

    console.log("Smart Car Parking Frontend Started");

    setupLogin();

    setupBooking();

    setupRememberMe();

    const user =
        localStorage.getItem("parkingUser");

    if (user) {

        updateUserDetails(user);

    }

});


/* =====================================================
   LOGIN
===================================================== */

function setupLogin() {

    const loginForm =
        document.getElementById("loginForm");

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            const username =
                document
                .getElementById("username")
                .value
                .trim();

            const password =
                document
                .getElementById("password")
                .value
                .trim();

            const rememberMe =
                document
                .getElementById("rememberMe")
                .checked;


            if (!username || !password) {

                showToast(
                    "Please enter username and password"
                );

                return;
            }


            /*
             * Frontend demo authentication.
             *
             * Later you can connect:
             *
             * POST /api/auth/login
             */

            localStorage.setItem(
                "parkingUser",
                username
            );


            if (rememberMe) {

                localStorage.setItem(
                    "rememberMe",
                    "true"
                );

            } else {

                localStorage.removeItem(
                    "rememberMe"
                );

            }


            openDashboard(username);

        }
    );

}


/* =====================================================
   OPEN DASHBOARD
===================================================== */

function openDashboard(username) {

    const loginPage =
        document.getElementById(
            "loginPage"
        );

    const dashboardPage =
        document.getElementById(
            "dashboardPage"
        );


    if (loginPage) {

        loginPage.classList.add(
            "hidden"
        );

    }


    if (dashboardPage) {

        dashboardPage.classList.remove(
            "hidden"
        );

    }


    updateUserDetails(
        username
    );


    showToast(
        "Login successful!"
    );


    loadSlots();

    loadBookings();


    startRealTimeUpdates();

}


/* =====================================================
   USER DETAILS
===================================================== */

function updateUserDetails(username) {

    if (!username) {
        username = "User";
    }


    const headerUserName =
        document.getElementById(
            "headerUserName"
        );

    const profileName =
        document.getElementById(
            "profileName"
        );

    const profileEmail =
        document.getElementById(
            "profileEmail"
        );

    const headerAvatar =
        document.getElementById(
            "headerAvatar"
        );

    const profileAvatar =
        document.getElementById(
            "profileAvatar"
        );


    if (headerUserName) {

        headerUserName.textContent =
            username;

    }


    if (profileName) {

        profileName.textContent =
            username;

    }


    if (profileEmail) {

        profileEmail.textContent =
            username;

    }


    const initials =
        getInitials(username);


    if (headerAvatar) {

        headerAvatar.textContent =
            initials;

    }


    if (profileAvatar) {

        profileAvatar.textContent =
            initials;

    }

}


/* =====================================================
   GET INITIALS
===================================================== */

function getInitials(name) {

    if (!name) {
        return "U";
    }

    const words =
        name
        .trim()
        .split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();

}


/* =====================================================
   PASSWORD
===================================================== */

function togglePassword() {

    const password =
        document.getElementById(
            "password"
        );

    if (!password) {
        return;
    }


    password.type =
        password.type === "password" ?
        "text" :
        "password";

}


/* =====================================================
   FORGOT PASSWORD
===================================================== */

function forgotPassword() {

    showToast(
        "Password recovery coming soon"
    );

}


/* =====================================================
   REMEMBER ME
===================================================== */

function setupRememberMe() {

    const rememberMe =
        document.getElementById(
            "rememberMe"
        );

    if (!rememberMe) {
        return;
    }


    const saved =
        localStorage.getItem(
            "rememberMe"
        );


    rememberMe.checked =
        saved === "true";

}


/* =====================================================
   LOGOUT
===================================================== */

function logout() {

    localStorage.removeItem(
        "parkingUser"
    );

    stopRealTimeUpdates();


    const dashboardPage =
        document.getElementById(
            "dashboardPage"
        );

    const loginPage =
        document.getElementById(
            "loginPage"
        );


    if (dashboardPage) {

        dashboardPage.classList.add(
            "hidden"
        );

    }


    if (loginPage) {

        loginPage.classList.remove(
            "hidden"
        );

    }


    showToast(
        "Logged out successfully"
    );

}


/* =====================================================
   REAL-TIME UPDATES
===================================================== */

function startRealTimeUpdates() {

    stopRealTimeUpdates();


    /*
     * Refresh parking slots
     * every 5 seconds.
     */

    refreshTimer =
        setInterval(
            function() {

                if (
                    localStorage.getItem(
                        "parkingUser"
                    )
                ) {

                    loadSlots();

                }

            },
            5000
        );


    /*
     * Refresh bookings
     * every 10 seconds.
     */

    bookingTimer =
        setInterval(
            function() {

                if (
                    localStorage.getItem(
                        "parkingUser"
                    )
                ) {

                    loadBookings();

                }

            },
            10000
        );

}


function stopRealTimeUpdates() {

    if (refreshTimer) {

        clearInterval(
            refreshTimer
        );

        refreshTimer = null;

    }


    if (bookingTimer) {

        clearInterval(
            bookingTimer
        );

        bookingTimer = null;

    }

}


/* =====================================================
   LOAD PARKING SLOTS
===================================================== */

async function loadSlots() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/slots`, {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "Invalid slots response"
            );

        }


        allSlots = data;


        console.log(
            "Live parking slots:",
            allSlots
        );


        updateStatistics();

        renderMiniSlots(
            allSlots
        );

        renderSlots(
            getFilteredSlots()
        );

        recommendSlot();


        updateLastUpdated();


        /*
         * Try to update revenue and vehicles
         * from booking API.
         */

        loadBookings(
            false
        );

    } catch (error) {

        console.error(
            "Parking API Error:",
            error
        );


        showToast(
            "Unable to connect to Parking API"
        );

    }

}


/* =====================================================
   UPDATE LAST UPDATED
===================================================== */

function updateLastUpdated() {

    const element =
        document.getElementById(
            "lastUpdated"
        );

    if (!element) {
        return;
    }


    const now =
        new Date();


    element.textContent =
        now.toLocaleTimeString(
            [], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );

}


/* =====================================================
   STATISTICS
===================================================== */

function updateStatistics() {

    const total =
        allSlots.length;


    const available =
        allSlots.filter(
            slot =>
            String(
                slot.status
            ).toUpperCase() ===
            "AVAILABLE"
        ).length;


    const occupied =
        allSlots.filter(
            slot =>
            String(
                slot.status
            ).toUpperCase() ===
            "OCCUPIED"
        ).length;


    setText(
        "totalSlots",
        total
    );

    setText(
        "availableSlots",
        available
    );

    setText(
        "occupiedSlots",
        occupied
    );


    updateRevenue();

}


/* =====================================================
   SET TEXT
===================================================== */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );

    if (element) {

        element.textContent =
            value;

    }

}


/* =====================================================
   FILTER
===================================================== */

function getFilteredSlots() {

    const floorElement =
        document.getElementById(
            "floorFilter"
        );

    const statusElement =
        document.getElementById(
            "statusFilter"
        );

    const vehicleElement =
        document.getElementById(
            "vehicleFilter"
        );


    const floor =
        floorElement ?
        floorElement.value :
        "ALL";


    const status =
        statusElement ?
        statusElement.value :
        "ALL";


    const vehicle =
        vehicleElement ?
        vehicleElement.value :
        "ALL";


    return allSlots.filter(
        slot => {

            const slotStatus =
                String(
                    slot.status
                ).toUpperCase();


            const floorMatch =
                floor === "ALL" ||
                String(slot.floor)
                .toLowerCase() ===
                floor.toLowerCase();


            const statusMatch =
                status === "ALL" ||
                slotStatus === status;


            const vehicleMatch =
                vehicle === "ALL" ||
                String(slot.vehicleType)
                .toLowerCase() ===
                vehicle.toLowerCase();


            return (
                floorMatch &&
                statusMatch &&
                vehicleMatch
            );

        }
    );

}


function filterSlots() {

    renderSlots(
        getFilteredSlots()
    );

}


/* =====================================================
   MINI PARKING GRID
===================================================== */

function renderMiniSlots(slots) {

    const container =
        document.getElementById(
            "parkingMiniGrid"
        );

    if (!container) {
        return;
    }


    if (!slots || slots.length === 0) {

        container.innerHTML = `
            <div class="empty-small">
                <i class="fa-solid fa-square-parking"></i>
                <span>No parking slots found</span>
            </div>
        `;

        return;
    }


    container.innerHTML =
        slots.map(
            slot => {

                const occupied =
                    String(
                        slot.status
                    ).toUpperCase() ===
                    "OCCUPIED";


                return `
                    <div
                        class="mini-slot ${
                            occupied
                                ? "occupied"
                                : "available"
                        }"
                        title="${escapeHtml(
                            slot.slotNumber ??
                            "Slot"
                        )} - ${
                            occupied
                                ? "Occupied"
                                : "Available"
                        }">

                        <i class="fa-solid fa-car"></i>

                    </div>
                `;

            }
        ).join("");

}


/* =====================================================
   FULL SLOT GRID
===================================================== */

function renderSlots(slots) {

    const grid =
        document.getElementById(
            "slotGrid"
        );

    if (!grid) {
        return;
    }


    if (!slots || slots.length === 0) {

        grid.innerHTML = `
            <div class="empty-state">

                <i class="fa-solid fa-square-parking"></i>

                <h3>
                    No slots found
                </h3>

                <p>
                    Try changing the filters.
                </p>

            </div>
        `;

        return;
    }


    grid.innerHTML =
        slots.map(
            slot => {

                const available =
                    String(
                        slot.status
                    ).toUpperCase() ===
                    "AVAILABLE";


                return `
                    <div
                        class="slot-card ${
                            available
                                ? "available"
                                : "occupied"
                        }">

                        <div class="slot-top">

                            <span class="slot-number">
                                ${escapeHtml(
                                    slot.slotNumber ??
                                    "-"
                                )}
                            </span>

                            <span
                                class="status-badge ${
                                    available
                                        ? "available"
                                        : "occupied"
                                }">

                                ${
                                    available
                                        ? "AVAILABLE"
                                        : "OCCUPIED"
                                }

                            </span>

                        </div>


                        <div class="slot-details">

                            <div class="slot-detail">

                                <span>
                                    Floor
                                </span>

                                <strong>
                                    ${escapeHtml(
                                        slot.floor ??
                                        "-"
                                    )}
                                </strong>

                            </div>


                            <div class="slot-detail">

                                <span>
                                    Section
                                </span>

                                <strong>
                                    ${escapeHtml(
                                        slot.section ??
                                        "-"
                                    )}
                                </strong>

                            </div>


                            <div class="slot-detail">

                                <span>
                                    Vehicle
                                </span>

                                <strong>
                                    ${escapeHtml(
                                        slot.vehicleType ??
                                        "-"
                                    )}
                                </strong>

                            </div>


                            <div class="slot-detail">

                                <span>
                                    Size
                                </span>

                                <strong>
                                    ${escapeHtml(
                                        slot.slotSize ??
                                        "-"
                                    )}
                                </strong>

                            </div>


                            <div class="slot-detail">

                                <span>
                                    Price / Hour
                                </span>

                                <strong>
                                    ₹${escapeHtml(
                                        slot.pricePerHour ??
                                        "0"
                                    )}
                                </strong>

                            </div>

                        </div>


                        ${
                            available
                                ? `
                                    <button
                                        class="book-btn"
                                        onclick="openBookingModal(${Number(
                                            slot.id
                                        )})">

                                        Book This Slot

                                    </button>
                                `
                                : `
                                    <button
                                        class="book-btn disabled"
                                        disabled>

                                        Currently Occupied

                                    </button>
                                `
                        }

                    </div>
                `;

            }
        ).join("");

}


/* =====================================================
   AI RECOMMENDATION
===================================================== */

function recommendSlot() {

    const recommended =
        document.getElementById(
            "recommendedSlot"
        );

    const details =
        document.getElementById(
            "recommendedDetails"
        );


    if (!recommended) {
        return;
    }


    const availableSlots =
        allSlots.filter(
            slot =>
                String(
                    slot.status
                ).toUpperCase()
                === "AVAILABLE"
        );


    if (availableSlots.length === 0) {

        recommended.textContent =
            "No Slot";

        if (details) {

            details.textContent =
                "No available parking slot";

        }

        return;
    }


    /*
     * Simple AI-style recommendation:
     *
     * 1. Available only
     * 2. Lower price preferred
     * 3. Lower ID used as tie breaker
     */

    availableSlots.sort(
        function (a, b) {

            const priceA =
                Number(
                    a.pricePerHour || 0
                );

            const priceB =
                Number(
                    b.pricePerHour || 0
                );


            if (priceA !== priceB) {

                return priceA - priceB;

            }


            return (
                Number(a.id || 0) -
                Number(b.id || 0)
            );

        }
    );


    const best =
        availableSlots[0];


    recommended.textContent =
        best.slotNumber ||
        "Available";


    if (details) {

        const floor =
            best.floor ||
            "Parking Area";


        const price =
            best.pricePerHour ||
            0;


        details.textContent =
            `${floor} • ₹${price}/hour`;

    }

}


/* =====================================================
   BOOK RECOMMENDED
===================================================== */

function bookRecommendedSlot() {

    const available =
        allSlots.find(
            slot =>
                String(
                    slot.status
                ).toUpperCase()
                === "AVAILABLE"
        );


    if (!available) {

        showToast(
            "No available parking slot"
        );

        return;
    }


    const recommended =
        allSlots
            .filter(
                slot =>
                    String(
                        slot.status
                    ).toUpperCase()
                    === "AVAILABLE"
            )
            .sort(
                (a, b) =>
                    Number(
                        a.pricePerHour || 0
                    ) -
                    Number(
                        b.pricePerHour || 0
                    )
            )[0];


    openBookingModal(
        recommended.id
    );

}


/* =====================================================
   BOOKING MODAL
===================================================== */

function openBookingModal(slotId) {

    selectedSlot =
        allSlots.find(
            slot =>
                Number(slot.id) ===
                Number(slotId)
        );


    if (!selectedSlot) {

        showToast(
            "Parking slot not found"
        );

        return;
    }


    setValue(
        "selectedSlotId",
        selectedSlot.id
    );


    setText(
        "selectedSlotNumber",
        selectedSlot.slotNumber
    );


    setValue(
        "bookingVehicleType",
        selectedSlot.vehicleType ||
        ""
    );


    const now =
        new Date();


    const oneHourLater =
        new Date(
            now.getTime() +
            60 * 60 * 1000
        );


    setValue(
        "startTime",
        formatDateTime(now)
    );


    setValue(
        "endTime",
        formatDateTime(oneHourLater)
    );


    /*
     * Fill customer name automatically.
     */

    const user =
        localStorage.getItem(
            "parkingUser"
        );


    if (user) {

        setValue(
            "customerName",
            user
        );

    }


    const modal =
        document.getElementById(
            "bookingModal"
        );


    if (modal) {

        modal.classList.remove(
            "hidden"
        );

    }

}


/* =====================================================
   CLOSE MODAL
===================================================== */

function closeBookingModal() {

    const modal =
        document.getElementById(
            "bookingModal"
        );


    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

}


/* =====================================================
   FORMAT DATETIME
===================================================== */

function formatDateTime(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    const hours =
        String(
            date.getHours()
        ).padStart(
            2,
            "0"
        );


    const minutes =
        String(
            date.getMinutes()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}T${hours}:${minutes}`;

}


/* =====================================================
   SET VALUE
===================================================== */

function setValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );

    if (element) {

        element.value =
            value ?? "";

    }

}


/* =====================================================
   BOOKING FORM
===================================================== */

function setupBooking() {

    const bookingForm =
        document.getElementById(
            "bookingForm"
        );


    if (!bookingForm) {
        return;
    }


    bookingForm.addEventListener(
        "submit",
        handleBooking
    );

}


/* =====================================================
   HANDLE BOOKING
===================================================== */

async function handleBooking(event) {

    event.preventDefault();


    if (!selectedSlot) {

        showToast(
            "Please select a parking slot"
        );

        return;
    }


    const customerName =
        getValue(
            "customerName"
        );


    const vehicleNumber =
        getValue(
            "vehicleNumber"
        );


    const vehicleType =
        getValue(
            "bookingVehicleType"
        );


    const startTime =
        getValue(
            "startTime"
        );


    const endTime =
        getValue(
            "endTime"
        );


    if (
        !customerName ||
        !vehicleNumber ||
        !vehicleType ||
        !startTime ||
        !endTime
    ) {

        showToast(
            "Please fill all booking details"
        );

        return;
    }


    if (
        new Date(endTime) <=
        new Date(startTime)
    ) {

        showToast(
            "End time must be after start time"
        );

        return;
    }


    const bookingData = {

        slotId:
            Number(
                selectedSlot.id
            ),

        customerName:
            customerName,

        vehicleNumber:
            vehicleNumber,

        vehicleType:
            vehicleType,

        startTime:
            startTime,

        endTime:
            endTime

    };


    console.log(
        "Sending booking:",
        bookingData
    );


    try {

        showToast(
            "Creating booking..."
        );


        const response =
            await fetch(
                `${API_BASE_URL}/api/bookings`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            bookingData
                        )

                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                errorText ||
                `HTTP ${response.status}`
            );

        }


        let result = null;

        try {

            result =
                await response.json();

        } catch (e) {

            console.log(
                "Booking response has no JSON"
            );

        }


        console.log(
            "Booking successful:",
            result
        );


        const slotNumber =
            selectedSlot.slotNumber;


        showToast(
            `Slot ${slotNumber} booked successfully!`
        );


        closeBookingModal();


        const form =
            document.getElementById(
                "bookingForm"
            );


        if (form) {

            form.reset();

        }


        selectedSlot =
            null;


        /*
         * Immediately reload live data.
         */

        await loadSlots();

        await loadBookings();


        showSectionByName(
            "bookings"
        );

    }

    catch (error) {

        console.error(
            "Booking API Error:",
            error
        );


        showToast(
            "Booking failed. Check backend API."
        );

    }

}


/* =====================================================
   LOAD BOOKINGS
===================================================== */

async function loadBookings(
    showMessage = false
) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/bookings`,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "Invalid bookings response"
            );

        }


        allBookings =
            data;


        console.log(
            "Live bookings:",
            allBookings
        );


        renderRecentVehicles(
            allBookings
        );


        renderBookingList(
            allBookings
        );


        renderHistory(
            allBookings
        );


        updateRevenue();


        if (showMessage) {

            showToast(
                "Bookings updated"
            );

        }

    }

    catch (error) {

        /*
         * /api/bookings may not exist yet.
         *
         * Parking slots continue to work.
         */

        console.warn(
            "Booking API not available:",
            error.message
        );

    }

}


/* =====================================================
   RECENT VEHICLES
===================================================== */

function renderRecentVehicles(
    bookings
) {

    const container =
        document.getElementById(
            "recentVehicleList"
        );


    if (!container) {
        return;
    }


    if (!bookings || bookings.length === 0) {

        container.innerHTML = `
            <div class="empty-small">

                <i class="fa-solid fa-car"></i>

                <span>
                    No recent vehicles
                </span>

            </div>
        `;

        return;
    }


    const recent =
        [...bookings]
            .reverse()
            .slice(
                0,
                5
            );


    container.innerHTML =
        recent.map(
            booking => {

                const vehicleNumber =
                    booking.vehicleNumber ||
                    booking.vehicleNo ||
                    "Unknown Vehicle";


                const status =
                    booking.status ||
                    "Approved";


                return `
                    <div class="vehicle-item">

                        <i class="fa-solid fa-car"></i>

                        <div>

                            <strong>
                                ${escapeHtml(
                                    vehicleNumber
                                )}
                            </strong>

                            <small>
                                ${
                                    booking.startTime
                                        ? formatDisplayDate(
                                            booking.startTime
                                        )
                                        : "Recent booking"
                                }
                            </small>

                        </div>

                        <span class="approved">
                            ${escapeHtml(
                                status
                            )}
                        </span>

                    </div>
                `;

            }
        ).join("");

}


/* =====================================================
   BOOKING LIST
===================================================== */

function renderBookingList(
    bookings
) {

    const container =
        document.getElementById(
            "bookingList"
        );


    if (!container) {
        return;
    }


    if (!bookings || bookings.length === 0) {

        container.innerHTML = `
            <div class="empty-state">

                <i class="fa-solid fa-calendar-check"></i>

                <h3>
                    No bookings yet
                </h3>

                <p>
                    Select an available parking slot
                    to create your first booking.
                </p>

            </div>
        `;

        return;
    }


    const sorted =
        [...bookings]
            .reverse();


    container.innerHTML =
        sorted.map(
            booking => {

                const slot =
                    booking.slotNumber ||
                    booking.slot?.slotNumber ||
                    booking.slotId ||
                    "-";


                const vehicle =
                    booking.vehicleNumber ||
                    booking.vehicleNo ||
                    "-";


                const status =
                    booking.status ||
                    "CONFIRMED";


                return `
                    <div class="booking-card">

                        <div>

                            <strong>
                                Slot ${escapeHtml(
                                    String(slot)
                                )}
                            </strong>

                            <span>
                                Parking Slot
                            </span>

                        </div>


                        <div>

                            <strong>
                                ${escapeHtml(
                                    vehicle
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    booking.vehicleType ||
                                    "Vehicle"
                                )}
                            </span>

                        </div>


                        <div>

                            <strong>
                                ${
                                    booking.startTime
                                        ? formatDisplayDate(
                                            booking.startTime
                                        )
                                        : "-"
                                }
                            </strong>

                            <span>
                                ${
                                    booking.endTime
                                        ? formatDisplayDate(
                                            booking.endTime
                                        )
                                        : ""
                                }
                            </span>

                        </div>


                        <span class="booking-status">
                            ${escapeHtml(
                                status
                            )}
                        </span>

                    </div>
                `;

            }
        ).join("");

}


/* =====================================================
   HISTORY
===================================================== */

function renderHistory(
    bookings
) {

    const container =
        document.getElementById(
            "historyList"
        );


    if (!container) {
        return;
    }


    if (!bookings || bookings.length === 0) {

        container.innerHTML = `
            <div class="empty-state">

                <i class="fa-solid fa-clock-rotate-left"></i>

                <h3>
                    No parking history
                </h3>

                <p>
                    Your completed bookings will appear here.
                </p>

            </div>
        `;

        return;
    }


    const history =
        [...bookings]
            .reverse();


    container.innerHTML =
        history.map(
            booking => {

                const slot =
                    booking.slotNumber ||
                    booking.slot?.slotNumber ||
                    booking.slotId ||
                    "-";


                const vehicle =
                    booking.vehicleNumber ||
                    booking.vehicleNo ||
                    "-";


                const amount =
                    booking.totalAmount ??
                    booking.amount ??
                    booking.price ??
                    0;


                const status =
                    booking.status ||
                    "Completed";


                return `
                    <div class="history-row">

                        <span>
                            ${escapeHtml(
                                String(slot)
                            )}
                        </span>

                        <span>
                            ${escapeHtml(
                                vehicle
                            )}
                        </span>

                        <span>
                            ${
                                booking.startTime &&
                                booking.endTime
                                    ? calculateHours(
                                        booking.startTime,
                                        booking.endTime
                                    ) + " Hours"
                                    : "-"
                            }
                        </span>

                        <strong>
                            ₹${escapeHtml(
                                String(amount)
                            )}
                        </strong>

                        <span class="completed">
                            ${escapeHtml(
                                status
                            )}
                        </span>

                    </div>
                `;

            }
        ).join("");

}


/* =====================================================
   REVENUE
===================================================== */

function updateRevenue() {

    const revenueElement =
        document.getElementById(
            "todayRevenue"
        );


    if (!revenueElement) {
        return;
    }


    /*
     * Revenue is calculated from booking data.
     *
     * If backend returns:
     * totalAmount / amount / price
     * it will be used.
     */

    if (
        !allBookings ||
        allBookings.length === 0
    ) {

        revenueElement.textContent =
            "₹ 0";

        return;
    }


    const today =
        new Date();


    let revenue = 0;


    allBookings.forEach(
        booking => {

            if (
                booking.startTime &&
                !isToday(
                    booking.startTime
                )
            ) {

                return;

            }


            const amount =
                Number(
                    booking.totalAmount ??
                    booking.amount ??
                    booking.price ??
                    0
                );


            if (
                Number.isFinite(amount)
            ) {

                revenue += amount;

            }

        }
    );


    revenueElement.textContent =
        `₹ ${revenue.toLocaleString("en-IN")}`;

}


/* =====================================================
   IS TODAY
===================================================== */

function isToday(
    dateValue
) {

    const date =
        new Date(
            dateValue
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return false;

    }


    const today =
        new Date();


    return (
        date.getFullYear()
        ===
        today.getFullYear()
        &&
        date.getMonth()
        ===
        today.getMonth()
        &&
        date.getDate()
        ===
        today.getDate()
    );

}


/* =====================================================
   CALCULATE HOURS
===================================================== */

function calculateHours(
    start,
    end
) {

    const startDate =
        new Date(start);

    const endDate =
        new Date(end);


    const difference =
        endDate.getTime() -
        startDate.getTime();


    if (
        !Number.isFinite(
            difference
        ) ||
        difference <= 0
    ) {

        return 0;

    }


    return Math.max(
        1,
        Math.round(
            difference /
            (
                1000 *
                60 *
                60
            )
        )
    );

}


/* =====================================================
   DISPLAY DATE
===================================================== */

function formatDisplayDate(
    value
) {

    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            value
        );

    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =====================================================
   NAVIGATION
===================================================== */

function showSection(
    sectionName,
    clickedButton
) {

    const sections = [

        "dashboard",
        "parking",
        "vehicles",
        "bookings",
        "payments",
        "history",
        "profile"

    ];


    sections.forEach(
        name => {

            const section =
                document.getElementById(
                    `${name}Section`
                );


            if (section) {

                section.classList.toggle(
                    "hidden-section",
                    name !== sectionName
                );

            }

        }
    );


    document
        .querySelectorAll(
            ".menu-item"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "active"
                );

            }
        );


    if (clickedButton) {

        clickedButton.classList.add(
            "active"
        );

    }


    const titles = {

        dashboard:
            "Dashboard",

        parking:
            "Parking Slots",

        vehicles:
            "Vehicles",

        bookings:
            "Bookings",

        payments:
            "Payments",

        history:
            "History",

        profile:
            "Profile"

    };


    setText(
        "pageTitle",
        titles[sectionName] ||
        "Dashboard"
    );


    if (
        sectionName ===
        "parking"
    ) {

        renderSlots(
            getFilteredSlots()
        );

    }


    if (
        sectionName ===
        "bookings"
    ) {

        loadBookings();

    }


    if (
        sectionName ===
        "history"
    ) {

        loadBookings();

    }

}


/* =====================================================
   SHOW SECTION BY NAME
===================================================== */

function showSectionByName(
    sectionName
) {

    const buttons =
        document.querySelectorAll(
            ".menu-item"
        );


    let targetButton =
        null;


    buttons.forEach(
        button => {

            const text =
                button.textContent
                    .trim()
                    .toLowerCase();


            if (
                text.includes(
                    sectionName.toLowerCase()
                )
            ) {

                targetButton =
                    button;

            }

        }
    );


    showSection(
        sectionName,
        targetButton
    );

}


/* =====================================================
   SIDEBAR
===================================================== */

function toggleSidebar() {

    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    if (!sidebar) {
        return;
    }


    sidebar.classList.toggle(
        "collapsed"
    );


    /*
     * Desktop collapsed state.
     */

    if (
        sidebar.classList.contains(
            "collapsed"
        )
    ) {

        sidebar.style.width =
            "70px";

    } else {

        sidebar.style.width =
            "245px";

    }

}


/* =====================================================
   ADD VEHICLE
===================================================== */

function addVehicle() {

    const vehicleNumber =
        prompt(
            "Enter vehicle number:"
        );


    if (!vehicleNumber) {
        return;
    }


    const container =
        document.getElementById(
            "vehicleCards"
        );


    if (!container) {
        return;
    }


    /*
     * Frontend temporary vehicle card.
     *
     * Later connect to:
     * POST /api/vehicles
     */

    if (
        container.querySelector(
            ".empty-state"
        )
    ) {

        container.innerHTML = "";

    }


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "my-vehicle-card";


    card.innerHTML = `

        <div class="car-icon">

            <i class="fa-solid fa-car"></i>

        </div>

        <div>

            <h3>
                ${escapeHtml(
                    vehicleNumber
                )}
            </h3>

            <p>
                Car • Active
            </p>

        </div>

        <span class="vehicle-active">
            Active
        </span>

    `;


    container.appendChild(
        card
    );


    showToast(
        `Vehicle ${vehicleNumber} added`
    );

}


/* =====================================================
   PAYMENT
===================================================== */

function makePayment() {

    showToast(
        "Online payment integration coming soon"
    );

}


/* =====================================================
   TOAST
===================================================== */

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );

    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    if (
        !toast ||
        !toastMessage
    ) {

        return;

    }


    toastMessage.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
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


/* =====================================================
   GET VALUE
===================================================== */

function getValue(
    id
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {
        return "";
    }


    return element.value.trim();

}


/* =====================================================
   AUTO LOGIN CHECK
===================================================== */

window.addEventListener(
    "DOMContentLoaded",
    function () {

        const user =
            localStorage.getItem(
                "parkingUser"
            );


        /*
         * Auto-login enabled when user
         * has already logged in.
         */

        if (user) {

            const loginPage =
                document.getElementById(
                    "loginPage"
                );

            const dashboardPage =
                document.getElementById(
                    "dashboardPage"
                );


            if (loginPage) {

                loginPage.classList.add(
                    "hidden"
                );

            }


            if (dashboardPage) {

                dashboardPage.classList.remove(
                    "hidden"
                );

            }


            updateUserDetails(
                user
            );


            loadSlots();

            loadBookings();

            startRealTimeUpdates();

        }

    }
);