/* ============================================================
   PAYMENTS PAGE
   ============================================================ */

const CURRENT_USER_ID = 10;


/* ============================================================
   PAGE LOAD
   ============================================================ */

document.addEventListener("DOMContentLoaded", function() {

    setupPaymentForm();

    loadPayments();

});


/* ============================================================
   PAYMENT FORM
   ============================================================ */

function setupPaymentForm() {

    const paymentForm =
        document.getElementById("paymentForm");

    if (!paymentForm) {
        return;
    }


    paymentForm.addEventListener("submit", async function(event) {

        event.preventDefault();


        const bookingId =
            Number(
                document.getElementById("bookingId").value
            );

        const amount =
            Number(
                document.getElementById("amount").value
            );

        const paymentMethod =
            document.getElementById("paymentMethod").value;


        /* ----------------------------------------------------
           VALIDATION
           ---------------------------------------------------- */

        if (!bookingId) {

            showPaymentMessage(
                "Please enter Booking ID.",
                false
            );

            return;
        }


        if (!amount || amount <= 0) {

            showPaymentMessage(
                "Please enter a valid amount.",
                false
            );

            return;
        }


        if (!paymentMethod) {

            showPaymentMessage(
                "Please select a payment method.",
                false
            );

            return;
        }


        /* ----------------------------------------------------
           PAYMENT DATA
           ---------------------------------------------------- */

        const paymentData = {

            userId: CURRENT_USER_ID,

            bookingId: bookingId,

            amount: amount,

            paymentMethod: paymentMethod

        };


        console.log(
            "Payment Request:",
            paymentData
        );


        const payButton =
            document.getElementById("payButton");


        try {

            if (payButton) {

                payButton.disabled = true;

                payButton.textContent =
                    "Processing...";

            }


            showPaymentMessage(
                "Processing payment...",
                true
            );


            /* ------------------------------------------------
               POST PAYMENT
               ------------------------------------------------ */

            const response = await fetch(
                API.payments, {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(paymentData)
                }
            );


            const text =
                await response.text();


            let data;


            try {

                data = JSON.parse(text);

            } catch (error) {

                data = text;

            }


            console.log(
                "Payment Response:",
                data
            );


            /* ------------------------------------------------
               SUCCESS
               ------------------------------------------------ */

            if (response.ok) {

                showPaymentMessage(
                    "Payment successful! ✅",
                    true
                );


                if (
                    data &&
                    typeof data === "object"
                ) {

                    displayPaymentSuccess(data);

                }


                paymentForm.reset();


                await loadPayments();


            } else {

                let errorMessage =
                    "Payment failed.";


                if (
                    typeof data === "string" &&
                    data.trim() !== ""
                ) {

                    errorMessage = data;

                } else if (
                    data &&
                    data.message
                ) {

                    errorMessage =
                        data.message;

                }


                showPaymentMessage(
                    errorMessage,
                    false
                );

            }


        } catch (error) {

            console.error(
                "Payment API Error:",
                error
            );


            showPaymentMessage(
                "Unable to connect to payment server. Make sure Spring Boot is running on port 8081.",
                false
            );


        } finally {

            if (payButton) {

                payButton.disabled = false;

                payButton.textContent =
                    "Pay Now";

            }

        }

    });

}


/* ============================================================
   DISPLAY SUCCESS PAYMENT
   ============================================================ */

function displayPaymentSuccess(payment) {

    const successBox =
        document.getElementById(
            "paymentSuccess"
        );


    if (!successBox) {
        return;
    }


    const transactionId =
        document.getElementById(
            "transactionId"
        );


    const paymentStatus =
        document.getElementById(
            "paymentStatus"
        );


    const paidAmount =
        document.getElementById(
            "paidAmount"
        );


    if (transactionId) {

        transactionId.textContent =
            payment.transactionId || "N/A";

    }


    if (paymentStatus) {

        paymentStatus.textContent =
            payment.paymentStatus || "SUCCESS";

    }


    if (paidAmount) {

        paidAmount.textContent =
            payment.amount || "0";

    }


    successBox.style.display =
        "block";
}


/* ============================================================
   LOAD USER PAYMENTS
   ============================================================ */

async function loadPayments() {

    const loading =
        document.getElementById(
            "paymentLoading"
        );


    const container =
        document.getElementById(
            "paymentRecords"
        );


    if (!container) {
        return;
    }


    try {

        if (loading) {

            loading.style.display =
                "block";

        }


        const response =
            await fetch(
                API.payments +
                "/user/" +
                CURRENT_USER_ID
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const payments =
            await response.json();


        console.log(
            "Payment Records:",
            payments
        );


        renderPayments(payments);


    } catch (error) {

        console.error(
            "Load Payments Error:",
            error
        );


        container.innerHTML = `
            <div class="empty">
                Unable to load payment records.
            </div>
        `;


    } finally {

        if (loading) {

            loading.style.display =
                "none";

        }

    }

}


/* ============================================================
   RENDER PAYMENT RECORDS
   ============================================================ */

function renderPayments(payments) {

    const container =
        document.getElementById(
            "paymentRecords"
        );


    if (!container) {
        return;
    }


    if (!Array.isArray(payments) ||
        payments.length === 0
    ) {

        container.innerHTML = `
            <div class="empty">
                No payment records found.
            </div>
        `;

        return;
    }


    let html = "";


    payments.forEach(function(payment) {

        html += `

            <div
                class="payment-card"
                style="
                    border: 1px solid #ddd;
                    border-radius: 10px;
                    padding: 16px;
                    margin-top: 15px;
                "
            >

                <h3>
                    Payment #${escapeHtml(payment.id)}
                </h3>

                <p>
                    <strong>Booking ID:</strong>
                    ${escapeHtml(payment.bookingId)}
                </p>

                <p>
                    <strong>Amount:</strong>
                    ₹${escapeHtml(payment.amount)}
                </p>

                <p>
                    <strong>Payment Method:</strong>
                    ${escapeHtml(payment.paymentMethod)}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${escapeHtml(payment.paymentStatus)}
                </p>

                <p>
                    <strong>Transaction ID:</strong>
                    ${escapeHtml(payment.transactionId)}
                </p>

                <p>
                    <strong>Payment Date:</strong>
                    ${formatPaymentDate(
                        payment.paymentDate
                    )}
                </p>

            </div>

        `;

    });


    container.innerHTML =
        html;
}


/* ============================================================
   PAYMENT MESSAGE
   ============================================================ */

function showPaymentMessage(
    message,
    success
) {

    const messageElement =
        document.getElementById(
            "paymentMessage"
        );


    if (!messageElement) {

        alert(message);

        return;
    }


    messageElement.textContent =
        message;


    messageElement.style.color =
        success ?
        "green" :
        "red";
}


/* ============================================================
   FORMAT DATE
   ============================================================ */

function formatPaymentDate(dateValue) {

    if (!dateValue) {

        return "N/A";

    }


    try {

        return new Date(
            dateValue
        ).toLocaleString();

    } catch (error) {

        return dateValue;

    }

}


/* ============================================================
   HTML ESCAPE
   ============================================================ */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");
}