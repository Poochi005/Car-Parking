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
// Replace the value below with your REAL Google Maps API Key.
//
// Example:
// const GOOGLE_MAPS_API_KEY = "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXX";
//
// DO NOT leave it as:
// "YOUR_GOOGLE_MAPS_API_KEY"

const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";


// ============================================================
// API ENDPOINTS
// ============================================================

const API = {

    // Vehicle API
    vehicles: `${API_BASE}/vehicles`,

    // Parking Slot API
    parkingSlots: `${API_BASE}/parking-slots`,

    // Parking Booking API
    // NOTE:
    // Actual backend endpoint is /parking-bookings
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

    // Application name
    appName: "Smart Car Parking",

    // Backend server
    backendUrl: "http://localhost:8081",

    // Frontend server
    frontendUrl: "http://127.0.0.1:5500/frontend",

    // API base URL
    apiBase: API_BASE,

    // Parking data refresh interval
    // 5000 milliseconds = 5 seconds
    parkingRefreshInterval: 5000
};


// ============================================================
// API HELPER FUNCTION
// ============================================================

async function apiRequest(url, options = {}) {

    // Default request options
    const defaultOptions = {

        headers: {
            "Content-Type": "application/json"
        }
    };


    // Merge default + custom options
    const requestOptions = {

        ...defaultOptions,

        ...options,

        headers: {

            ...defaultOptions.headers,

            ...(options.headers || {})
        }
    };


    // Send request
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


    // JSON response
    if (
        contentType &&
        contentType.includes("application/json")
    ) {

        return await response.json();
    }


    // Text response
    return await response.text();
}


// ============================================================
// EXPORT GLOBAL CONFIGURATION
// ============================================================

// Backend API
window.API_BASE = API_BASE;


// Google Maps API key
window.GOOGLE_MAPS_API_KEY = GOOGLE_MAPS_API_KEY;


// API endpoints
window.API = API;


// Application configuration
window.APP_CONFIG = APP_CONFIG;


// API helper
window.apiRequest = apiRequest;


// ============================================================
// DEBUG INFORMATION
// ============================================================

console.log("========================================");
console.log("Smart Car Parking Configuration Loaded");
console.log("========================================");

console.log("Backend:", API_BASE);
console.log("Frontend:", APP_CONFIG.frontendUrl);
console.log("Parking API:", API.parkingSlots);
console.log("Booking API:", API.bookings);
console.log("Payment API:", API.payments);
console.log("Product API:", API.products);
console.log("Cart API:", API.cart);
console.log("Order API:", API.orders);

if (
    GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY"
) {

    console.warn(
        "⚠️ Google Maps API key is not configured."
    );

} else {

    console.log(
        "✅ Google Maps API key detected."
    );
}

console.log("========================================");