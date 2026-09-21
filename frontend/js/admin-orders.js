/* ============================================================
   ADMIN ORDERS MANAGEMENT
   Smart Car Parking + E-Commerce
   ============================================================ */

(function() {

    "use strict";

    /* ========================================================
       VARIABLES
       ======================================================== */

    let allOrders = [];
    let filteredOrders = [];


    /* ========================================================
       INITIAL LOAD
       ======================================================== */

    document.addEventListener("DOMContentLoaded", function() {

        console.log("Admin Orders JS loaded");

        const filterElement =
            document.getElementById("orderStatusFilter");

        const searchElement =
            document.getElementById("orderSearch");

        if (filterElement) {
            filterElement.addEventListener(
                "change",
                applyFilters
            );
        }

        if (searchElement) {
            searchElement.addEventListener(
                "input",
                applyFilters
            );
        }

        loadAdminOrders();

    });


    /* ========================================================
       LOAD ALL ORDERS
       ======================================================== */

    window.loadAdminOrders = async function() {

        const loading =
            document.getElementById("ordersLoading");

        const errorBox =
            document.getElementById("ordersError");

        const empty =
            document.getElementById("ordersEmpty");

        const list =
            document.getElementById("ordersList");

        if (loading) {
            loading.style.display = "block";
        }

        if (errorBox) {
            errorBox.style.display = "none";
            errorBox.textContent = "";
        }

        if (empty) {
            empty.style.display = "none";
        }

        if (list) {
            list.innerHTML = "";
        }

        try {

            const url = window.API.orders;

            console.log(
                "Loading admin orders:",
                url
            );

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            });

            const text = await response.text();

            console.log(
                "Orders API status:",
                response.status
            );

            if (!response.ok) {

                throw new Error(
                    "Orders API returned HTTP " +
                    response.status +
                    ": " +
                    text
                );

            }

            let data = [];

            try {

                data = text ?
                    JSON.parse(text) : [];

            } catch (jsonError) {

                throw new Error(
                    "Invalid JSON response from orders API."
                );

            }

            /*
             * Normal backend response:
             *
             * [
             *   {...},
             *   {...}
             * ]
             */

            if (Array.isArray(data)) {

                allOrders = data;

            } else if (
                data &&
                Array.isArray(data.value)
            ) {

                allOrders = data.value;

            } else {

                allOrders = [];

            }

            console.log(
                "Admin orders:",
                allOrders
            );

            updateStatistics();

            applyFilters();

        } catch (error) {

            console.error(
                "Admin Orders Error:",
                error
            );

            if (errorBox) {

                errorBox.style.display = "block";

                errorBox.textContent =
                    "Unable to load orders. " +
                    error.message;

            }

        } finally {

            if (loading) {
                loading.style.display = "none";
            }

        }

    };


    /* ========================================================
       FILTER ORDERS
       ======================================================== */

    function applyFilters() {

        const filterElement =
            document.getElementById(
                "orderStatusFilter"
            );

        const searchElement =
            document.getElementById(
                "orderSearch"
            );

        const selectedStatus =
            filterElement ?
            filterElement.value :
            "ALL";

        const searchText =
            searchElement ?
            searchElement.value
            .trim()
            .toLowerCase() :
            "";

        filteredOrders =
            allOrders.filter(function(order) {

                /* STATUS FILTER */

                const orderStatus =
                    String(
                        order.orderStatus || ""
                    ).toUpperCase();

                if (
                    selectedStatus !== "ALL" &&
                    orderStatus !== selectedStatus
                ) {

                    return false;

                }

                /* SEARCH FILTER */

                if (!searchText) {
                    return true;
                }

                const orderNumber =
                    String(
                        order.orderNumber || ""
                    ).toLowerCase();

                const customerName =
                    String(
                        order.customerName || ""
                    ).toLowerCase();

                const customerEmail =
                    String(
                        order.customerEmail || ""
                    ).toLowerCase();

                const customerPhone =
                    String(
                        order.customerPhone || ""
                    ).toLowerCase();

                return (
                    orderNumber.includes(searchText) ||
                    customerName.includes(searchText) ||
                    customerEmail.includes(searchText) ||
                    customerPhone.includes(searchText)
                );

            });

        /* NEWEST FIRST */

        filteredOrders.sort(
            function(a, b) {

                const dateA =
                    new Date(
                        a.createdAt || 0
                    ).getTime();

                const dateB =
                    new Date(
                        b.createdAt || 0
                    ).getTime();

                return dateB - dateA;

            }
        );

        renderOrders();

    }


    /* ========================================================
       STATISTICS
       ======================================================== */

    function updateStatistics() {

        const total =
            allOrders.length;

        const active =
            allOrders.filter(function(order) {

                const status =
                    String(
                        order.orderStatus || ""
                    ).toUpperCase();

                return (
                    status !== "DELIVERED" &&
                    status !== "CANCELLED"
                );

            }).length;

        const delivered =
            allOrders.filter(function(order) {

                return (
                    String(
                        order.orderStatus || ""
                    ).toUpperCase() ===
                    "DELIVERED"
                );

            }).length;

        const revenue =
            allOrders.reduce(
                function(sum, order) {

                    const status =
                        String(
                            order.orderStatus || ""
                        ).toUpperCase();

                    /*
                     * Cancelled orders
                     * are not counted.
                     */

                    if (status === "CANCELLED") {
                        return sum;
                    }

                    const amount =
                        Number(
                            order.totalAmount || 0
                        );

                    return sum + amount;

                },
                0
            );

        setText(
            "totalOrders",
            total
        );

        setText(
            "activeOrders",
            active
        );

        setText(
            "deliveredOrders",
            delivered
        );

        setText(
            "totalRevenue",
            formatCurrency(revenue)
        );

    }


    /* ========================================================
       RENDER ORDERS
       ======================================================== */

    function renderOrders() {

        const list =
            document.getElementById(
                "ordersList"
            );

        const empty =
            document.getElementById(
                "ordersEmpty"
            );

        const count =
            document.getElementById(
                "ordersCount"
            );

        if (!list) {
            return;
        }

        list.innerHTML = "";

        if (count) {

            count.textContent =
                filteredOrders.length +
                (
                    filteredOrders.length === 1 ?
                    " order" :
                    " orders"
                );

        }

        if (filteredOrders.length === 0) {

            if (empty) {
                empty.style.display = "block";
            }

            return;

        }

        if (empty) {
            empty.style.display = "none";
        }

        filteredOrders.forEach(
            function(order) {

                const card =
                    createOrderCard(order);

                list.appendChild(card);

            }
        );

    }


    /* ========================================================
       CREATE ORDER CARD
       ======================================================== */

    function createOrderCard(order) {

        const card =
            document.createElement("div");

        card.className =
            "order-card";

        const id =
            order.id;

        const orderNumber =
            order.orderNumber ||
            ("ORDER-" + id);

        const orderStatus =
            String(
                order.orderStatus ||
                "PLACED"
            ).toUpperCase();

        const paymentStatus =
            String(
                order.paymentStatus ||
                "PENDING"
            ).toUpperCase();

        const paymentMethod =
            order.paymentMethod ||
            "N/A";

        const customerName =
            order.customerName ||
            "N/A";

        const customerEmail =
            order.customerEmail ||
            "N/A";

        const customerPhone =
            order.customerPhone ||
            "N/A";

        const totalAmount =
            Number(
                order.totalAmount || 0
            );

        const address =
            order.deliveryAddress ||
            "N/A";

        const city =
            order.city ||
            "";

        const pincode =
            order.pincode ||
            "";

        const createdAt =
            formatDate(
                order.createdAt
            );

        const statusClass =
            "status-" +
            orderStatus;

        const paymentClass =
            getPaymentClass(
                paymentStatus
            );

        card.innerHTML = `

            <div class="order-top">

                <div>

                    <div class="order-number">
                        📦 ${escapeHTML(orderNumber)}
                    </div>

                    <div class="order-date">
                        ${escapeHTML(createdAt)}
                    </div>

                </div>

                <span
                    class="status-badge ${statusClass}"
                >
                    ${formatStatus(orderStatus)}
                </span>

            </div>


            <div class="order-grid">

                <div class="info-box">

                    <span class="info-label">
                        Customer
                    </span>

                    <span class="info-value">
                        ${escapeHTML(customerName)}
                    </span>

                </div>


                <div class="info-box">

                    <span class="info-label">
                        Email
                    </span>

                    <span class="info-value">
                        ${escapeHTML(customerEmail)}
                    </span>

                </div>


                <div class="info-box">

                    <span class="info-label">
                        Phone
                    </span>

                    <span class="info-value">
                        ${escapeHTML(customerPhone)}
                    </span>

                </div>


                <div class="info-box">

                    <span class="info-label">
                        User ID
                    </span>

                    <span class="info-value">
                        ${escapeHTML(
                            String(
                                order.userId || "N/A"
                            )
                        )}
                    </span>

                </div>


                <div class="info-box">

                    <span class="info-label">
                        Payment Method
                    </span>

                    <span class="info-value">
                        ${escapeHTML(
                            String(paymentMethod)
                        )}
                    </span>

                </div>


                <div class="info-box">

                    <span class="info-label">
                        Total Amount
                    </span>

                    <span class="order-total">
                        ${formatCurrency(totalAmount)}
                    </span>

                </div>

            </div>


            <div class="delivery-box">

                <span class="info-label">
                    Delivery Address
                </span>

                <div class="info-value">

                    ${escapeHTML(address)}

                    ${
                        city
                            ? ", " +
                              escapeHTML(city)
                            : ""
                    }

                    ${
                        pincode
                            ? " - " +
                              escapeHTML(
                                  String(pincode)
                              )
                            : ""
                    }

                </div>

            </div>


            <div class="order-grid">

                <div class="info-box">

                    <span class="info-label">
                        Payment Status
                    </span>

                    <span
                        class="info-value ${paymentClass}"
                    >
                        ${formatStatus(paymentStatus)}
                    </span>

                </div>


                <div class="info-box">

                    <span class="info-label">
                        Order ID
                    </span>

                    <span class="info-value">
                        #${escapeHTML(
                            String(id || "N/A")
                        )}
                    </span>

                </div>


                <div class="info-box">

                    <span class="info-label">
                        Updated
                    </span>

                    <span class="info-value">
                        ${escapeHTML(
                            formatDate(
                                order.updatedAt
                            )
                        )}
                    </span>

                </div>

            </div>


            <div class="order-controls">

                <label>
                    Order Status:
                </label>


                <select
                    id="status-${id}"
                    data-order-id="${id}"
                >

                    ${createStatusOptions(
                        orderStatus
                    )}

                </select>


                <button
                    class="update-btn"
                    onclick="updateOrderStatus(${id})"
                >
                    Update Status
                </button>


                <label>
                    Payment:
                </label>


                <select
                    id="payment-${id}"
                    data-order-id="${id}"
                >

                    ${createPaymentOptions(
                        paymentStatus
                    )}

                </select>


                <button
                    class="update-btn"
                    onclick="updatePaymentStatus(${id})"
                >
                    Update Payment
                </button>


                <div
                    id="message-${id}"
                    class="order-message"
                ></div>

            </div>

        `;

        return card;

    }


    /* ========================================================
       ORDER STATUS OPTIONS
       ======================================================== */

    function createStatusOptions(
        currentStatus
    ) {

        const statuses = [
            "PLACED",
            "CONFIRMED",
            "PREPARING",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "CANCELLED"
        ];

        return statuses.map(
            function(status) {

                return `
                    <option
                        value="${status}"
                        ${
                            status === currentStatus
                                ? "selected"
                                : ""
                        }
                    >
                        ${formatStatus(status)}
                    </option>
                `;

            }
        ).join("");

    }


    /* ========================================================
       PAYMENT STATUS OPTIONS
       ======================================================== */

    function createPaymentOptions(
        currentStatus
    ) {

        const statuses = [
            "PENDING",
            "SUCCESS",
            "FAILED"
        ];

        return statuses.map(
            function(status) {

                return `
                    <option
                        value="${status}"
                        ${
                            status === currentStatus
                                ? "selected"
                                : ""
                        }
                    >
                        ${formatStatus(status)}
                    </option>
                `;

            }
        ).join("");

    }


    /* ========================================================
       UPDATE ORDER STATUS
       BACKEND:
       PUT /api/orders/{id}/status?status=CONFIRMED
       ======================================================== */

    window.updateOrderStatus =
        async function(orderId) {

            const select =
                document.getElementById(
                    "status-" + orderId
                );

            const message =
                document.getElementById(
                    "message-" + orderId
                );

            if (!select) {
                return;
            }

            const newStatus =
                select.value;

            try {

                showMessage(
                    message,
                    "Updating order status...",
                    false
                );

                /*
                 * IMPORTANT:
                 *
                 * Backend uses:
                 *
                 * @RequestParam String status
                 *
                 * So status MUST be sent
                 * in URL query parameter.
                 */

                const url =
                    window.API.orders +
                    "/" +
                    orderId +
                    "/status?status=" +
                    encodeURIComponent(
                        newStatus
                    );

                console.log(
                    "Updating order status:",
                    url
                );

                const response =
                    await fetch(
                        url, {
                            method: "PUT",

                            headers: {
                                "Accept": "application/json"
                            }
                        }
                    );

                const text =
                    await response.text();

                console.log(
                    "Status update response:",
                    response.status,
                    text
                );

                if (!response.ok) {

                    throw new Error(
                        text ||
                        "Failed to update order status."
                    );

                }

                showMessage(
                    message,
                    "Order status updated successfully.",
                    true
                );

                /*
                 * Reload orders from backend
                 */

                await loadAdminOrders();

            } catch (error) {

                console.error(
                    "Order status update error:",
                    error
                );

                showMessage(
                    message,
                    "Update failed: " +
                    error.message,
                    false
                );

            }

        };


    /* ========================================================
       UPDATE PAYMENT STATUS
       BACKEND:
       PUT /api/orders/{id}/payment-status?status=SUCCESS
       ======================================================== */

    window.updatePaymentStatus =
        async function(orderId) {

            const select =
                document.getElementById(
                    "payment-" + orderId
                );

            const message =
                document.getElementById(
                    "message-" + orderId
                );

            if (!select) {
                return;
            }

            const newStatus =
                select.value;

            try {

                showMessage(
                    message,
                    "Updating payment status...",
                    false
                );

                /*
                 * IMPORTANT:
                 *
                 * Backend uses:
                 *
                 * @RequestParam String status
                 *
                 * So status MUST be sent
                 * in URL query parameter.
                 */

                const url =
                    window.API.orders +
                    "/" +
                    orderId +
                    "/payment-status?status=" +
                    encodeURIComponent(
                        newStatus
                    );

                console.log(
                    "Updating payment status:",
                    url
                );

                const response =
                    await fetch(
                        url, {
                            method: "PUT",

                            headers: {
                                "Accept": "application/json"
                            }
                        }
                    );

                const text =
                    await response.text();

                console.log(
                    "Payment update response:",
                    response.status,
                    text
                );

                if (!response.ok) {

                    throw new Error(
                        text ||
                        "Failed to update payment status."
                    );

                }

                showMessage(
                    message,
                    "Payment status updated successfully.",
                    true
                );

                /*
                 * Reload orders from backend
                 */

                await loadAdminOrders();

            } catch (error) {

                console.error(
                    "Payment status update error:",
                    error
                );

                showMessage(
                    message,
                    "Payment update failed: " +
                    error.message,
                    false
                );

            }

        };


    /* ========================================================
       LOGOUT
       ======================================================== */

    window.logoutAdmin =
        function() {

            localStorage.removeItem(
                "loggedInUser"
            );

            localStorage.removeItem(
                "user"
            );

            window.location.href =
                "dashboard.html";

        };


    /* ========================================================
       SET TEXT
       ======================================================== */

    function setText(
        id,
        value
    ) {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent = value;
        }

    }


    /* ========================================================
       SHOW MESSAGE
       ======================================================== */

    function showMessage(
        element,
        message,
        success
    ) {

        if (!element) {
            return;
        }

        element.textContent =
            message;

        element.className =
            "order-message " +
            (
                success ?
                "success-message" :
                "error-message"
            );

    }


    /* ========================================================
       FORMAT CURRENCY
       ======================================================== */

    function formatCurrency(
        amount
    ) {

        const value =
            Number(amount || 0);

        return "₹" +
            value.toLocaleString(
                "en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );

    }


    /* ========================================================
       FORMAT DATE
       ======================================================== */

    function formatDate(
        dateValue
    ) {

        if (!dateValue) {
            return "N/A";
        }

        const date =
            new Date(dateValue);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(dateValue);

        }

        return date.toLocaleString(
            "en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    /* ========================================================
       FORMAT STATUS
       ======================================================== */

    function formatStatus(
        status
    ) {

        return String(
                status || "N/A"
            )
            .replaceAll(
                "_",
                " "
            )
            .toLowerCase()
            .replace(
                /\b\w/g,
                function(letter) {
                    return letter.toUpperCase();
                }
            );

    }


    /* ========================================================
       PAYMENT CSS CLASS
       ======================================================== */

    function getPaymentClass(
        status
    ) {

        switch (
            String(status || "")
            .toUpperCase()
        ) {

            case "SUCCESS":
                return "payment-success";

            case "FAILED":
                return "payment-failed";

            default:
                return "payment-pending";

        }

    }


    /* ========================================================
       HTML ESCAPE
       ======================================================== */

    function escapeHTML(
        value
    ) {

        return String(
                value || ""
            )
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


})();