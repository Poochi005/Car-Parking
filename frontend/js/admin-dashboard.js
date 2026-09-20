// ============================================================
// Smart Car Parking - Admin Dashboard
// ============================================================

document.addEventListener("DOMContentLoaded", function() {
    loadAdminDashboard();
});


// ============================================================
// LOAD DASHBOARD
// ============================================================

async function loadAdminDashboard() {

    loadAdminUser();

    try {

        await Promise.all([
            loadParkingStats(),
            loadVehicleStats(),
            loadBookingStats(),
            loadPaymentStats(),
            loadOrderStats()
        ]);

        const status =
            document.getElementById("backendStatus");

        if (status) {
            status.textContent = "Backend API connected";
        }

    } catch (error) {

        console.error("Admin Dashboard Error:", error);

        const status =
            document.getElementById("backendStatus");

        if (status) {
            status.textContent = "Backend connection failed";
        }
    }
}


// ============================================================
// ADMIN USER
// ============================================================

function loadAdminUser() {

    const username =
        localStorage.getItem("adminUser") ||
        sessionStorage.getItem("adminUser") ||
        "Administrator";

    const nameElement =
        document.getElementById("adminName");

    const avatarElement =
        document.getElementById("adminAvatar");

    if (nameElement) {
        nameElement.textContent = username;
    }

    if (avatarElement) {
        avatarElement.textContent =
            username.charAt(0).toUpperCase();
    }
}


// ============================================================
// API FETCH
// ============================================================

async function adminFetch(url) {

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            "HTTP " + response.status
        );
    }

    return await response.json();
}


// ============================================================
// PARKING STATS
// ============================================================

async function loadParkingStats() {

    try {

        const data =
            await adminFetch(API.parkingSlots);

        const slots =
            Array.isArray(data) ?
            data :
            (data.content || []);

        const total = slots.length;

        const available =
            slots.filter(slot =>
                String(slot.status || "")
                .toUpperCase() === "AVAILABLE"
            ).length;

        const occupied =
            slots.filter(slot =>
                String(slot.status || "")
                .toUpperCase() === "OCCUPIED"
            ).length;

        document.getElementById("totalSlots").textContent =
            total;

        document.getElementById("availableSlots").textContent =
            available;

        document.getElementById("occupiedSlots").textContent =
            occupied;

        renderParkingStatus(
            available,
            occupied
        );

    } catch (error) {

        console.error(
            "Parking API Error:",
            error
        );

        document.getElementById(
                "parkingStatus"
            ).innerHTML =
            '<div class="empty">Unable to load parking slots</div>';
    }
}


// ============================================================
// PARKING STATUS
// ============================================================

function renderParkingStatus(
    available,
    occupied
) {

    const container =
        document.getElementById("parkingStatus");

    if (!container) {
        return;
    }

    container.innerHTML = `

        <div class="status-card">

            <span class="dot green"></span>

            <strong>
                Available
            </strong>

            <span>
                ${available}
            </span>

        </div>

        <div class="status-card">

            <span class="dot red"></span>

            <strong>
                Occupied
            </strong>

            <span>
                ${occupied}
            </span>

        </div>

    `;
}


// ============================================================
// VEHICLE STATS
// ============================================================

async function loadVehicleStats() {

    try {

        const data =
            await adminFetch(API.vehicles);

        const vehicles =
            Array.isArray(data) ?
            data :
            (data.content || []);

        document.getElementById(
                "totalVehicles"
            ).textContent =
            vehicles.length;

    } catch (error) {

        console.error(
            "Vehicle API Error:",
            error
        );

        document.getElementById(
            "totalVehicles"
        ).textContent = "0";
    }
}


// ============================================================
// BOOKING STATS
// ============================================================

async function loadBookingStats() {

    try {

        const data =
            await adminFetch(API.bookings);

        const bookings =
            Array.isArray(data) ?
            data :
            (data.content || []);

        document.getElementById(
                "totalBookings"
            ).textContent =
            bookings.length;

        renderRecentBookings(bookings);

    } catch (error) {

        console.error(
            "Booking API Error:",
            error
        );

        document.getElementById(
            "totalBookings"
        ).textContent = "0";

        document.getElementById(
                "recentBookings"
            ).innerHTML =
            '<div class="empty">Unable to load bookings</div>';
    }
}


// ============================================================
// RECENT BOOKINGS
// ============================================================

function renderRecentBookings(bookings) {

    const container =
        document.getElementById("recentBookings");

    if (!container) {
        return;
    }

    if (!bookings.length) {

        container.innerHTML =
            '<div class="empty">No bookings found</div>';

        return;
    }

    const recent =
        bookings
        .slice(-5)
        .reverse();

    container.innerHTML =
        recent.map(booking => `

            <div class="booking-card">

                <div class="booking-info">

                    <h4>
                        Booking #${escapeHtml(
                            booking.id
                        )}
                    </h4>

                    <p>
                        Slot:
                        ${escapeHtml(
                            booking.slotId ||
                            booking.slot?.slotNumber ||
                            "-"
                        )}
                    </p>

                    <p>
                        Amount:
                        ₹${Number(
                            booking.amount || 0
                        ).toFixed(2)}
                    </p>

                </div>

                <span class="badge blue">

                    ${escapeHtml(
                        booking.status ||
                        "BOOKED"
                    )}

                </span>

            </div>

        `).join("");
}


// ============================================================
// PAYMENT STATS
// ============================================================

async function loadPaymentStats() {

    try {

        const data =
            await adminFetch(API.payments);

        const payments =
            Array.isArray(data) ?
            data :
            (data.content || []);

        document.getElementById(
                "totalPayments"
            ).textContent =
            payments.length;

        const revenue =
            payments.reduce(
                (sum, payment) => {

                    return sum +
                        Number(
                            payment.amount ||
                            payment.totalAmount ||
                            0
                        );
                },
                0
            );

        document.getElementById(
                "totalRevenue"
            ).textContent =
            formatCurrency(revenue);

    } catch (error) {

        console.error(
            "Payment API Error:",
            error
        );

        document.getElementById(
            "totalPayments"
        ).textContent = "0";

        document.getElementById(
                "totalRevenue"
            ).textContent =
            formatCurrency(0);
    }
}


// ============================================================
// ORDER STATS
// ============================================================

async function loadOrderStats() {

    try {

        const data =
            await adminFetch(API.orders);

        const orders =
            Array.isArray(data) ?
            data :
            (data.content || []);

        const orderElement =
            document.getElementById("totalOrders");

        if (orderElement) {
            orderElement.textContent =
                orders.length;
        }

    } catch (error) {

        console.error(
            "Order API Error:",
            error
        );

        const orderElement =
            document.getElementById("totalOrders");

        if (orderElement) {
            orderElement.textContent = "0";
        }
    }
}


// ============================================================
// NAVIGATION
// ============================================================

function goTo(page) {

    window.location.href = page;
}


// ============================================================
// SIDEBAR
// ============================================================

function toggleSidebar() {

    const sidebar =
        document.querySelector(".sidebar");

    if (sidebar) {

        sidebar.classList.toggle(
            "sidebar-open"
        );
    }
}


// ============================================================
// ADMIN LOGOUT
// ============================================================

function adminLogout() {

    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminLoggedIn");

    sessionStorage.removeItem("adminUser");
    sessionStorage.removeItem("adminLoggedIn");

    window.location.href = "admin.html";
}


// ============================================================
// CURRENCY
// ============================================================

function formatCurrency(amount) {

    return "₹" +
        Number(amount || 0).toFixed(2);
}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}