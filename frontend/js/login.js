const API_BASE = "http://localhost:8081/api";

document.addEventListener("DOMContentLoaded", function() {

    const loginForm = document.getElementById("loginForm");
    const loginMessage = document.getElementById("loginMessage");

    if (!loginForm) {
        console.error("loginForm not found");
        return;
    }

    loginForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        if (!email || !password) {
            showMessage("Please enter email and password.", false);
            return;
        }

        try {

            showMessage("Logging in...", true);

            const response = await fetch(
                API_BASE + "/auth/login", {
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

            console.log("Login Response:", data);

            if (response.ok) {

                const user = data.user;

                if (!user) {
                    showMessage(
                        "Login successful, but user information is missing.",
                        false
                    );
                    return;
                }

                localStorage.setItem(
                    "loggedInUser",
                    JSON.stringify(user)
                );

                localStorage.setItem(
                    "user",
                    JSON.stringify(user)
                );

                showMessage(
                    "Login successful! Redirecting...",
                    true
                );

                setTimeout(function() {

                    if (
                        user.role &&
                        user.role.toUpperCase() === "ADMIN"
                    ) {
                        window.location.href =
                            "admin-dashboard.html";
                    } else {
                        window.location.href =
                            "dashboard.html";
                    }

                }, 1000);

            } else {

                showMessage(
                    data.message || "Invalid email or password.",
                    false
                );

                console.error("Login failed:", data);
            }

        } catch (error) {

            console.error("Login Error:", error);

            showMessage(
                "Cannot connect to backend. Please make sure Spring Boot is running on port 8081.",
                false
            );
        }
    });


    function showMessage(message, success) {

        if (loginMessage) {

            loginMessage.textContent = message;

            loginMessage.style.color =
                success ? "green" : "red";

        } else {

            alert(message);
        }
    }

});


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

    window.location.href = "admin-dashboard.html";
}