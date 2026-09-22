const PARKING_API_BASE = "https://car-parking-production-5662.up.railway.app/api";

let parkingSlots = [];
let selectedSlot = null;


// ==========================================
// LOAD PARKING SLOTS
// ==========================================

async function loadParkingSlots() {

    const container = document.getElementById("slotContainer");
    const loading = document.getElementById("loading");

    try {

        const response = await fetch(
            `${PARKING_API_BASE}/parking-slots`
        );

        if (!response.ok) {
            throw new Error(
                "Failed to load parking slots"
            );
        }

        parkingSlots = await response.json();

        console.log(
            "Parking Slots:",
            parkingSlots
        );

        if (loading) {
            loading.style.display = "none";
        }

        if (!container) {
            return;
        }

        container.innerHTML = "";

        parkingSlots.forEach(function(slot) {

                    const card = document.createElement("div");

                    if (
                        String(slot.status).toUpperCase() ===
                        "AVAILABLE"
                    ) {
                        card.className =
                            "slot-card available";
                    } else {
                        card.className =
                            "slot-card occupied";
                    }

                    const isAvailable =
                        String(slot.status).toUpperCase() ===
                        "AVAILABLE";

                    card.innerHTML = `

                <h3>🅿️ ${slot.slotNumber}</h3>

                <p>
                    <strong>Floor:</strong>
                    ${slot.floor}
                </p>

                <p>
                    <strong>Section:</strong>
                    ${slot.section}
                </p>

                <p>
                    <strong>Type:</strong>
                    ${slot.vehicleType}
                </p>

                <p>
                    <strong>Size:</strong>
                    ${slot.slotSize}
                </p>

                <p>
                    <strong>Price:</strong>
                    ₹${slot.pricePerHour}/hour
                </p>

                <p class="status">
                    ${slot.status}
                </p>

                ${
                    isAvailable
                    ?
                    `
                    <button
                        type="button"
                        onclick="bookSlot(${slot.id})">
                        🚗 Book Slot
                    </button>
                    `
                    :
                    `
                    <button
                        type="button"
                        disabled>
                        🔴 Occupied
                    </button>
                    `
                }

            `;

            container.appendChild(card);

        });

    } catch (error) {

        console.error(
            "Parking Slot Error:",
            error
        );

        if (loading) {
            loading.innerText =
                "❌ Unable to connect to parking server.";
        }
    }
}


// ==========================================
// SELECT / BOOK SLOT
// ==========================================

async function bookSlot(slotId) {

    selectedSlot = parkingSlots.find(
        function (slot) {
            return Number(slot.id) === Number(slotId);
        }
    );

    if (!selectedSlot) {

        alert(
            "Parking slot not found."
        );

        return;
    }

    console.log(
        "Selected Slot:",
        selectedSlot
    );

    const bookingSection =
        document.getElementById(
            "bookingSection"
        );

    const selectedSlotInfo =
        document.getElementById(
            "selectedSlotInfo"
        );

    if (!bookingSection) {

        alert(
            "Booking section not found."
        );

        return;
    }

    if (selectedSlotInfo) {

        selectedSlotInfo.innerHTML = `

            <div class="selected-slot">

                <h3>
                    🅿️ Selected Slot:
                    ${selectedSlot.slotNumber}
                </h3>

                <p>
                    Floor:
                    ${selectedSlot.floor}
                </p>

                <p>
                    Section:
                    ${selectedSlot.section}
                </p>

                <p>
                    Type:
                    ${selectedSlot.vehicleType}
                </p>

                <p>
                    Size:
                    ${selectedSlot.slotSize}
                </p>

                <p>
                    Price:
                    ₹${selectedSlot.pricePerHour}/hour
                </p>

            </div>

        `;
    }

    bookingSection.style.display = "block";

    await loadUserVehicles();

    bookingSection.scrollIntoView({
        behavior: "smooth"
    });
}


// ==========================================
// LOAD USER VEHICLES
// ==========================================

async function loadUserVehicles() {

    const vehicleSelect =
        document.getElementById(
            "vehicleSelect"
        );

    if (!vehicleSelect) {
        return;
    }

    vehicleSelect.innerHTML = `
        <option value="">
            Loading vehicles...
        </option>
    `;

    try {

        const response = await fetch(
            `${PARKING_API_BASE}/vehicles`
        );

        if (!response.ok) {

            throw new Error(
                "Vehicle API error: " +
                response.status
            );
        }

        const allVehicles =
            await response.json();

        console.log(
            "All Vehicles:",
            allVehicles
        );

        // ======================================
        // CURRENT USER
        // Database User ID = 10
        // ======================================

        const currentUserId = 10;

        const myVehicles =
            allVehicles.filter(
                function (vehicle) {

                    return Number(
                        vehicle.userId
                    ) === currentUserId;

                }
            );

        console.log(
            "My Vehicles:",
            myVehicles
        );

        vehicleSelect.innerHTML = `
            <option value="">
                Select your vehicle
            </option>
        `;

        if (myVehicles.length === 0) {

            vehicleSelect.innerHTML = `
                <option value="">
                    No vehicles registered
                </option>
            `;

            return;
        }

        myVehicles.forEach(
            function (vehicle) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    vehicle.id;

                option.textContent =
                    vehicle.vehicleNumber +
                    " - " +
                    vehicle.vehicleModel;

                vehicleSelect.appendChild(
                    option
                );
            }
        );

    } catch (error) {

        console.error(
            "Vehicle loading error:",
            error
        );

        vehicleSelect.innerHTML = `
            <option value="">
                Unable to load vehicles
            </option>
        `;
    }
}


// ==========================================
// CANCEL BOOKING
// ==========================================

const cancelBooking =
    document.getElementById(
        "cancelBooking"
    );

if (cancelBooking) {

    cancelBooking.addEventListener(
        "click",
        function () {

            const bookingSection =
                document.getElementById(
                    "bookingSection"
                );

            if (bookingSection) {

                bookingSection.style.display =
                    "none";
            }

            selectedSlot = null;
        }
    );
}


// ==========================================
// BOOKING FORM
// ==========================================

const bookingForm =
    document.getElementById(
        "bookingForm"
    );

if (bookingForm) {

    bookingForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            // ==================================
            // CHECK SLOT
            // ==================================

            if (!selectedSlot) {

                alert(
                    "Please select a parking slot."
                );

                return;
            }

            // ==================================
            // GET FORM VALUES
            // ==================================

            const vehicleSelect =
                document.getElementById(
                    "vehicleSelect"
                );

            const bookingDateElement =
                document.getElementById(
                    "bookingDate"
                );

            const startTimeElement =
                document.getElementById(
                    "startTime"
                );

            const endTimeElement =
                document.getElementById(
                    "endTime"
                );

            const message =
                document.getElementById(
                    "bookingMessage"
                );

            const vehicleId =
                vehicleSelect
                    ? vehicleSelect.value
                    : "";

            const bookingDate =
                bookingDateElement
                    ? bookingDateElement.value
                    : "";

            const startTime =
                startTimeElement
                    ? startTimeElement.value
                    : "";

            const endTime =
                endTimeElement
                    ? endTimeElement.value
                    : "";

            // ==================================
            // VALIDATE FORM
            // ==================================

            if (
                !vehicleId ||
                !bookingDate ||
                !startTime ||
                !endTime
            ) {

                if (message) {

                    message.innerText =
                        "❌ Please fill all booking details.";

                    message.style.color =
                        "red";
                }

                return;
            }

            // ==================================
            // CALCULATE DURATION
            // ==================================

            const start =
                new Date(
                    `${bookingDate}T${startTime}`
                );

            const end =
                new Date(
                    `${bookingDate}T${endTime}`
                );

            const durationMilliseconds =
                end - start;

            const durationHours =
                durationMilliseconds /
                (1000 * 60 * 60);

            if (durationHours <= 0) {

                if (message) {

                    message.innerText =
                        "❌ End time must be after start time.";

                    message.style.color =
                        "red";
                }

                return;
            }

            // ==================================
            // CURRENT USER
            // ==================================

            const currentUserId = 10;

            console.log(
                "Booking User ID:",
                currentUserId
            );

            // ==================================
            // BOOKING DATA
            // ==================================

            const bookingData = {

                userId: currentUserId,

                vehicleId:
                    Number(vehicleId),

                slotId:
                    Number(selectedSlot.id),

                bookingDate:
                    bookingDate,

                durationHours:
                    durationHours
            };

            console.log(
                "Booking Data:",
                bookingData
            );

            // ==================================
            // SHOW LOADING
            // ==================================

            if (message) {

                message.innerText =
                    "⏳ Creating booking...";

                message.style.color =
                    "blue";
            }

            // ==================================
            // SEND BOOKING REQUEST
            // ==================================

            try {

                const response =
                    await fetch(
                        `${PARKING_API_BASE}/parking-bookings`,
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

                // ==================================
                // READ RESPONSE SAFELY
                // ==================================

                const text =
                    await response.text();

                let data;

                try {

                    data =
                        JSON.parse(text);

                } catch (parseError) {

                    data = text;
                }

                console.log(
                    "Booking Response:",
                    data
                );

                // ==================================
                // CHECK ERROR
                // ==================================

                if (!response.ok) {

                    const errorMessage =
                        typeof data === "string"
                            ? data
                            : data.message ||
                              "Booking failed";

                    throw new Error(
                        errorMessage
                    );
                }

                // ==================================
                // SUCCESS
                // ==================================

                if (message) {

                    message.innerText =
                        "✅ Parking slot booked successfully!";

                    message.style.color =
                        "green";
                }

                alert(
                    "✅ Booking successful!"
                );

                // ==================================
                // RESET FORM
                // ==================================

                bookingForm.reset();

                const bookingSection =
                    document.getElementById(
                        "bookingSection"
                    );

                if (bookingSection) {

                    bookingSection.style.display =
                        "none";
                }

                selectedSlot = null;

                // ==================================
                // RELOAD PARKING SLOTS
                // ==================================

                await loadParkingSlots();

            } catch (error) {

                console.error(
                    "Booking Error:",
                    error
                );

                if (message) {

                    message.innerText =
                        "❌ " + error.message;

                    message.style.color =
                        "red";
                }
            }
        }
    );
}


// ==========================================
// START APPLICATION
// ==========================================

loadParkingSlots();