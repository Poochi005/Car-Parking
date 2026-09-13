/* ============================================================
   SMART CAR PARKING
   LIVE GPS + GOOGLE MAPS + AI PARKING RECOMMENDATION
   ============================================================ */

let map = null;

let userMarker = null;

let accuracyCircle = null;

let watchId = null;

let tracking = false;

let firstGPSFix = true;

let parkingSlots = [];

let slotMarkers = [];

let currentLatitude = null;

let currentLongitude = null;


/* ============================================================
   PAGE LOAD
   ============================================================ */

document.addEventListener("DOMContentLoaded", function() {

    loadUserDetails();

    setupButtons();

    updateButtons();

    updateTrackingLabel();

    loadGoogleMaps();

    loadParkingSlots();

});


/* ============================================================
   USER DETAILS
   ============================================================ */

function loadUserDetails() {

    const userData =
        localStorage.getItem("loggedInUser");

    if (!userData) {
        return;
    }

    try {

        const user =
            JSON.parse(userData);

        const userName =
            document.getElementById("userName");

        const userEmail =
            document.getElementById("userEmail");

        const userAvatar =
            document.getElementById("userAvatar");


        if (userName) {

            userName.textContent =
                user.name || "User";

        }


        if (userEmail) {

            userEmail.textContent =
                user.email || "";

        }


        if (userAvatar) {

            const firstLetter =
                (user.name || "U")
                .charAt(0)
                .toUpperCase();

            userAvatar.textContent =
                firstLetter;

        }

    } catch (error) {

        console.error(
            "User data error:",
            error
        );

    }

}


/* ============================================================
   BUTTON SETUP
   ============================================================ */

function setupButtons() {

    const startButton =
        document.getElementById(
            "startTracking"
        );

    const stopButton =
        document.getElementById(
            "stopTracking"
        );

    const centerButton =
        document.querySelector(
            ".locate-btn"
        );


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


    if (centerButton) {

        centerButton.addEventListener(
            "click",
            centerOnUser
        );

    }

}


/* ============================================================
   GOOGLE MAPS LOADER
   ============================================================ */

function loadGoogleMaps() {

    /*
     * Google Maps already loaded
     */

    if (
        typeof google !== "undefined" &&
        google.maps
    ) {

        initializeMap();

        return;

    }


    const apiKey =
        window.GOOGLE_MAPS_API_KEY;


    /*
     * API key missing
     */

    if (!apiKey ||
        apiKey ===
        "YOUR_GOOGLE_MAPS_API_KEY"
    ) {

        console.error(
            "Google Maps API key is missing."
        );

        showMapMessage(
            "Google Maps API key is not configured."
        );

        return;

    }


    /*
     * Prevent duplicate script loading
     */

    if (
        document.getElementById(
            "googleMapsScript"
        )
    ) {

        return;

    }


    window.initSmartParkingMap =
        initializeMap;


    const script =
        document.createElement("script");


    script.id =
        "googleMapsScript";


    script.src =
        "https://maps.googleapis.com/maps/api/js?key=" +
        encodeURIComponent(apiKey) +
        "&callback=initSmartParkingMap";


    script.async = true;

    script.defer = true;


    script.onerror =
        function() {

            console.error(
                "Google Maps failed to load."
            );

            showMapMessage(
                "Google Maps could not be loaded. Check your API key."
            );

        };


    document.head.appendChild(
        script
    );

}


/* ============================================================
   INITIALIZE GOOGLE MAP
   ============================================================ */

function initializeMap() {

    const mapElement =
        document.getElementById(
            "map"
        );


    if (!mapElement) {

        console.error(
            "Map element not found."
        );

        return;

    }


    /*
     * Default map location.
     *
     * This is ONLY the initial map center.
     * It is NOT the user's GPS location.
     */

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

                zoomControl: true

            }
        );


    console.log(
        "Google Maps initialized successfully."
    );


    updateGPSStatus(
        "Ready - Click Start Tracking"
    );


    renderSlotMarkers();

}


/* ============================================================
   START REAL-TIME GPS TRACKING
   ============================================================ */

function startTracking() {

    /*
     * Browser GPS support
     */

    if (!navigator.geolocation) {

        tracking = false;

        updateGPSStatus(
            "GPS is not supported by this browser."
        );

        updateTrackingUI();

        return;

    }


    /*
     * Prevent duplicate tracking
     */

    if (tracking) {

        updateGPSStatus(
            "GPS tracking is already running."
        );

        return;

    }


    tracking = true;

    firstGPSFix = true;


    updateGPSStatus(
        "Requesting GPS permission..."
    );


    updateTrackingUI();


    /*
     * REAL-TIME GPS
     */

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

}


/* ============================================================
   STOP REAL-TIME GPS TRACKING
   ============================================================ */

function stopTracking() {

    if (
        watchId !== null
    ) {

        navigator.geolocation.clearWatch(
            watchId
        );

        watchId = null;

    }


    tracking = false;


    updateGPSStatus(
        "GPS Tracking Stopped"
    );


    updateTrackingUI();

}


/* ============================================================
   GPS POSITION RECEIVED
   ============================================================ */

function handlePosition(
    position
) {

    currentLatitude =
        position.coords.latitude;


    currentLongitude =
        position.coords.longitude;


    const accuracy =
        position.coords.accuracy;


    console.log(
        "LIVE GPS LOCATION:",
        currentLatitude,
        currentLongitude,
        "Accuracy:",
        accuracy,
        "meters"
    );


    /*
     * Update latitude / longitude UI
     */

    updateGPSDetails(
        currentLatitude,
        currentLongitude,
        accuracy
    );


    /*
     * Update Google Maps marker
     */

    updateUserMarker(
        currentLatitude,
        currentLongitude,
        accuracy
    );


    /*
     * GPS active status
     */

    updateGPSStatus(
        "GPS Tracking Active"
    );


    /*
     * Update AI recommendation
     */

    updateAIRecommendation();


    /*
     * First GPS fix:
     * center map once.
     */

    if (
        firstGPSFix &&
        map
    ) {

        map.setCenter({

            lat: currentLatitude,

            lng: currentLongitude

        });


        map.setZoom(17);


        firstGPSFix = false;

    }

}


/* ============================================================
   GPS ERROR
   ============================================================ */

function handleGPSError(
    error
) {

    console.error(
        "GPS Error:",
        error
    );


    let message =
        "Unable to get GPS location.";


    if (
        error.code === 1
    ) {

        message =
            "Location permission denied.";

        tracking = false;

    } else if (
        error.code === 2
    ) {

        message =
            "GPS location unavailable.";

    } else if (
        error.code === 3
    ) {

        message =
            "GPS request timed out.";

    }


    updateGPSStatus(
        message
    );


    updateTrackingUI();

}


/* ============================================================
   UPDATE USER MARKER
   ============================================================ */

function updateUserMarker(
    latitude,
    longitude,
    accuracy
) {

    if (!map ||
        typeof google === "undefined"
    ) {

        return;

    }


    const location = {

        lat: latitude,

        lng: longitude

    };


    /*
     * Create marker first time
     */

    if (!userMarker) {

        userMarker =
            new google.maps.Marker({

                position: location,

                map: map,

                title: "Your Live Location",

                label: {

                    text: "YOU",

                    color: "#ffffff",

                    fontWeight: "bold"

                },

                animation: google.maps.Animation.DROP

            });

    }


    /*
     * Move existing marker
     */
    else {

        userMarker.setPosition(
            location
        );

    }


    /*
     * Accuracy circle
     */

    if (!accuracyCircle) {

        accuracyCircle =
            new google.maps.Circle({

                map: map,

                center: location,

                radius: accuracy,

                fillOpacity: 0.12,

                strokeOpacity: 0.5,

                strokeWeight: 2

            });

    } else {

        accuracyCircle.setCenter(
            location
        );

        accuracyCircle.setRadius(
            accuracy
        );

    }


    /*
     * During live tracking,
     * keep the map following user.
     */

    if (tracking) {

        map.panTo(
            location
        );

    }

}


/* ============================================================
   CENTER ON USER
   ============================================================ */

function centerOnLocation() {

    if (
        currentLatitude === null ||
        currentLongitude === null
    ) {

        updateGPSStatus(
            "Start GPS tracking first."
        );

        return;

    }


    if (!map) {

        updateGPSStatus(
            "Google Map is not ready."
        );

        return;

    }


    const location = {

        lat: currentLatitude,

        lng: currentLongitude

    };


    map.panTo(
        location
    );


    map.setZoom(
        17
    );

}


/* ============================================================
   HTML BUTTON COMPATIBILITY
   ============================================================ */

function centerOnUser() {

    centerOnLocation();

}


/* ============================================================
   GPS DATA UI
   ============================================================ */

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
            Math.round(
                accuracy
            ) +
            " meters";

    }


    if (lastUpdateElement) {

        lastUpdateElement.textContent =
            new Date()
            .toLocaleTimeString();

    }

}


/* ============================================================
   GPS STATUS
   ============================================================ */

function updateGPSStatus(
    message
) {

    const statusElement =
        document.getElementById(
            "gpsStatus"
        );

    const gpsDot =
        document.getElementById(
            "gpsDot"
        );


    if (statusElement) {

        statusElement.textContent =
            message;

    }


    if (gpsDot) {

        if (
            message
            .toLowerCase()
            .includes("active")
        ) {

            gpsDot.classList.add(
                "active"
            );

            gpsDot.classList.remove(
                "error"
            );

        } else if (
            message
            .toLowerCase()
            .includes("denied") ||
            message
            .toLowerCase()
            .includes("unavailable")
        ) {

            gpsDot.classList.remove(
                "active"
            );

            gpsDot.classList.add(
                "error"
            );

        } else {

            gpsDot.classList.remove(
                "active"
            );

        }

    }

}


/* ============================================================
   BUTTON UI
   ============================================================ */

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


/* ============================================================
   TRACKING LABEL
   ============================================================ */

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
            "#64748b";

    }

}


/* ============================================================
   COMPLETE TRACKING UI
   ============================================================ */

function updateTrackingUI() {

    updateButtons();

    updateTrackingLabel();

}


/* ============================================================
   PARKING SLOT API
   ============================================================ */

async function loadParkingSlots() {

    try {

        const apiBase =
            window.API_BASE;


        if (!apiBase) {

            throw new Error(
                "API_BASE is not available."
            );

        }


        const response =
            await fetch(
                apiBase +
                "/parking-slots"
            );


        if (!response.ok) {

            throw new Error(
                "Parking slot API failed: " +
                response.status
            );

        }


        const data =
            await response.json();


        if (
            Array.isArray(data)
        ) {

            parkingSlots =
                data;

        } else if (
            data &&
            Array.isArray(
                data.value
            )
        ) {

            parkingSlots =
                data.value;

        } else {

            parkingSlots = [];

        }


        console.log(
            "Parking Slots:",
            parkingSlots
        );


        renderSlotList();

        renderSlotMarkers();

        updateAIRecommendation();


    } catch (error) {

        console.error(
            "Parking Slot API Error:",
            error
        );


        showMapMessage(
            "Unable to load parking slots."
        );

    }

}


/* ============================================================
   RENDER SLOT LIST
   ============================================================ */

function renderSlotList() {

    const container =
        document.getElementById(
            "slotList"
        );


    if (!container) {
        return;
    }


    if (
        parkingSlots.length === 0
    ) {

        container.innerHTML =
            "<p>No parking slots found.</p>";

        return;

    }


    container.innerHTML =
        "";


    parkingSlots.forEach(
        function(slot) {

            const status =
                String(
                    slot.status ||
                    "UNKNOWN"
                ).toUpperCase();


            const slotNumber =
                slot.slotNumber ||
                slot.slotName ||
                slot.name ||
                ("Slot " + slot.id);


            const price =
                slot.pricePerHour ||
                slot.price ||
                0;


            const vehicleType =
                slot.vehicleType ||
                slot.type ||
                "Parking";


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "slot-row";


            row.innerHTML =

                "<div>" +

                "<div class='slot-name'>" +
                escapeHTML(
                    slotNumber
                ) +
                "</div>" +

                "<div class='slot-price'>" +
                escapeHTML(
                    vehicleType
                ) +
                " • ₹" +
                Number(price)
                .toFixed(0) +
                "</div>" +

                "</div>" +

                "<span class='slot-status " +
                getStatusClass(status) +
                "'>" +

                escapeHTML(status) +

                "</span>";


            container.appendChild(
                row
            );

        }
    );

}


/* ============================================================
   STATUS CLASS
   ============================================================ */

function getStatusClass(
    status
) {

    if (
        status === "AVAILABLE"
    ) {

        return "available";

    }


    if (
        status === "OCCUPIED"
    ) {

        return "occupied";

    }


    return "unknown";

}


/* ============================================================
   SLOT MAP MARKERS
   ============================================================ */

function renderSlotMarkers() {

    if (!map ||
        typeof google === "undefined"
    ) {

        return;

    }


    /*
     * Remove previous markers
     */

    slotMarkers.forEach(
        function(marker) {

            marker.setMap(
                null
            );

        }
    );


    slotMarkers = [];


    /*
     * Create markers only if
     * backend provides real coordinates.
     */

    parkingSlots.forEach(
        function(slot) {

            const latitude =
                getLatitude(slot);


            const longitude =
                getLongitude(slot);


            if (
                latitude === null ||
                longitude === null
            ) {

                return;

            }


            const status =
                String(
                    slot.status ||
                    "UNKNOWN"
                ).toUpperCase();


            const slotNumber =
                slot.slotNumber ||
                slot.slotName ||
                ("Slot " + slot.id);


            const marker =
                new google.maps.Marker({

                    position: {

                        lat: latitude,

                        lng: longitude

                    },

                    map: map,

                    title: slotNumber +
                        " - " +
                        status

                });


            const infoWindow =
                new google.maps.InfoWindow({

                    content:

                        "<strong>" +
                        escapeHTML(
                            slotNumber
                        ) +
                        "</strong><br>" +

                        "Status: " +
                        escapeHTML(
                            status
                        ) +

                        "<br>" +

                        "Price: ₹" +

                        Number(
                            slot.pricePerHour ||
                            slot.price ||
                            0
                        )
                        .toFixed(0)

                });


            marker.addListener(
                "click",
                function() {

                    infoWindow.open({

                        map: map,

                        anchor: marker

                    });

                }
            );


            slotMarkers.push(
                marker
            );

        }
    );

}


/* ============================================================
   GET SLOT LATITUDE
   ============================================================ */

function getLatitude(
    slot
) {

    const value =
        slot.latitude ||
        slot.lat ||
        slot.locationLatitude;


    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;

    }


    const number =
        Number(value);


    if (
        Number.isFinite(number)
    ) {

        return number;

    }


    return null;

}


/* ============================================================
   GET SLOT LONGITUDE
   ============================================================ */

function getLongitude(
    slot
) {

    const value =
        slot.longitude ||
        slot.lng ||
        slot.locationLongitude;


    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;

    }


    const number =
        Number(value);


    if (
        Number.isFinite(number)
    ) {

        return number;

    }


    return null;

}


/* ============================================================
   AI PARKING RECOMMENDATION
   ============================================================ */

function updateAIRecommendation() {

    const recommendation =
        document.getElementById(
            "recommendation"
        );


    const recommendedSlot =
        document.getElementById(
            "recommendedSlot"
        );


    if (!recommendation) {
        return;
    }


    /*
     * Find available slots
     */

    const availableSlots =
        parkingSlots.filter(
            function(slot) {

                return String(
                        slot.status ||
                        ""
                    ).toUpperCase() ===
                    "AVAILABLE";

            }
        );


    /*
     * No available slots
     */

    if (
        availableSlots.length === 0
    ) {

        recommendation.innerHTML =
            "<strong>" +
            "No available parking slot." +
            "</strong>";


        if (recommendedSlot) {

            recommendedSlot.style.display =
                "none";

        }


        return;

    }


    let bestSlot =
        null;

    let bestDistance =
        null;


    /*
     * If user GPS is available,
     * find nearest slot with
     * real coordinates.
     */

    if (
        currentLatitude !== null &&
        currentLongitude !== null
    ) {

        availableSlots.forEach(
            function(slot) {

                const lat =
                    getLatitude(slot);

                const lng =
                    getLongitude(slot);


                if (
                    lat === null ||
                    lng === null
                ) {

                    return;

                }


                const distance =
                    calculateDistance(
                        currentLatitude,
                        currentLongitude,
                        lat,
                        lng
                    );


                if (
                    bestDistance === null ||
                    distance < bestDistance
                ) {

                    bestDistance =
                        distance;

                    bestSlot =
                        slot;

                }

            }
        );

    }


    /*
     * If slot GPS coordinates
     * don't exist, choose cheapest.
     */

    if (!bestSlot) {

        availableSlots.sort(
            function(a, b) {

                const priceA =
                    Number(
                        a.pricePerHour || a.price || 999999
                    );


                const priceB =
                    Number(
                        b.pricePerHour ||
                        b.price ||
                        999999
                    );


                return priceA - priceB;

            }
        );


        bestSlot =
            availableSlots[0];

    }


    const slotNumber =
        bestSlot.slotNumber ||
        bestSlot.slotName ||
        bestSlot.name ||
        ("Slot " + bestSlot.id);


    const price =
        Number(
            bestSlot.pricePerHour ||
            bestSlot.price ||
            0
        );


    /*
     * Recommendation text
     */

    let reason =
        "Best available price";


    if (
        bestDistance !== null
    ) {

        reason =
            formatDistance(
                bestDistance
            ) +
            " from your location";

    }


    recommendation.innerHTML =

        "<div>" +

        "<h3 style='margin:0 0 8px 0;'>" +
        "🤖 AI Recommended Slot" +
        "</h3>" +

        "<strong style='font-size:20px;'>" +
        escapeHTML(
            slotNumber
        ) +
        "</strong>" +

        "<p style='margin:6px 0;'>" +

        "₹" +
        price.toFixed(0) +
        " / hour" +

        "</p>" +

        "<small>" +
        escapeHTML(
            reason
        ) +
        "</small>" +

        "</div>";


    /*
     * Recommended slot card
     */

    if (recommendedSlot) {

        recommendedSlot.style.display =
            "block";


        recommendedSlot.innerHTML =

            "<strong>" +
            escapeHTML(
                slotNumber
            ) +
            "</strong>" +

            "<span>" +

            "Available • ₹" +
            price.toFixed(0) +
            "/hour" +

            "</span>";

    }

}


/* ============================================================
   DISTANCE CALCULATION
   ============================================================ */

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

        Math.sin(
            dLat / 2
        ) *
        Math.sin(
            dLat / 2
        )

    +

    Math.cos(
        toRadians(lat1)
    )

    *

    Math.cos(
        toRadians(lat2)
    )

    *

    Math.sin(
        dLon / 2
    )

    *

    Math.sin(
        dLon / 2
    );


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return (
        earthRadius *
        c
    );

}


/* ============================================================
   DEGREES TO RADIANS
   ============================================================ */

function toRadians(
    value
) {

    return (
        value *
        Math.PI /
        180
    );

}


/* ============================================================
   DISTANCE FORMAT
   ============================================================ */

function formatDistance(
    distanceKm
) {

    if (
        distanceKm < 1
    ) {

        return (
            Math.round(
                distanceKm * 1000
            ) +
            " meters away"
        );

    }


    return (
        distanceKm.toFixed(2) +
        " km away"
    );

}


/* ============================================================
   MAP ERROR MESSAGE
   ============================================================ */

function showMapMessage(
    message
) {

    const element =
        document.getElementById(
            "mapMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.style.display =
        "block";

}


/* ============================================================
   HTML ESCAPE
   ============================================================ */

function escapeHTML(
    value
) {

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


/* ============================================================
   AUTO REFRESH PARKING SLOTS
   ============================================================ */

setInterval(
    function() {

        loadParkingSlots();

    },
    5000
);


/* ============================================================
   EXPOSE FUNCTIONS
   ============================================================ */

window.startTracking =
    startTracking;


window.stopTracking =
    stopTracking;


window.centerOnLocation =
    centerOnLocation;


window.centerOnUser =
    centerOnUser;