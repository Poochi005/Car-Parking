/* ============================================================
   SMART CAR PARKING - APP SHELL
   ============================================================ */

function getUserSafe() {
    if (window.SmartParking && typeof window.SmartParking.getUserSafe === "function") {
        return window.SmartParking.getUserSafe();
    }

    try {
        const user =
            JSON.parse(localStorage.getItem("loggedInUser") || "null") ||
            JSON.parse(localStorage.getItem("user") || "null") ||
            JSON.parse(localStorage.getItem("scp_user") || "null");

        return user || {
            id: 10,
            name: "Test User",
            email: "test@example.com",
            role: "USER"
        };

    } catch (error) {
        return {
            id: 10,
            name: "Test User",
            email: "test@example.com",
            role: "USER"
        };
    }
}


const user = getUserSafe();


/* ============================================================
   LOGOUT
   ============================================================ */

function logout() {

    if (window.SmartParking && typeof window.SmartParking.clearUserSession === "function") {
        window.SmartParking.clearUserSession();
    } else {
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("user");
        localStorage.removeItem("scp_user");
    }

    window.location.href = "dashboard.html";
}


/* ============================================================
   NAVIGATION LINK
   ============================================================ */

function navLink(href, text) {

    const currentPage =
        window.location.pathname.split("/").pop();

    const active =
        currentPage === href ? "active" : "";

    return `
        <a href="${href}" class="${active}">
            ${text}
        </a>
    `;
}


/* ============================================================
   RENDER APPLICATION SHELL
   ============================================================ */

function renderShell() {

    const app = document.getElementById("app");

    if (!app) {
        console.error("App container not found.");
        return;
    }


    /*
     * IMPORTANT:
     * Save the existing page content BEFORE replacing #app.
     *
     * Example:
     *
     * <div id="app"></div>
     * <main class="page-content">Payments...</main>
     *
     * We move that <main> inside .main.
     */

    const pageContent =
        document.querySelector("main.page-content");


    const admin =
        user.role &&
        user.role.toUpperCase() === "ADMIN";


    /* ========================================================
       CREATE SHELL
       ======================================================== */

    app.innerHTML = `

        <div class="layout">

            <!-- SIDEBAR -->
            <aside class="sidebar">

                <div class="side-brand">

                    <div class="side-logo">
                        P🚗
                    </div>

                    Smart Car Parking

                </div>


                <nav class="nav">

                    ${navLink(
                        "dashboard.html",
                        "⌂ Dashboard"
                    )}

                    ${navLink(
                        "parking-slots.html",
                        "▦ Parking Slots"
                    )}

                    ${navLink(
                        "vehicles.html",
                        "🚗 Vehicles"
                    )}

                    ${navLink(
                        "bookings.html",
                        "▣ Bookings"
                    )}

                    ${navLink(
                        "payments.html",
                        "▤ Payments"
                    )}

                    ${navLink(
                        "history.html",
                        "◷ History"
                    )}

                    ${navLink(
                        "profile.html",
                        "♙ Profile"
                    )}

                    ${navLink(
                        "map.html",
                        "📍 Live Map"
                    )}

                    ${
                        admin
                            ? navLink(
                                "admin.html",
                                "⚙ Admin"
                            )
                            : ""
                    }

                    <a
                        href="#"
                        onclick="logout(); return false;"
                    >
                        ⇥ Logout
                    </a>

                </nav>


                <div class="side-bottom">

                    <div class="ai-status">

                        <b>AI Status</b>

                        <span
                            class="badge"
                            style="float:right"
                        >
                            Active
                        </span>

                        <p class="muted">
                            Live recommendation and GPS
                            tracking ready.
                        </p>

                        ◎

                    </div>

                </div>

            </aside>


            <!-- TOP BAR -->
            <header class="topbar">

                <b>
                    Smart Parking
                </b>


                <div class="top-user">

                    <span>
                        🔔
                    </span>


                    <div class="avatar">
                        ${(user.name || "U")
                            .slice(0, 2)
                            .toUpperCase()}
                    </div>


                    <div>

                        <b>
                            ${user.name || "User"}
                        </b>

                        <small
                            style="
                                display:block;
                                color:#7b8493;
                            "
                        >
                            ${user.role || "USER"}
                        </small>

                    </div>

                </div>

            </header>


            <!-- MAIN -->
            <div class="main">

            </div>

        </div>
    `;


    /* ========================================================
       MOVE PAGE CONTENT INTO .main
       ======================================================== */

    const mainContainer =
        app.querySelector(".main");


    if (pageContent && mainContainer) {

        mainContainer.appendChild(pageContent);

    }
}


/* ============================================================
   START APPLICATION
   ============================================================ */

renderShell();