/* ============================================================
   AUTHENTICATION HELPER
   ============================================================ */

/* ============================================================
   LOGIN
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

            console.log("Login response:", data);

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

            /*
             * IMPORTANT
             * Support both:
             * id
             * userId
             */

            const normalizedUser = {

                id: user.id !== undefined &&
                    user.id !== null ?
                    Number(user.id) :
                    Number(user.userId),

                name: user.name || "User",

                email: user.email || "",

                role: user.role || "USER"

            };

            console.log(
                "Normalized logged-in user:",
                normalizedUser
            );

            /* Save user */

            localStorage.setItem(
                "loggedInUser",
                JSON.stringify(normalizedUser)
            );

            localStorage.setItem(
                "user",
                JSON.stringify(normalizedUser)
            );

            showLoginMessage(
                "Login successful! Redirecting...",
                true
            );

            setTimeout(function() {

                if (
                    normalizedUser.role &&
                    normalizedUser.role.toUpperCase() === "ADMIN"
                ) {

                    window.location.href =
                        "admin-dashboard.html";

                } else {

                    window.location.href =
                        "dashboard.html";

                }

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

            loginMessage.textContent = text;

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

    const userData =
        localStorage.getItem("loggedInUser");

    if (!userData) {

        return null;
    }

    try {

        const user =
            JSON.parse(userData);

        /*
         * Make sure user ID is always available
         * as currentUser.id
         */

        if (
            user.id === undefined ||
            user.id === null
        ) {

            if (
                user.userId !== undefined &&
                user.userId !== null
            ) {

                user.id =
                    Number(user.userId);

            }

        } else {

            user.id =
                Number(user.id);

        }

        console.log(
            "Current logged-in user:",
            user
        );

        return user;

    } catch (error) {

        console.error(
            "Invalid user data:",
            error
        );

        localStorage.removeItem(
            "loggedInUser"
        );

        localStorage.removeItem(
            "user"
        );

        return null;
    }
}


/* ============================================================
   LOGOUT
   ============================================================ */

function logout() {

    localStorage.removeItem(
        "loggedInUser"
    );

    localStorage.removeItem(
        "user"
    );

    window.location.href =
        "login.html";
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

    localStorage.setItem(
        "loggedInUser",
        JSON.stringify(adminUser)
    );

    localStorage.setItem(
        "user",
        JSON.stringify(adminUser)
    );

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
            "login.html";

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
            "login.html";

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