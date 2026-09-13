const API_BASE = "http://localhost:8081/api";

document.addEventListener("DOMContentLoaded", function() {

    const registerForm = document.getElementById("registerForm");
    const message = document.getElementById("registerMessage");

    if (!registerForm) {
        console.error("registerForm not found");
        return;
    }

    registerForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const nameElement = document.getElementById("name");
        const emailElement = document.getElementById("email");
        const phoneElement = document.getElementById("phone");
        const passwordElement = document.getElementById("password");
        const confirmPasswordElement =
            document.getElementById("confirmPassword");

        const name = nameElement ? nameElement.value.trim() : "";
        const email = emailElement ? emailElement.value.trim() : "";
        const phone = phoneElement ? phoneElement.value.trim() : "";
        const password = passwordElement ? passwordElement.value : "";
        const confirmPassword = confirmPasswordElement ?
            confirmPasswordElement.value :
            "";

        if (!name || !email || !phone || !password || !confirmPassword) {
            showMessage("Please fill all required fields.", false);
            return;
        }

        if (password.length < 6) {
            showMessage(
                "Password must be at least 6 characters.",
                false
            );
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Passwords do not match.", false);
            return;
        }

        try {

            showMessage("Creating account...", true);

            const response = await fetch(
                API_BASE + "/auth/register", {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        phone: phone,
                        password: password
                    })
                }
            );

            const data = await response.json();

            console.log("Registration response:", data);

            if (response.ok) {

                showMessage(
                    "Registration successful! Redirecting to login...",
                    true
                );

                registerForm.reset();

                setTimeout(function() {
                    window.location.href = "login.html";
                }, 1000);

            } else {

                showMessage(
                    data.message || "Registration failed.",
                    false
                );

                console.error(
                    "Registration failed:",
                    data
                );
            }

        } catch (error) {

            console.error("API Error:", error);

            showMessage(
                "Unable to connect to server. Make sure Spring Boot is running on port 8081.",
                false
            );
        }
    });


    function showMessage(text, success) {

        if (message) {

            message.textContent = text;

            if (success) {
                message.style.color = "green";
            } else {
                message.style.color = "red";
            }

        } else {

            alert(text);
        }
    }

});