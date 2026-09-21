/* ============================================================
   AUTHENTICATION HELPER
   ============================================================ */


/* ============================================================
   LOGIN - BACKEND LOGIN
   ============================================================ */

document.addEventListener("DOMContentLoaded", function() {

    const loginForm = document.getElementById("loginForm");
    const loginMessage = document.getElementById("loginMessage");

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const emailElement =
            document.getElementById("loginEmail");

        const passwordElement =
            document.getElementById("loginPassword");

        const email = emailElement ?
            emailElement.value.trim() :
            "";

        const password = passwordElement ?
            passwordElement.value :
            "";

        if (!email || !password) {

            showLoginMessage(
                "Please enter email and password.",
                false
            );

            return;
        }

        try {

            showLoginMessage(
                "Logging in...",
                true
            );

            const response = await fetch(
                window.API_BASE + "/auth/login", {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            console.log(
                "Login response:",
                data
            );

            if (!response.ok) {

                showLoginMessage(
                    data.message ||
                    "Invalid email or password.",
                    false
                );

                return;
            }

            const user = data.user;

            if (!user) {

                showLoginMessage(
                    "Login successful, but user data was not received.",
                    false
                );

                return;
            }

            const normalizedUser = window.SmartParking ?
                window.SmartParking.normalizeUser(user, null) :
                {
                    id: user.id !== undefined && user.id !== null ?
                        Number(user.id) :
                        (
                            user.userId !== undefined && user.userId !== null ?
                            Number(user.userId) :
                            null
                        ),
                    name: user.name || "User",
                    email: user.email || "",
                    role: (user.role || "USER").toUpperCase()
                };

            console.log(
                "Normalized logged-in user:",
                normalizedUser
            );

            if (window.SmartParking && typeof window.SmartParking.saveUser === "function") {
                window.SmartParking.saveUser(normalizedUser);
            } else {
                localStorage.setItem(
                    "loggedInUser",
                    JSON.stringify(normalizedUser)
                );

                localStorage.setItem(
                    "user",
                    JSON.stringify(normalizedUser)
                );
            }


            /* ====================================================
               SUCCESS
               ==================================================== */

            showLoginMessage(
                "Login successful! Redirecting...",
                true
            );


            setTimeout(function() {

                const redirectPage = window.SmartParking && typeof window.SmartParking.getDashboardRedirect === "function" ?
                    window.SmartParking.getDashboardRedirect(normalizedUser.role) :
                    (
                        normalizedUser.role &&
                        normalizedUser.role.toUpperCase() === "ADMIN" ?
                        "admin-dashboard.html" :
                        "dashboard.html"
                    );

                window.location.href = redirectPage;

            }, 800);


        } catch (error) {

            console.error(
                "Login API Error:",
                error
            );

            showLoginMessage(
                "Unable to connect to server. Make sure Spring Boot is running on port 8081.",
                false
            );

        }

    });


    /* ========================================================
       LOGIN MESSAGE
       ======================================================== */

    function showLoginMessage(text, success) {

        if (loginMessage) {

            loginMessage.textContent =
                text;

            loginMessage.style.color =
                success ?
                "green" :
                "red";

        } else {

            alert(text);

        }

    }

});


/* ============================================================
   GET CURRENT USER
   ============================================================ */

function getUser() {

    const currentUser = window.SmartParking && typeof window.SmartParking.getCurrentUser === "function" ?
        window.SmartParking.getCurrentUser() :
        (() => {
            let userData = localStorage.getItem("loggedInUser");

            if (!userData) {
                userData = localStorage.getItem("firebaseUser");
            }

            if (!userData) {
                userData = localStorage.getItem("user");
            }

            if (!userData) {
                console.log("No logged-in user found.");
                return null;
            }

            try {
                const user = JSON.parse(userData);
                return {
                    id: user.id !== undefined && user.id !== null ? Number(user.id) : null,
                    name: user.name || user.displayName || "User",
                    email: user.email || "",
                    role: (user.role || "USER").toUpperCase()
                };
            } catch (error) {
                console.error("Invalid user data:", error);
                localStorage.removeItem("loggedInUser");
                localStorage.removeItem("user");
                localStorage.removeItem("firebaseUser");
                return null;
            }
        })();

    console.log("Current logged-in user:", currentUser);
    return currentUser;
}


/* ============================================================
   LOGOUT
   ============================================================ */

function logout() {

    if (window.SmartParking && typeof window.SmartParking.clearUserSession === "function") {
        window.SmartParking.clearUserSession();
    } else {
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("user");
        localStorage.removeItem("firebaseUser");
    }

    /*
     * Login page is index.html
     */

    window.location.href =
        "index.html";

}


/* ============================================================
   ADMIN LOGIN
   ============================================================ */

function loginAsAdmin() {

    const adminUser = {

        id: 10,

        name: "Admin",

        email: "admin@example.com",

        role: "ADMIN"

    };

    if (window.SmartParking && typeof window.SmartParking.saveUser === "function") {
        window.SmartParking.saveUser(adminUser);
    } else {
        localStorage.setItem(
            "loggedInUser",
            JSON.stringify(adminUser)
        );

        localStorage.setItem(
            "user",
            JSON.stringify(adminUser)
        );
    }

    window.location.href =
        "admin-dashboard.html";

}


/* ============================================================
   REQUIRE LOGIN
   ============================================================ */

function requireLogin() {

    const user =
        getUser();


    if (!user) {

        window.location.href =
            "index.html";

        return null;
    }


    return user;

}


/* ============================================================
   REQUIRE ADMIN
   ============================================================ */

function requireAdmin() {

    const user =
        getUser();


    if (!user) {

        window.location.href =
            "index.html";

        return null;
    }


    if (!user.role ||
        user.role.toUpperCase() !== "ADMIN"
    ) {

        window.location.href =
            "dashboard.html";

        return null;
    }


    return user;

}