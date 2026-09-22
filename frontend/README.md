# Smart Car Parking Frontend

## Folder structure
- index.html
- dashboard.html
- parking-slots.html
- vehicles.html
- bookings.html
- payments.html
- history.html
- profile.html
- map.html
- admin.html
- logout.html
- css/style.css
- js/config.js
- js/auth.js
- js/app.js
- js/dashboard.js
- js/slots.js
- js/vehicles.js
- js/bookings.js
- js/history.js
- js/profile.js
- js/admin.js
- js/map.js

## Run
Use VS Code Live Server and open `index.html`.

Spring Boot expected at:
https://car-parking-production-5662.up.railway.app

Current connected endpoints:
- GET /api/parking-slots
- GET /api/vehicles
- POST /api/vehicles
- GET /api/vehicles/{id}
- PUT /api/vehicles/{id}
- DELETE /api/vehicles/{id}
- /api/bookings is prepared in the UI; adjust field names if your BookingController differs.

## Login demo
Admin:
admin@example.com
admin123

User demo:
john@example.com
123456

The auth demo is localStorage-based until your AuthController is connected.

## Google Maps
1. Open `js/config.js` and optionally set your key.
2. In `map.html`, replace `YOUR_GOOGLE_MAPS_API_KEY` with the same Google Maps JavaScript API key.
3. Enable Maps JavaScript API and Directions API in Google Cloud.
4. Browser GPS requires HTTPS or localhost and user permission.

## Real-time AI note
The included recommendation is a deterministic frontend baseline: available slot + lower price. True AI prediction/ANPR/occupancy detection needs a backend model/service and live sensor/camera data. Live GPS tracking is real browser geolocation; multi-user fleet tracking needs a backend/WebSocket layer.
