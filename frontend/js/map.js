// ============================================================
// SMART CAR PARKING
// AI SMART PARKING RECOMMENDATION + LIVE GPS
// ============================================================

let map = null;
let userMarker = null;
let accuracyCircle = null;

let watchId = null;
let tracking = false;
let firstGPSFix = false;

let parkingSlots = [];
let slotMarkers = {};

let currentLatitude = null;
let currentLongitude = null;

let recommendedSlot = null;


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", function() {

    loadUserDetails();

    setupButtons();

    updateButtons();

    updateTrackingLabel();

    loadGoogleMaps();

    loadParkingSlots();

    // Refresh parking data every 5 seconds
    setInterval(function() {
        loadParkingSlots();
    }, 5000);

});


// ============================================================
// USER DETAILS
// ============================================================

function loadUserDetails() {

    const userData =
        localStorage.getItem("loggedInUser") ||
        localStorage.getItem("user");

    if (!userData) {
        return;
    }

    try {

        const user = JSON.parse(userData);

        const nameElements =
            document.querySelectorAll(
                "#userName, .user-name"
            );

        const emailElements =
            document.querySelectorAll(
                "#userEmail, .user-email"
            );

        nameElements.forEach(function(element) {

            if (user.name) {
                element.textContent = user.name;
            }

        });

        emailElements.forEach(function(element) {

            if (user.email) {
                element.textContent = user.email;
            }

        });

    } catch (error) {

        console.error(
            "User data error:",
            error
        );

    }
}


// ============================================================
// BUTTONS
// ============================================================

function setupButtons() {

    const startButton =
        document.getElementById("startTracking");

    const stopButton =
        document.getElementById("stopTracking");

    if (startButton) {

        startButton.addEventListener(
            "click",
            startTracking
        );

    }

    if (stopButton) {

        stopButton.addEventListener(
            "click",
            stopTracking
        );

    }

}


// ============================================================
// GOOGLE MAPS
// ============================================================

function loadGoogleMaps() {

    const mapElement =
        document.getElementById("map");

    if (!mapElement) {
        return;
    }

    const apiKey =
        window.GOOGLE_MAPS_API_KEY;

    if (!apiKey ||
        apiKey === "YOUR_GOOGLE_MAPS_API_KEY" ||
        apiKey === "PASTE_YOUR_NEW_GOOGLE_MAPS_API_KEY_HERE"
    ) {

        showMapMessage(
            "Google Maps API key is missing."
        );

        console.error(
            "Google Maps API key is missing."
        );

        return;
    }


    // Google Maps already loaded
    if (
        window.google &&
        window.google.maps
    ) {

        initializeMap();

        return;
    }


    // Avoid duplicate Google Maps script
    const existingScript =
        document.querySelector(
            'script[data-smart-parking-google-maps="true"]'
        );

    if (existingScript) {
        return;
    }


    const script =
        document.createElement("script");

    script.src =
        "https://maps.googleapis.com/maps/api/js" +
        "?key=" +
        encodeURIComponent(apiKey) +
        "&callback=initSmartParkingMap";

    script.async = true;
    script.defer = true;

    script.dataset.smartParkingGoogleMaps =
        "true";


    script.onerror = function() {

        showMapMessage(
            "Unable to load Google Maps."
        );

        console.error(
            "Google Maps script failed."
        );

    };


    document.head.appendChild(script);

}


// ============================================================
// GOOGLE MAP CALLBACK
// ============================================================

window.initSmartParkingMap = function() {

    initializeMap();

};


// ============================================================
// INITIALIZE MAP
// ============================================================

function initializeMap() {

    const mapElement =
        document.getElementById("map");

    if (!mapElement) {
        return;
    }

    if (!window.google ||
        !window.google.maps
    ) {

        console.error(
            "Google Maps is not available."
        );

        return;
    }


    // Prevent duplicate map
    if (map) {
        return;
    }


    // Default location
    const defaultLocation = {
        lat: 9.9252,
        lng: 78.1198
    };


    map =
        new google.maps.Map(
            mapElement, {
                center: defaultLocation,

                zoom: 14,

                mapTypeControl: true,

                streetViewControl: false,

                fullscreenControl: true,

                zoomControl: true,

                gestureHandling: "greedy"
            }
        );


    hideMapMessage();


    console.log(
        "Google Maps initialized successfully"
    );


    // GPS already available
    if (
        currentLatitude !== null &&
        currentLongitude !== null
    ) {

        updateUserMarker(
            currentLatitude,
            currentLongitude,
            0
        );

    }


    renderSlotMarkers();

    updateAIRecommendation();

}


// ============================================================
// START GPS TRACKING
// ============================================================

function startTracking() {

    if (!navigator.geolocation) {

        updateGPSStatus(
            "GPS not supported",
            false
        );

        return;
    }


    if (tracking) {
        return;
    }


    tracking = true;

    firstGPSFix = false;


    updateButtons();

    updateTrackingLabel();

    updateTrackingUI(
        "GPS Tracking Active"
    );


    watchId =
        navigator.geolocation.watchPosition(

            handlePosition,

            handleGPSError,

            {
                enableHighAccuracy: true,

                timeout: 15000,

                maximumAge: 3000
            }

        );


    console.log(
        "GPS tracking started"
    );

}


// ============================================================
// STOP GPS TRACKING
// ============================================================

function stopTracking() {

    if (
        watchId !== null &&
        navigator.geolocation
    ) {

        navigator.geolocation.clearWatch(
            watchId
        );

    }


    watchId = null;

    tracking = false;


    updateButtons();

    updateTrackingLabel();

    updateTrackingUI(
        "GPS Tracking Stopped"
    );


    console.log(
        "GPS tracking stopped"
    );

}


// ============================================================
// GPS POSITION
// ============================================================

function handlePosition(position) {

    const latitude =
        position.coords.latitude;

    const longitude =
        position.coords.longitude;

    const accuracy =
        position.coords.accuracy;


    currentLatitude =
        latitude;

    currentLongitude =
        longitude;


    updateGPSDetails(
        latitude,
        longitude,
        accuracy
    );


    updateGPSStatus(
        "GPS Tracking Active",
        true
    );


    updateUserMarker(
        latitude,
        longitude,
        accuracy
    );


    // First GPS fix
    if (!firstGPSFix) {

        firstGPSFix = true;


        if (map) {

            map.setCenter({
                lat: latitude,
                lng: longitude
            });

            map.setZoom(16);

        }

    }


    // Update AI recommendation
    updateAIRecommendation();


    console.log(
        "GPS:",
        latitude,
        longitude,
        "Accuracy:",
        accuracy
    );

}


// ============================================================
// GPS ERROR
// ============================================================

function handleGPSError(error) {

    console.error(
        "GPS Error:",
        error
    );


    if (error.code === 1) {

        updateGPSStatus(
            "Location permission denied",
            false
        );

    } else if (error.code === 2) {

        updateGPSStatus(
            "Location unavailable",
            false
        );

    } else if (error.code === 3) {

        updateGPSStatus(
            "GPS timeout",
            false
        );

    } else {

        updateGPSStatus(
            "GPS error",
            false
        );

    }

}


// ============================================================
// USER MARKER
// ============================================================

function updateUserMarker(
    latitude,
    longitude,
    accuracy
) {

    if (!map) {
        return;
    }


    const position = {
        lat: latitude,
        lng: longitude
    };


    // Create user marker
    if (!userMarker) {

        userMarker =
            new google.maps.Marker({

                position: position,

                map: map,

                title: "Your Live Location",

                label: {
                    text: "YOU",
                    color: "white",
                    fontWeight: "bold"
                },

                animation: google.maps.Animation.DROP

            });

    } else {

        userMarker.setPosition(
            position
        );

    }


    // Accuracy circle
    if (!accuracyCircle) {

        accuracyCircle =
            new google.maps.Circle({

                map: map,

                center: position,

                radius: accuracy || 0,

                fillOpacity: 0.12,

                strokeOpacity: 0.45,

                strokeWeight: 2

            });

    } else {

        accuracyCircle.setCenter(
            position
        );

        accuracyCircle.setRadius(
            accuracy || 0
        );

    }


    // Follow user while tracking
    if (tracking) {

        map.panTo(position);

    }

}


// ============================================================
// CENTER ON USER
// ============================================================

function centerOnUser() {

    if (
        currentLatitude === null ||
        currentLongitude === null
    ) {

        showMapMessage(
            "Waiting for GPS location..."
        );

        return;
    }


    if (!map) {
        return;
    }


    map.panTo({

        lat: currentLatitude,

        lng: currentLongitude

    });


    map.setZoom(17);

}


// ============================================================
// CENTER ON LOCATION
// ============================================================

function centerOnLocation() {

    centerOnUser();

}


// ============================================================
// GPS DETAILS UI
// ============================================================

function updateGPSDetails(
    latitude,
    longitude,
    accuracy
) {

    const latitudeElement =
        document.getElementById(
            "latitude"
        );

    const longitudeElement =
        document.getElementById(
            "longitude"
        );

    const accuracyElement =
        document.getElementById(
            "accuracy"
        );

    const lastUpdateElement =
        document.getElementById(
            "lastUpdate"
        );


    if (latitudeElement) {

        latitudeElement.textContent =
            latitude.toFixed(6);

    }


    if (longitudeElement) {

        longitudeElement.textContent =
            longitude.toFixed(6);

    }


    if (accuracyElement) {

        accuracyElement.textContent =
            Math.round(accuracy) +
            " meters";

    }


    if (lastUpdateElement) {

        lastUpdateElement.textContent =
            new Date().toLocaleTimeString();

    }

}


// ============================================================
// GPS STATUS
// ============================================================

function updateGPSStatus(
    message,
    active
) {

    const statusElement =
        document.getElementById(
            "gpsStatus"
        );

    if (!statusElement) {
        return;
    }


    statusElement.textContent =
        message;


    if (active) {

        statusElement.style.color =
            "#15803d";

    } else {

        statusElement.style.color =
            "#dc2626";

    }

}


// ============================================================
// TRACKING UI
// ============================================================

function updateTrackingUI(message) {

    const statusElement =
        document.getElementById(
            "gpsStatus"
        );

    if (statusElement) {

        statusElement.textContent =
            message;

    }

}


// ============================================================
// BUTTON STATE
// ============================================================

function updateButtons() {

    const startButton =
        document.getElementById(
            "startTracking"
        );

    const stopButton =
        document.getElementById(
            "stopTracking"
        );


    if (startButton) {

        startButton.disabled =
            tracking;

    }


    if (stopButton) {

        stopButton.disabled = !tracking;

    }

}


// ============================================================
// TRACKING LABEL
// ============================================================

function updateTrackingLabel() {

    const label =
        document.getElementById(
            "trackingLabel"
        );


    if (!label) {
        return;
    }


    if (tracking) {

        label.textContent =
            "Tracking ON";

        label.style.color =
            "#16a34a";

    } else {

        label.textContent =
            "Tracking OFF";

        label.style.color =
            "#dc2626";

    }

}


// ============================================================
// LOAD PARKING SLOTS
// ============================================================

async function loadParkingSlots() {

    try {

        const response =
            await fetch(
                window.API_BASE +
                "/parking-slots"
            );


        if (!response.ok) {

            throw new Error(
                "Parking API HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        // Backend can return array
        if (Array.isArray(data)) {

            parkingSlots =
                data;

        }

        // PowerShell / wrapped response
        else if (
            data &&
            Array.isArray(data.value)
        ) {

            parkingSlots =
                data.value;

        } else {

            parkingSlots = [];

        }


        console.log(
            "Parking slots loaded:",
            parkingSlots.length
        );


        renderSlotList();

        renderSlotMarkers();

        updateAIRecommendation();


    } catch (error) {

        console.error(
            "Parking slot API error:",
            error
        );


        showMapMessage(
            "Unable to load parking slots."
        );

    }

}


// ============================================================
// GET SLOT LATITUDE
// ============================================================

function getLatitude(slot) {

    if (
        slot.latitude !== undefined &&
        slot.latitude !== null
    ) {

        return Number(
            slot.latitude
        );

    }


    if (
        slot.lat !== undefined &&
        slot.lat !== null
    ) {

        return Number(
            slot.lat
        );

    }


    if (
        slot.locationLatitude !==
        undefined &&
        slot.locationLatitude !== null
    ) {

        return Number(
            slot.locationLatitude
        );

    }


    return null;

}


// ============================================================
// GET SLOT LONGITUDE
// ============================================================

function getLongitude(slot) {

    if (
        slot.longitude !== undefined &&
        slot.longitude !== null
    ) {

        return Number(
            slot.longitude
        );

    }


    if (
        slot.lng !== undefined &&
        slot.lng !== null
    ) {

        return Number(
            slot.lng
        );

    }


    if (
        slot.locationLongitude !==
        undefined &&
        slot.locationLongitude !== null
    ) {

        return Number(
            slot.locationLongitude
        );

    }


    return null;

}


// ============================================================
// SLOT NAME
// ============================================================

function getSlotName(slot) {

    return (
        slot.slotNumber ||
        slot.slotName ||
        slot.name ||
        ("Slot " + slot.id)
    );

}


// ============================================================
// SLOT STATUS
// ============================================================

function getSlotStatus(slot) {

    return String(
        slot.status ||
        slot.slotStatus ||
        ""
    ).toUpperCase();

}


// ============================================================
// SLOT PRICE
// IMPORTANT: YOUR API USES pricePerHour
// ============================================================

function getSlotPrice(slot) {
    const rawPrice =
        slot.pricePerHour != null ? slot.pricePerHour :
        slot.price != null ? slot.price :
        slot.hourlyRate != null ? slot.hourlyRate :
        slot.rate != null ? slot.rate :
        0;

    const price = Number(rawPrice);

    return Number.isNaN(price) ? 0 : price;
}


// ============================================================
// USER VEHICLE TYPE
// ============================================================

async function getUserVehicleType() {

    const userData =
        localStorage.getItem("loggedInUser") ||
        localStorage.getItem("user");

    if (!userData) {
        return "";
    }

    try {

        const user = JSON.parse(userData);

        const userId = Number(user.id);

        if (!userId) {
            return "";
        }

        const response =
            await fetch(
                window.API_BASE + "/vehicles"
            );

        if (!response.ok) {
            throw new Error(
                "Vehicle API HTTP " +
                response.status
            );
        }

        const data =
            await response.json();

        const vehicles =
            Array.isArray(data) ?
            data :
            (
                data &&
                Array.isArray(data.value) ?
                data.value : []
            );

        const userVehicles =
            vehicles.filter(
                function(vehicle) {

                    return Number(
                        vehicle.userId
                    ) === userId;

                }
            );

        if (!userVehicles.length) {

            console.log(
                "No vehicle found for user:",
                userId
            );

            return "";

        }

        const vehicle =
            userVehicles[0];

        const vehicleType =
            getVehicleType(vehicle);

        console.log(
            "AI User Vehicle:",
            vehicle.vehicleNumber,
            vehicleType
        );

        return vehicleType;

    } catch (error) {

        console.error(
            "Vehicle API error:",
            error
        );

        return "";

    }

}


// ============================================================
// VEHICLE TYPE FROM VEHICLE OBJECT
// ============================================================

function getVehicleType(vehicle) {

    if (!vehicle) {
        return "";
    }


    return String(

        vehicle.vehicleType ||
        vehicle.type ||
        vehicle.vehicleCategory ||
        vehicle.vehicleClass ||
        ""

    ).toUpperCase();

}


// ============================================================
// NORMALIZE VEHICLE TYPE
// ============================================================

function normalizeVehicleType(type) {

    const value =
        String(type || "")
        .toUpperCase()
        .trim();


    if (!value) {
        return "";
    }


    if (
        value.includes("SUV") ||
        value.includes("LARGE")
    ) {

        return "SUV";

    }


    if (
        value.includes("ELECTRIC") ||
        value.includes("EV")
    ) {

        return "ELECTRIC";

    }


    if (
        value.includes("BIKE") ||
        value.includes("MOTORCYCLE") ||
        value.includes("TWO WHEELER")
    ) {

        return "BIKE";

    }


    if (
        value.includes("CAR") ||
        value.includes("MEDIUM") ||
        value.includes("SMALL")
    ) {

        return "CAR";

    }


    return value;

}


// ============================================================
// VEHICLE MATCH SCORE
// ============================================================

function getVehicleMatchScore(slot, vehicleType) {

    const slotType = String(
        slot.vehicleType ||
        slot.type ||
        slot.vehicleCategory ||
        slot.slotType ||
        ""
    ).toUpperCase().trim();

    const userType = String(
        vehicleType || ""
    ).toUpperCase().trim();

    console.log(
        "Vehicle Match Check:",
        "User =", userType,
        "Slot =", slotType
    );

    // No user vehicle information
    if (!userType) {
        return 50;
    }

    // Electric vehicle
    if (
        userType.includes("ELECTRIC") ||
        userType.includes("EV")
    ) {
        if (
            slotType.includes("ELECTRIC") ||
            slotType.includes("EV")
        ) {
            return 100;
        }

        return 40;
    }

    // SUV
    if (userType.includes("SUV")) {

        if (slotType.includes("SUV")) {
            return 100;
        }

        return 40;
    }

    // Normal Car
    if (
        userType.includes("CAR") &&
        !userType.includes("ELECTRIC")
    ) {

        if (
            slotType.includes("CAR") &&
            !slotType.includes("ELECTRIC")
        ) {
            return 100;
        }

        return 40;
    }

    return 40;
}


// ============================================================
// HAVERSINE DISTANCE
// ============================================================

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const earthRadius =
        6371;


    const dLat =
        toRadians(
            lat2 - lat1
        );


    const dLon =
        toRadians(
            lon2 - lon1
        );


    const a =

        Math.sin(dLat / 2) *
        Math.sin(dLat / 2)

    +

    Math.cos(
        toRadians(lat1)
    )

    *

    Math.cos(
        toRadians(lat2)
    )

    *

    Math.sin(dLon / 2) *
        Math.sin(dLon / 2);


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return earthRadius * c;

}


function toRadians(degrees) {

    return (
        degrees *
        Math.PI /
        180
    );

}


// ============================================================
// AI SCORE CALCULATION
//
// DISTANCE       = 40%
// PRICE          = 25%
// VEHICLE MATCH  = 35%
// AVAILABILITY   = REQUIRED
// ============================================================

function calculateAIScore(
    slot,
    distanceKm,
    vehicleType,
    minPrice,
    maxPrice,
    maxDistance
) {

    const status =
        getSlotStatus(slot);


    // Availability is mandatory
    if (
        status !== "AVAILABLE" &&
        status !== "FREE"
    ) {

        return -1;

    }


    // --------------------------------------------------------
    // DISTANCE SCORE - 40%
    // --------------------------------------------------------

    let distanceScore = 50;


    if (maxDistance > 0) {

        distanceScore =
            Math.max(
                0,
                100 -
                (
                    distanceKm /
                    maxDistance
                ) *
                100
            );

    }


    // --------------------------------------------------------
    // PRICE SCORE - 25%
    // --------------------------------------------------------

    const price =
        getSlotPrice(slot);


    let priceScore = 100;


    if (
        maxPrice >
        minPrice
    ) {

        priceScore =
            Math.max(
                0,
                100 -
                (
                    (price - minPrice) /
                    (maxPrice - minPrice)
                ) *
                100
            );

    }


    // --------------------------------------------------------
    // VEHICLE SCORE - 35%
    // --------------------------------------------------------

    const vehicleScore =
        getVehicleMatchScore(
            slot,
            vehicleType
        );


    // --------------------------------------------------------
    // FINAL SCORE
    // --------------------------------------------------------

    const finalScore =

        (
            distanceScore *
            0.40
        )

    +

    (
        priceScore *
        0.25
    )

    +

    (
        vehicleScore *
        0.35
    );


    return Math.round(
        finalScore
    );

}


// ============================================================
// AI SMART RECOMMENDATION
// ============================================================

async function updateAIRecommendation() {

    const recommendation =
        document.getElementById(
            "recommendation"
        );


    const recommendedElement =
        document.getElementById(
            "recommendedSlot"
        );


    if (!recommendation) {
        return;
    }


    if (!parkingSlots.length) {

        recommendation.innerHTML =
            "<strong>AI Recommendation</strong>" +
            "<br>No parking slots available.";

        recommendedSlot = null;

        return;
    }


    // --------------------------------------------------------
    // AVAILABLE SLOTS ONLY
    // --------------------------------------------------------

    const availableSlots =
        parkingSlots.filter(
            function(slot) {

                const status =
                    getSlotStatus(slot);


                return (
                    status === "AVAILABLE" ||
                    status === "FREE"
                );

            }
        );


    if (!availableSlots.length) {

        recommendation.innerHTML =
            "<strong>AI Recommendation</strong>" +
            "<br>No available parking slots.";

        recommendedSlot = null;

        return;
    }


    // --------------------------------------------------------
    // USER VEHICLE TYPE
    // --------------------------------------------------------

    const vehicleType =
        getUserVehicleType();


    console.log(
        "User vehicle type:",
        vehicleType || "Not specified"
    );


    // --------------------------------------------------------
    // PRICE RANGE
    // --------------------------------------------------------

    const prices =
        availableSlots.map(
            function(slot) {

                return getSlotPrice(slot);

            }
        );


    const minPrice =
        Math.min.apply(
            null,
            prices
        );


    const maxPrice =
        Math.max.apply(
            null,
            prices
        );


    // --------------------------------------------------------
    // CALCULATE DISTANCES
    // --------------------------------------------------------

    const scoredSlots = [];

    let maxDistance = 0;

    let hasSlotCoordinates = false;


    availableSlots.forEach(
        function(slot) {

            const slotLat =
                getLatitude(slot);

            const slotLng =
                getLongitude(slot);


            let distanceKm = 0;


            if (
                currentLatitude !== null &&
                currentLongitude !== null &&
                slotLat !== null &&
                slotLng !== null &&
                !isNaN(slotLat) &&
                !isNaN(slotLng)
            ) {

                hasSlotCoordinates = true;


                distanceKm =
                    calculateDistance(

                        currentLatitude,

                        currentLongitude,

                        slotLat,

                        slotLng

                    );

            }


            if (
                distanceKm >
                maxDistance
            ) {

                maxDistance =
                    distanceKm;

            }


            scoredSlots.push({

                slot: slot,

                distanceKm: distanceKm

            });

        }
    );


    // --------------------------------------------------------
    // DISTANCE FALLBACK
    // --------------------------------------------------------

    if (!hasSlotCoordinates) {

        /*
         * Your current parking-slot API response
         * does NOT contain latitude/longitude.
         *
         * Therefore distance cannot be calculated
         * yet.
         *
         * We use a neutral distance score.
         */

        maxDistance = 1;

        console.log(
            "Parking slots have no GPS coordinates. " +
            "Distance score is neutral."
        );

    }


    // --------------------------------------------------------
    // FINAL AI SCORES
    // --------------------------------------------------------

    scoredSlots.forEach(
        function(item) {

            item.score =
                calculateAIScore(

                    item.slot,

                    item.distanceKm,

                    vehicleType,

                    minPrice,

                    maxPrice,

                    maxDistance

                );

        }
    );


    // --------------------------------------------------------
    // SORT BEST SLOT FIRST
    // --------------------------------------------------------

    scoredSlots.sort(
        function(a, b) {

            return b.score -
                a.score;

        }
    );


    // --------------------------------------------------------
    // SELECT BEST SLOT
    // --------------------------------------------------------

    const best =
        scoredSlots[0];


    if (!best) {

        recommendation.innerHTML =
            "<strong>AI Recommendation</strong>" +
            "<br>No suitable slot found.";

        recommendedSlot = null;

        return;
    }


    recommendedSlot =
        best.slot;


    const slotName =
        getSlotName(
            best.slot
        );


    const price =
        getSlotPrice(
            best.slot
        );


    const slotLat =
        getLatitude(
            best.slot
        );


    const slotLng =
        getLongitude(
            best.slot
        );


    // --------------------------------------------------------
    // DISTANCE TEXT
    // --------------------------------------------------------

    let distanceText =
        "Distance unavailable";


    if (
        currentLatitude !== null &&
        currentLongitude !== null &&
        slotLat !== null &&
        slotLng !== null &&
        !isNaN(slotLat) &&
        !isNaN(slotLng)
    ) {

        distanceText =
            best.distanceKm.toFixed(2) +
            " km away";

    }


    // --------------------------------------------------------
    // VEHICLE SCORE
    // --------------------------------------------------------

    const vehicleScore =
        getVehicleMatchScore(
            best.slot,
            vehicleType
        );


    // --------------------------------------------------------
    // AI CARD
    // --------------------------------------------------------

    recommendation.innerHTML =

        "<div style='" +
        "font-weight:800;" +
        "font-size:18px;" +
        "margin-bottom:10px;'>" +

        "AI Recommended Slot" +

        "</div>" +

        "<div style='" +
        "font-size:24px;" +
        "font-weight:900;" +
        "margin-bottom:8px;'>" +

        "⭐ " +
        escapeHTML(slotName) +

        "</div>" +

        "<div style='line-height:1.8;'>" +

        "🟢 <strong>AVAILABLE</strong><br>" +

        "📏 Distance: " +
        escapeHTML(distanceText) +
        "<br>" +

        "💰 Price: ₹" +
        price.toFixed(0) +
        "/hour<br>" +

        "🚗 Vehicle Match: " +
        vehicleScore +
        "%<br>" +

        "🧠 AI Score: " +
        best.score +
        "/100" +

        "</div>" +

        "<div style='" +
        "margin-top:12px;" +
        "padding:10px;" +
        "border-radius:10px;" +
        "background:rgba(37,99,235,.08);'>" +

        "🎯 Best balance of distance, " +
        "price, vehicle compatibility " +
        "and availability." +

        "</div>";


    // --------------------------------------------------------
    // RECOMMENDED SLOT ELEMENT
    // --------------------------------------------------------

    if (recommendedElement) {

        recommendedElement.textContent =
            slotName;

    }


    // --------------------------------------------------------
    // HIGHLIGHT BEST SLOT
    // --------------------------------------------------------

    highlightRecommendedSlot(
        best.slot
    );


    // --------------------------------------------------------
    // MOVE MAP TO BEST SLOT
    // --------------------------------------------------------

    if (
        map &&
        slotLat !== null &&
        slotLng !== null &&
        !isNaN(slotLat) &&
        !isNaN(slotLng)
    ) {

        if (!tracking) {

            map.panTo({

                lat: slotLat,

                lng: slotLng

            });

        }

    }


    console.log(
        "AI Recommended:",
        slotName,
        "Score:",
        best.score,
        "Distance:",
        best.distanceKm,
        "Price:",
        price,
        "Vehicle Match:",
        vehicleScore
    );

}


// ============================================================
// HIGHLIGHT RECOMMENDED SLOT
// ============================================================

function highlightRecommendedSlot(slot) {

    const rows =
        document.querySelectorAll(
            ".slot-row"
        );


    rows.forEach(
        function(row) {

            row.style.border = "";

            row.style.boxShadow = "";


            const rowId =
                row.getAttribute(
                    "data-slot-id"
                );


            if (
                String(rowId) ===
                String(slot.id)
            ) {

                row.style.border =
                    "2px solid #2563eb";

                row.style.boxShadow =
                    "0 0 0 4px rgba(37,99,235,.12)";

            }

        }
    );

}


// ============================================================
// RENDER SLOT LIST
// ============================================================

function renderSlotList() {

    const container = document.getElementById("slotList");

    if (!container) {
        console.error("slotList element not found in map.html");
        return;
    }

    if (!parkingSlots.length) {

        container.innerHTML =
            "<div>No parking slots found.</div>";

        return;
    }

    container.innerHTML = parkingSlots.map(function(slot) {

        const status = getSlotStatus(slot);

        const price = getSlotPrice(slot);

        const name = getSlotName(slot);

        const isRecommended =
            recommendedSlot &&
            String(recommendedSlot.id) ===
            String(slot.id);

        return (
            "<div class='slot-row " +
            (isRecommended ? "recommended-slot" : "") +
            "' data-slot-id='" +
            escapeHTML(String(slot.id)) +
            "' style='cursor:pointer;'>" +

            "<div>" +

            "<div class='slot-name'>" +
            (isRecommended ? "⭐ " : "") +
            escapeHTML(name) +
            "</div>" +

            "<div class='slot-price'>" +
            "₹" +
            price.toFixed(0) +
            "/hour" +
            "</div>" +

            "</div>" +

            "<div class='slot-status'>" +
            escapeHTML(status) +
            "</div>" +

            "</div>"
        );

    }).join("");


    // Make every parking slot clickable
    container.querySelectorAll(".slot-row").forEach(function(row) {

        row.addEventListener("click", function() {

            const slotId =
                row.getAttribute("data-slot-id");

            const selectedSlot =
                parkingSlots.find(function(slot) {

                    return String(slot.id) ===
                        String(slotId);

                });

            if (!selectedSlot) {

                console.error(
                    "Selected slot not found:",
                    slotId
                );

                return;
            }


            console.log(
                "Selected Parking Slot:",
                selectedSlot
            );


            // Remove previous selection
            container
                .querySelectorAll(".slot-row")
                .forEach(function(item) {

                    item.style.border = "";
                    item.style.boxShadow = "";

                });


            // Highlight selected slot
            row.style.border =
                "2px solid #16a34a";

            row.style.boxShadow =
                "0 0 0 4px rgba(22,163,74,0.15)";


            // Get slot GPS coordinates
            const latitude =
                Number(selectedSlot.latitude);

            const longitude =
                Number(selectedSlot.longitude);


            console.log(
                "Selected Slot Location:",
                latitude,
                longitude
            );


            // Move Google Map to selected parking slot
            if (
                map &&
                !Number.isNaN(latitude) &&
                !Number.isNaN(longitude)
            ) {

                map.panTo({
                    lat: latitude,
                    lng: longitude
                });

                map.setZoom(18);

            } else {

                console.warn(
                    "Google Map or slot GPS coordinates unavailable."
                );

            }

        });

    });

}


// ============================================================
// RENDER MAP MARKERS
// ============================================================

function renderSlotMarkers() {

    if (!map ||
        !window.google ||
        !window.google.maps
    ) {

        return;
    }


    // Remove old markers
    Object.keys(slotMarkers).forEach(
        function(id) {

            slotMarkers[id].setMap(
                null
            );

        }
    );


    slotMarkers = {};


    parkingSlots.forEach(
        function(slot) {

            const lat =
                getLatitude(slot);


            const lng =
                getLongitude(slot);


            // Do not create fake coordinates
            if (
                lat === null ||
                lng === null ||
                isNaN(lat) ||
                isNaN(lng)
            ) {

                return;
            }


            const status =
                getSlotStatus(slot);


            const isRecommended =
                recommendedSlot &&
                String(
                    recommendedSlot.id
                ) ===
                String(slot.id);


            const marker =
                new google.maps.Marker({

                    position: {
                        lat: lat,
                        lng: lng
                    },

                    map: map,

                    title: getSlotName(slot) +
                        " - " +
                        status,

                    label: {

                        text: isRecommended ?
                            "★" : getSlotName(
                                slot
                            ).substring(
                                0,
                                1
                            ),

                        color: "white",

                        fontWeight: "bold"

                    }

                });


            marker.addListener(
                "click",
                function() {

                    const info =
                        new google.maps.InfoWindow({

                            content:

                                "<div style='padding:8px;'>" +

                                "<strong>" +

                                escapeHTML(
                                    getSlotName(
                                        slot
                                    )
                                ) +

                                "</strong><br>" +

                                "Status: " +

                                escapeHTML(
                                    status
                                ) +

                                "<br>" +

                                "Price: ₹" +

                                getSlotPrice(
                                    slot
                                ) +

                                "/hour" +

                                (
                                    isRecommended

                                    ?
                                    "<br><br>" +
                                    "<strong>" +
                                    "⭐ AI Recommended" +
                                    "</strong>"

                                    :
                                    ""
                                ) +

                                "</div>"

                        });


                    info.open({

                        map: map,

                        anchor: marker

                    });

                }
            );


            slotMarkers[slot.id] =
                marker;

        }
    );

}


// ============================================================
// MAP MESSAGE
// ============================================================

function showMapMessage(message) {

    const element =
        document.getElementById(
            "mapMessage"
        );


    if (element) {

        element.textContent =
            message;

        element.style.display =
            "block";

    }

}


function hideMapMessage() {

    const element =
        document.getElementById(
            "mapMessage"
        );


    if (element) {

        element.style.display =
            "none";

    }

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    return String(value)

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


// ============================================================
// GLOBAL FUNCTIONS
// ============================================================

window.startTracking =
    startTracking;

window.stopTracking =
    stopTracking;

window.centerOnUser =
    centerOnUser;

window.centerOnLocation =
    centerOnLocation;

window.initSmartParkingMap =
    window.initSmartParkingMap;


// ============================================================
// CONSOLE
// ============================================================

console.log(
    "Smart Parking AI module loaded"
);

console.log(
    "Live GPS module loaded"
);

console.log(
    "Google Maps module loaded"
);

console.log(
    "AI weights: Distance 40% | Price 25% | Vehicle 35%"
);