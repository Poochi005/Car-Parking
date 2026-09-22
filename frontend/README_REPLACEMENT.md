# Smart Car Parking Frontend – Premium UI Replacement

This package updates the frontend to use the same clean Smart Parking design shown in the Parking Slots reference:
- fixed dark-blue sidebar
- blue active navigation
- white top bar
- light grey page background
- rounded statistic cards and panels
- LIVE / ONLINE animated status dots
- responsive mobile layout
- existing API URLs and page IDs preserved

## Main replacements
- `css/theme.css` – shared premium design for all pages
- `js/app.js` – shared shell/navigation for pages using `#app`
- `js/parking-slots.js` – parking slot loading, stats, booking and live refresh; uses logged-in user ID with fallback 10
- `parking-slots.html` – clean reference-style parking page

## How to use
1. Stop Live Server.
2. Backup your current `frontend` folder.
3. Replace the contents of your current `frontend` folder with this package.
4. Start Live Server from the `frontend` folder.
5. Start Spring Boot on port `8081`.
6. Open `parking-slots.html` or `dashboard.html`.

## Backend is NOT changed
The frontend still expects the Spring Boot API at `https://car-parking-production-5662.up.railway.app`.
