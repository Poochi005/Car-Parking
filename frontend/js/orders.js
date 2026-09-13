/* ============================================================
   MY ORDERS
   Smart Car Parking + E-Commerce
   ============================================================ */

(function() {

    "use strict";

    // Current logged-in user
    const CURRENT_USER_ID = 10;

    let allOrders = [];
    let filteredOrders = [];


    /* ============================================================
       SHORT ELEMENT HELPER
       ============================================================ */

    function $(id) {
        return document.getElementById(id);
    }


    /* ============================================================
       PAGE LOAD
       ============================================================ */

    document.addEventListener("DOMContentLoaded", function() {

        console.log("Orders page loaded");

        setupEvents();

        loadOrders();

    });


    /* ============================================================
       EVENTS
       ============================================================ */

    function setupEvents() {

        const statusFilter = $("orderStatusFilter");
        const searchInput = $("orderSearch");


        if (statusFilter) {

            statusFilter.addEventListener(
                "change",
                applyFilters
            );

        }


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                applyFilters
            );

        }

    }


    /* ============================================================
       LOAD ORDERS FROM BACKEND
       ============================================================ */

    async function loadOrders() {

        showLoading(true);
        hideError();

        try {

            const response = await fetch(
                window.API.orders +
                "/user/" +
                CURRENT_USER_ID
            );


            console.log(
                "Orders API status:",
                response.status
            );


            if (!response.ok) {

                const errorText =
                    await response.text();

                throw new Error(
                    errorText ||
                    "Unable to load orders"
                );

            }


            const data =
                await response.json();


            console.log(
                "Orders API response:",
                data
            );


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


            // Newest order first
            allOrders.sort(function(a, b) {

                const dateA =
                    new Date(
                        a.createdAt || 0
                    ).getTime();

                const dateB =
                    new Date(
                        b.createdAt || 0
                    ).getTime();

                return dateB - dateA;

            });


            filteredOrders = [...allOrders];


            updateStats();

            renderOrders();


        } catch (error) {

            console.error(
                "Load orders error:",
                error
            );


            showError(
                "Unable to load orders. " +
                error.message
            );


            allOrders = [];

            filteredOrders = [];

            updateStats();

            renderOrders();

        } finally {

            showLoading(false);

        }

    }


    /* ============================================================
       UPDATE STATISTICS
       ============================================================ */

    function updateStats() {

        const total =
            allOrders.length;


        let active = 0;

        let delivered = 0;

        let totalSpent = 0;


        allOrders.forEach(function(order) {

            const status =
                String(
                    order.orderStatus || ""
                ).toUpperCase();


            // Active = not delivered/cancelled
            if (
                status !== "DELIVERED" &&
                status !== "CANCELLED"
            ) {

                active++;

            }


            if (status === "DELIVERED") {

                delivered++;

            }


            const amount =
                Number(
                    order.totalAmount || 0
                );


            if (!isNaN(amount)) {

                totalSpent += amount;

            }

        });


        if ($("totalOrders")) {

            $("totalOrders").textContent =
                total;

        }


        if ($("activeOrders")) {

            $("activeOrders").textContent =
                active;

        }


        if ($("deliveredOrders")) {

            $("deliveredOrders").textContent =
                delivered;

        }


        if ($("totalSpent")) {

            $("totalSpent").textContent =
                totalSpent.toFixed(2);

        }

    }


    /* ============================================================
       FILTER ORDERS
       ============================================================ */

    function applyFilters() {

        const statusFilter =
            $("orderStatusFilter");

        const searchInput =
            $("orderSearch");


        const selectedStatus =
            statusFilter ?
            statusFilter.value :
            "ALL";


        const searchText =
            searchInput ?
            searchInput.value
            .trim()
            .toLowerCase() :
            "";


        filteredOrders =
            allOrders.filter(function(order) {

                const status =
                    String(
                        order.orderStatus || ""
                    ).toUpperCase();


                const orderNumber =
                    String(
                        order.orderNumber || ""
                    ).toLowerCase();


                const statusMatch =
                    selectedStatus === "ALL" ||
                    status === selectedStatus;


                const searchMatch = !searchText ||
                    orderNumber.includes(
                        searchText
                    );


                return (
                    statusMatch &&
                    searchMatch
                );

            });


        renderOrders();

    }


    /* ============================================================
       RENDER ORDERS
       ============================================================ */

    function renderOrders() {

        const list =
            $("ordersList");

        const empty =
            $("ordersEmpty");


        if (!list) {

            return;

        }


        list.innerHTML = "";


        if (
            filteredOrders.length === 0
        ) {

            if (empty) {

                empty.style.display =
                    "block";

            }

            return;

        }


        if (empty) {

            empty.style.display =
                "none";

        }


        filteredOrders.forEach(
            function(order) {

                list.appendChild(
                    createOrderCard(order)
                );

            }
        );

    }


    /* ============================================================
       CREATE ORDER CARD
       ============================================================ */

    function createOrderCard(order) {

        const card =
            document.createElement("div");


        card.className =
            "order-card";


        const orderNumber =
            order.orderNumber ||
            ("ORDER-" + (order.id || ""));


        const status =
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


        const totalAmount =
            Number(
                order.totalAmount || 0
            );


        const createdDate =
            formatDate(
                order.createdAt
            );


        const deliveryAddress =
            buildAddress(order);


        const customerName =
            order.customerName ||
            "N/A";


        const customerEmail =
            order.customerEmail ||
            "N/A";


        const customerPhone =
            order.customerPhone ||
            "N/A";


        card.innerHTML = `

            <div class="order-top">

                <div>

                    <div class="order-number">

                        📦
                        ${escapeHtml(orderNumber)}

                    </div>

                    <div class="order-date">

                        Ordered on
                        ${escapeHtml(createdDate)}

                    </div>

                </div>


                <div>

                    <span class="
                        status-badge
                        ${getStatusClass(status)}
                    ">

                        ${formatStatus(status)}

                    </span>

                </div>

            </div>


            <div class="order-details">

                <div>

                    <div class="order-detail-label">
                        Customer
                    </div>

                    <div class="order-detail-value">

                        ${escapeHtml(customerName)}

                    </div>

                </div>


                <div>

                    <div class="order-detail-label">
                        Phone
                    </div>

                    <div class="order-detail-value">

                        ${escapeHtml(customerPhone)}

                    </div>

                </div>


                <div>

                    <div class="order-detail-label">
                        Payment
                    </div>

                    <div class="order-detail-value">

                        ${escapeHtml(paymentMethod)}

                    </div>

                </div>


                <div>

                    <div class="order-detail-label">
                        Total Amount
                    </div>

                    <div class="
                        order-detail-value
                        order-total
                    ">

                        ₹${totalAmount.toFixed(2)}

                    </div>

                </div>

            </div>


            <div class="order-delivery">

                <div class="order-delivery-title">

                    📍 Delivery Address

                </div>


                <div class="order-delivery-text">

                    ${escapeHtml(deliveryAddress)}

                </div>

            </div>


            <div class="order-bottom">

                <div class="payment-info">

                    Payment Status:

                    <span class="
                        ${getPaymentClass(paymentStatus)}
                    ">

                        ${formatStatus(paymentStatus)}

                    </span>

                    <br>

                    <span>

                        ${escapeHtml(customerEmail)}

                    </span>

                </div>


                <div>

                    <button
                        class="
                            order-btn
                            order-btn-secondary
                        "
                        onclick="viewOrderDetails(${Number(order.id || 0)})"
                    >

                        👁️ View Details

                    </button>

                </div>

            </div>

        `;


        return card;

    }


    /* ============================================================
       VIEW ORDER DETAILS
       ============================================================ */

    window.viewOrderDetails =
        function(orderId) {

            const order =
                allOrders.find(
                    function(item) {

                        return Number(item.id) ===
                            Number(orderId);

                    }
                );


            if (!order) {

                alert(
                    "Order details not found."
                );

                return;

            }


            const orderNumber =
                order.orderNumber ||
                ("ORDER-" + order.id);


            const status =
                formatStatus(
                    order.orderStatus ||
                    "PLACED"
                );


            const paymentStatus =
                formatStatus(
                    order.paymentStatus ||
                    "PENDING"
                );


            const paymentMethod =
                order.paymentMethod ||
                "N/A";


            const amount =
                Number(
                    order.totalAmount || 0
                );


            const address =
                buildAddress(order);


            const message =

                "ORDER DETAILS\n\n" +

                "Order Number: " +
                orderNumber +

                "\nOrder ID: " +
                (order.id || "N/A") +

                "\nStatus: " +
                status +

                "\nPayment Method: " +
                paymentMethod +

                "\nPayment Status: " +
                paymentStatus +

                "\nTotal Amount: ₹" +
                amount.toFixed(2) +

                "\n\nCustomer: " +
                (order.customerName || "N/A") +

                "\nEmail: " +
                (order.customerEmail || "N/A") +

                "\nPhone: " +
                (order.customerPhone || "N/A") +

                "\n\nDelivery Address:\n" +
                address;


            alert(message);

        };


    /* ============================================================
       BUILD DELIVERY ADDRESS
       ============================================================ */

    function buildAddress(order) {

        const parts = [];


        if (order.deliveryAddress) {

            parts.push(
                order.deliveryAddress
            );

        }


        if (order.city) {

            parts.push(
                order.city
            );

        }


        if (order.pincode) {

            parts.push(
                order.pincode
            );

        }


        if (parts.length === 0) {

            return "Address not available";

        }


        return parts.join(", ");

    }


    /* ============================================================
       ORDER STATUS CSS CLASS
       ============================================================ */

    function getStatusClass(status) {

        switch (status) {

            case "PLACED":

                return "status-placed";


            case "CONFIRMED":

                return "status-confirmed";


            case "PREPARING":

                return "status-preparing";


            case "OUT_FOR_DELIVERY":

                return "status-out-for-delivery";


            case "DELIVERED":

                return "status-delivered";


            case "CANCELLED":

                return "status-cancelled";


            default:

                return "status-placed";

        }

    }


    /* ============================================================
       PAYMENT CSS CLASS
       ============================================================ */

    function getPaymentClass(status) {

        if (
            status === "SUCCESS" ||
            status === "PAID"
        ) {

            return "payment-success";

        }


        return "payment-pending";

    }


    /* ============================================================
       FORMAT STATUS
       ============================================================ */

    function formatStatus(status) {

        return String(status || "N/A")
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(
                /\b\w/g,
                function(letter) {

                    return letter.toUpperCase();

                }
            );

    }


    /* ============================================================
       FORMAT DATE
       ============================================================ */

    function formatDate(dateValue) {

        if (!dateValue) {

            return "Date unavailable";

        }


        const date =
            new Date(dateValue);


        if (isNaN(date.getTime())) {

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


    /* ============================================================
       ESCAPE HTML
       ============================================================ */

    function escapeHtml(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }


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
       LOADING
       ============================================================ */

    function showLoading(show) {

        const loading =
            $("ordersLoading");


        if (loading) {

            loading.style.display =
                show ?
                "block" :
                "none";

        }

    }


    /* ============================================================
       ERROR
       ============================================================ */

    function showError(message) {

        const error =
            $("ordersError");


        if (!error) {

            return;

        }


        error.textContent =
            message ||
            "Something went wrong.";


        error.style.display =
            "block";

    }


    function hideError() {

        const error =
            $("ordersError");


        if (!error) {

            return;

        }


        error.textContent = "";

        error.style.display =
            "none";

    }

})();