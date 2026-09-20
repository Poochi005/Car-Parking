// ============================================================
// Smart Car Parking - API Configuration
// ============================================================

// ============================================================
// SPRING BOOT BACKEND
// ============================================================

const API_BASE = "http://localhost:8081/api";


// ============================================================
// GOOGLE MAPS API KEY
// ============================================================

// IMPORTANT:
// Create a NEW Google Maps API key because the previous key
// was exposed in chat.
//
// Paste your NEW key between the quotes below.

const GOOGLE_MAPS_API_KEY =
    "AIzaSyDsWLQSD8fjGZ9rBtH1luFybtRiEoPBckY";


// ============================================================
// API ENDPOINTS
// ============================================================

const API = {

    // Vehicle API
    vehicles: `${API_BASE}/vehicles`,

    // Parking Slot API
    parkingSlots: `${API_BASE}/parking-slots`,

    // Parking Booking API
    bookings: `${API_BASE}/parking-bookings`,

    // Payment API
    payments: `${API_BASE}/payments`,

    // Product API
    products: `${API_BASE}/products`,

    // Cart API
    cart: `${API_BASE}/cart`,

    // Order API
    orders: `${API_BASE}/orders`,

    // User API
    users: `${API_BASE}/users`
};


// ============================================================
// APPLICATION SETTINGS
// ============================================================

const APP_CONFIG = {

    appName: "Smart Car Parking",

    backendUrl: "http://localhost:8081",

    frontendUrl: "http://127.0.0.1:5500/frontend",

    apiBase: API_BASE,

    // Refresh parking data every 5 seconds
    parkingRefreshInterval: 5000
};


// ============================================================
// API HELPER FUNCTION
// ============================================================

async function apiRequest(url, options = {}) {

    const defaultOptions = {

        headers: {
            "Content-Type": "application/json"
        }
    };


    const requestOptions = {

        ...defaultOptions,

        ...options,

        headers: {

            ...defaultOptions.headers,

            ...(options.headers || {})
        }
    };


    const response = await fetch(url, requestOptions);


    // ========================================================
    // ERROR HANDLING
    // ========================================================

    if (!response.ok) {

        let errorMessage = `HTTP ${response.status}`;

        try {

            const errorData = await response.json();

            if (errorData.message) {

                errorMessage = errorData.message;

            } else if (errorData.error) {

                errorMessage = errorData.error;
            }

        } catch (error) {

            // Ignore JSON parsing error
        }

        throw new Error(errorMessage);
    }


    // ========================================================
    // RESPONSE HANDLING
    // ========================================================

    const contentType = response.headers.get("content-type");


    if (
        contentType &&
        contentType.includes("application/json")
    ) {

        return await response.json();
    }


    return await response.text();
}


// ============================================================
// EXPORT GLOBAL CONFIGURATION
// ============================================================

window.API_BASE = API_BASE;

window.GOOGLE_MAPS_API_KEY = GOOGLE_MAPS_API_KEY;

window.API = API;

window.APP_CONFIG = APP_CONFIG;

window.apiRequest = apiRequest;


// ============================================================
// DEBUG INFORMATION
// ============================================================

console.log("========================================");
console.log("Smart Car Parking Configuration Loaded");
console.log("========================================");

console.log("Backend:", API_BASE);

console.log(
    "Frontend:",
    APP_CONFIG.frontendUrl
);

console.log(
    "Parking API:",
    API.parkingSlots
);

console.log(
    "Booking API:",
    API.bookings
);

console.log(
    "Payment API:",
    API.payments
);

console.log(
    "Product API:",
    API.products
);

console.log(
    "Cart API:",
    API.cart
);

console.log(
    "Order API:",
    API.orders
);


// ============================================================
// GOOGLE MAPS API KEY CHECK
// ============================================================

if (!GOOGLE_MAPS_API_KEY ||
    GOOGLE_MAPS_API_KEY ===
    "AIzaSyDsWLQSD8fjGZ9rBtH1luFybtRiEoPBckY"
) {

    console.error(
        "❌ Google Maps API key is missing."
    );

} else {

    console.log(
        "✅ Google Maps API key detected."
    );
}

console.log("========================================");