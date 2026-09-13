/* ============================================================
   CHECKOUT MANAGEMENT
   Smart Parking + E-Commerce
   Backend API: /api/cart + /api/products + /api/orders
   ============================================================ */

window.CHECKOUT_USER_ID =
    window.CHECKOUT_USER_ID || 10;

window.checkoutCart =
    window.checkoutCart || [];

window.checkoutTotal =
    window.checkoutTotal || 0;


/* ============================================================
   PAGE LOAD
   ============================================================ */

document.addEventListener("DOMContentLoaded", function() {

    loadCheckout();

});


/* ============================================================
   LOAD CART
   ============================================================ */

async function loadCheckout() {

    const checkoutContent =
        document.getElementById("checkoutContent");

    const checkoutEmpty =
        document.getElementById("checkoutEmpty");

    if (!checkoutContent) {
        return;
    }

    try {

        const response = await fetch(
            window.API.cart +
            "/user/" +
            window.CHECKOUT_USER_ID
        );

        if (!response.ok) {

            throw new Error(
                "HTTP " + response.status
            );

        }

        const data =
            await response.json();

        window.checkoutCart =
            Array.isArray(data) ?
            data :
            [];


        /* ============================================
           CHECK EMPTY CART
           ============================================ */

        if (
            window.checkoutCart.length === 0
        ) {

            checkoutContent.style.display =
                "none";

            if (checkoutEmpty) {

                checkoutEmpty.style.display =
                    "block";

            }

            return;
        }


        /* ============================================
           LOAD PRODUCT INFORMATION
           ============================================ */

        await loadCheckoutProducts();


        /* ============================================
           DISPLAY CHECKOUT
           ============================================ */

        renderCheckout();


    } catch (error) {

        console.error(
            "Checkout Load Error:",
            error
        );

        showCheckoutMessage(
            "Unable to load checkout. Make sure Spring Boot is running on port 8081.",
            false
        );

    }

}


/* ============================================================
   LOAD PRODUCTS
   ============================================================ */

async function loadCheckoutProducts() {

    try {

        const response =
            await fetch(
                window.API.products
            );

        if (!response.ok) {
            return;
        }

        const products =
            await response.json();


        window.checkoutCart.forEach(
            function(item) {

                const product =
                    products.find(
                        function(p) {

                            return Number(p.id) ===
                                Number(item.productId);

                        }
                    );


                if (product) {

                    item.productName =
                        product.name;

                    item.productCategory =
                        product.category;

                    item.productDescription =
                        product.description;

                    item.productImage =
                        product.image;

                    item.productStock =
                        product.stock;

                }

            }
        );


    } catch (error) {

        console.error(
            "Product Load Error:",
            error
        );

    }

}


/* ============================================================
   PRODUCT IMAGE PATH
   ============================================================ */

function getCheckoutImagePath(imageName) {

    if (!imageName) {

        return "https://via.placeholder.com/100x90?text=No+Image";

    }


    let image =
        String(imageName).trim();


    image =
        image.replace(/^\/+/, "");


    /* Full URL */

    if (
        image.startsWith("http://") ||
        image.startsWith("https://") ||
        image.startsWith("data:")
    ) {

        return image;

    }


    /* Already correct path */

    if (
        image.startsWith(
            "images/products/"
        )
    ) {

        return image;

    }


    /* Database contains filename */

    return "images/products/" + image;

}


/* ============================================================
   RENDER CHECKOUT
   ============================================================ */

function renderCheckout() {

    const container =
        document.getElementById(
            "checkoutItems"
        );


    if (!container) {
        return;
    }


    let html = "";

    let totalItems = 0;

    let subtotal = 0;


    window.checkoutCart.forEach(
        function(item) {

            const name =
                item.productName ?
                item.productName :
                "Product #" +
                item.productId;


            const category =
                item.productCategory ?
                item.productCategory :
                "Product";


            const image =
                getCheckoutImagePath(
                    item.productImage
                );


            const price =
                Number(
                    item.price || 0
                );


            const quantity =
                Number(
                    item.quantity || 1
                );


            const itemTotal =
                price * quantity;


            totalItems +=
                quantity;


            subtotal +=
                itemTotal;


            html += `

                <div class="checkout-item">

                    <img
                        class="checkout-item-image"
                        src="${escapeCheckout(image)}"
                        alt="${escapeCheckout(name)}"
                        onerror="this.src='https://via.placeholder.com/100x90?text=No+Image'"
                    >

                    <div class="checkout-item-info">

                        <h3>
                            ${escapeCheckout(name)}
                        </h3>

                        <p>
                            ${escapeCheckout(category)}
                        </p>

                        <p>
                            ₹${price.toFixed(2)}
                            ×
                            ${quantity}
                        </p>

                    </div>

                    <div class="checkout-item-price">

                        ₹${itemTotal.toFixed(2)}

                    </div>

                </div>

            `;

        }
    );


    container.innerHTML =
        html;


    window.checkoutTotal =
        subtotal;


    /* ============================================
       SUMMARY
       ============================================ */

    const summaryItems =
        document.getElementById(
            "summaryItems"
        );


    const summarySubtotal =
        document.getElementById(
            "summarySubtotal"
        );


    const summaryTotal =
        document.getElementById(
            "summaryTotal"
        );


    if (summaryItems) {

        summaryItems.textContent =
            totalItems;

    }


    if (summarySubtotal) {

        summarySubtotal.textContent =
            subtotal.toFixed(2);

    }


    if (summaryTotal) {

        summaryTotal.textContent =
            subtotal.toFixed(2);

    }

}


/* ============================================================
   PLACE ORDER
   ============================================================ */

async function placeOrder() {

    const form =
        document.getElementById(
            "checkoutForm"
        );


    const button =
        document.getElementById(
            "placeOrderButton"
        );


    /* ============================================
       FORM VALIDATION
       ============================================ */

    if (form) {

        if (!form.checkValidity()) {

            form.reportValidity();

            return;

        }

    }


    /* ============================================
       CHECK CART
       ============================================ */

    if (!window.checkoutCart ||
        window.checkoutCart.length === 0
    ) {

        showCheckoutMessage(
            "Your cart is empty.",
            false
        );

        return;

    }


    /* ============================================
       PAYMENT METHOD
       ============================================ */

    const paymentElement =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );


    if (!paymentElement) {

        showCheckoutMessage(
            "Please select a payment method.",
            false
        );

        return;

    }


    /* ============================================
       CUSTOMER DETAILS
       ============================================ */

    const customerName =
        getInputValue(
            "customerName"
        );


    const customerEmail =
        getInputValue(
            "customerEmail"
        );


    const customerPhone =
        getInputValue(
            "customerPhone"
        );


    const address =
        getInputValue(
            "address"
        );


    const city =
        getInputValue(
            "city"
        );


    const pincode =
        getInputValue(
            "pincode"
        );


    /* ============================================
       ORDER DATA
       ============================================ */

    const orderData = {

        userId: window.CHECKOUT_USER_ID,

        totalAmount: Number(
            window.checkoutTotal
        ),

        customerName: customerName,

        customerEmail: customerEmail,

        customerPhone: customerPhone,

        deliveryAddress: address,

        city: city,

        pincode: pincode,

        paymentMethod: paymentElement.value

    };


    console.log(
        "Order Request:",
        orderData
    );


    try {

        /* ========================================
           DISABLE BUTTON
           ======================================== */

        if (button) {

            button.disabled =
                true;

            button.textContent =
                "Placing Order...";

        }


        showCheckoutMessage(
            "Placing your order...",
            true
        );


        /* ========================================
           SEND ORDER TO SPRING BOOT
           ======================================== */

        const response =
            await fetch(
                window.API.orders, {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(
                        orderData
                    )
                }
            );


        const text =
            await response.text();


        let data = {};


        try {

            data =
                text ?
                JSON.parse(text) :
                {};

        } catch (error) {

            data = {
                message: text
            };

        }


        console.log(
            "Order Response:",
            data
        );


        /* ========================================
           ORDER FAILED
           ======================================== */

        if (!response.ok) {

            console.error(
                "Order API Error:",
                data
            );


            showCheckoutMessage(
                data.message ||
                "Order placement failed.",
                false
            );


            resetPlaceOrderButton();

            return;

        }


        /* ========================================
           GET ORDER ID
           ======================================== */

        const orderId =
            data.id ||
            data.orderId ||
            data.orderID ||
            data.orderNumber ||
            "-";


        /* ========================================
           CLEAR CART
           ======================================== */

        await clearCheckoutCart();


        /* ========================================
           SHOW SUCCESS
           ======================================== */

        showOrderSuccess(
            orderId
        );


    } catch (error) {

        console.error(
            "Place Order Error:",
            error
        );


        showCheckoutMessage(
            "Unable to connect to server. Make sure Spring Boot is running on port 8081.",
            false
        );


        resetPlaceOrderButton();

    }

}


/* ============================================================
   CLEAR CART AFTER ORDER
   ============================================================ */

async function clearCheckoutCart() {

    try {

        const response =
            await fetch(
                window.API.cart +
                "/user/" +
                window.CHECKOUT_USER_ID, {
                    method: "DELETE"
                }
            );


        const text =
            await response.text();


        if (!response.ok) {

            console.error(
                "Clear Cart Error:",
                text
            );

            return;

        }


        console.log(
            "Cart cleared successfully."
        );


        window.checkoutCart = [];


    } catch (error) {

        console.error(
            "Clear Cart Error:",
            error
        );

    }

}


/* ============================================================
   SHOW ORDER SUCCESS
   ============================================================ */

function showOrderSuccess(orderId) {

    const checkoutContent =
        document.getElementById(
            "checkoutContent"
        );


    const success =
        document.getElementById(
            "orderSuccess"
        );


    const successOrderId =
        document.getElementById(
            "successOrderId"
        );


    if (checkoutContent) {

        checkoutContent.style.display =
            "none";

    }


    if (success) {

        success.style.display =
            "block";

    }


    if (successOrderId) {

        successOrderId.textContent =
            orderId;

    }

}


/* ============================================================
   GET INPUT VALUE
   ============================================================ */

function getInputValue(id) {

    const element =
        document.getElementById(id);


    if (!element) {
        return "";
    }


    return element.value.trim();

}


/* ============================================================
   RESET BUTTON
   ============================================================ */

function resetPlaceOrderButton() {

    const button =
        document.getElementById(
            "placeOrderButton"
        );


    if (button) {

        button.disabled =
            false;

        button.textContent =
            "Place Order";

    }

}


/* ============================================================
   CHECKOUT MESSAGE
   ============================================================ */

function showCheckoutMessage(
    message,
    success
) {

    const element =
        document.getElementById(
            "checkoutMessage"
        );


    if (!element) {

        alert(message);

        return;

    }


    element.textContent =
        message;


    element.style.color =
        success ?
        "green" :
        "red";

}


/* ============================================================
   HTML ESCAPE
   ============================================================ */

function escapeCheckout(value) {

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