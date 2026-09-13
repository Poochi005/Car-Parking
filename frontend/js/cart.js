/* ============================================================
   CART MANAGEMENT
   Backend API: /api/cart
   ============================================================ */

window.CURRENT_USER_ID = window.CURRENT_USER_ID || 10;
window.cartItems = window.cartItems || [];


/* ============================================================
   PAGE LOAD
   ============================================================ */

document.addEventListener("DOMContentLoaded", function() {
    loadCart();
});


/* ============================================================
   LOAD CART
   ============================================================ */

async function loadCart() {

    const loading = document.getElementById("cartLoading");
    const container = document.getElementById("cartItems");

    if (!container) {
        return;
    }

    try {

        if (loading) {
            loading.style.display = "block";
        }

        const response = await fetch(
            window.API.cart + "/user/" + window.CURRENT_USER_ID
        );

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        const data = await response.json();

        window.cartItems = Array.isArray(data) ? data : [];

        await loadProductDetails();

        renderCart();

    } catch (error) {

        console.error("Cart Load Error:", error);

        container.innerHTML = `
            <div class="empty-cart">
                <h2>Unable to load cart</h2>
                <p>Make sure Spring Boot is running on port 8081.</p>
            </div>
        `;

    } finally {

        if (loading) {
            loading.style.display = "none";
        }
    }
}


/* ============================================================
   LOAD PRODUCT DETAILS
   ============================================================ */

async function loadProductDetails() {

    try {

        const response = await fetch(window.API.products);

        if (!response.ok) {
            return;
        }

        const products = await response.json();

        window.cartItems.forEach(function(item) {

            const product = products.find(function(p) {

                return Number(p.id) === Number(item.productId);

            });

            if (product) {

                item.productName = product.name;
                item.productCategory = product.category;
                item.productDescription = product.description;
                item.productImage = product.image;
                item.productStock = product.stock;
            }
        });

    } catch (error) {

        console.error("Product Details Error:", error);
    }
}


/* ============================================================
   PRODUCT IMAGE PATH
   ============================================================ */

function getCartImagePath(imageName) {

    if (!imageName) {

        return "https://via.placeholder.com/120x110?text=No+Image";
    }

    let image = String(imageName).trim();

    image = image.replace(/^\/+/, "");

    /* Already full URL */
    if (
        image.startsWith("http://") ||
        image.startsWith("https://") ||
        image.startsWith("data:")
    ) {
        return image;
    }

    /* Already correct frontend path */
    if (image.startsWith("images/products/")) {

        return image;
    }

    /* Database stores only filename */
    return "images/products/" + image;
}


/* ============================================================
   RENDER CART
   ============================================================ */

function renderCart() {

    const container = document.getElementById("cartItems");
    const emptyCart = document.getElementById("emptyCart");

    if (!container) {
        return;
    }

    if (!window.cartItems || window.cartItems.length === 0) {

        container.innerHTML = "";

        if (emptyCart) {
            emptyCart.style.display = "block";
        }

        updateSummary();

        return;
    }

    if (emptyCart) {
        emptyCart.style.display = "none";
    }

    let html = "";

    window.cartItems.forEach(function(item) {

        const image = getCartImagePath(item.productImage);

        const name = item.productName ?
            item.productName :
            "Product #" + item.productId;

        const category = item.productCategory ?
            item.productCategory :
            "Product";

        const price = Number(item.price || 0);

        const quantity = Number(item.quantity || 1);

        const total = price * quantity;

        html += `
            <div class="cart-item">

                <img
                    class="cart-item-image"
                    src="${escapeHtml(image)}"
                    alt="${escapeHtml(name)}"
                    onerror="this.src='https://via.placeholder.com/120x110?text=No+Image'"
                >

                <div class="cart-item-details">

                    <h3>
                        ${escapeHtml(name)}
                    </h3>

                    <div class="cart-category">
                        ${escapeHtml(category)}
                    </div>

                    <div class="cart-price">
                        ₹${price.toFixed(2)}
                    </div>

                    <div class="quantity-control">

                        <button
                            type="button"
                            onclick="decreaseQuantity(${item.id})">
                            −
                        </button>

                        <span>
                            ${quantity}
                        </span>

                        <button
                            type="button"
                            onclick="increaseQuantity(${item.id})">
                            +
                        </button>

                    </div>

                </div>

                <div class="cart-item-total">

                    <p>
                        <strong>
                            ₹${total.toFixed(2)}
                        </strong>
                    </p>

                    <button
                        type="button"
                        class="remove-btn"
                        onclick="removeCartItem(${item.id})">
                        Remove
                    </button>

                </div>

            </div>
        `;
    });

    container.innerHTML = html;

    updateSummary();
}


/* ============================================================
   INCREASE QUANTITY
   ============================================================ */

async function increaseQuantity(cartId) {

    const item = window.cartItems.find(function(cartItem) {

        return Number(cartItem.id) === Number(cartId);

    });

    if (!item) {
        return;
    }

    const newQuantity = Number(item.quantity) + 1;

    await updateCartQuantity(
        cartId,
        newQuantity,
        item.price
    );
}


/* ============================================================
   DECREASE QUANTITY
   ============================================================ */

async function decreaseQuantity(cartId) {

    const item = window.cartItems.find(function(cartItem) {

        return Number(cartItem.id) === Number(cartId);

    });

    if (!item) {
        return;
    }

    const newQuantity = Number(item.quantity) - 1;

    if (newQuantity <= 0) {

        await removeCartItem(cartId);

        return;
    }

    await updateCartQuantity(
        cartId,
        newQuantity,
        item.price
    );
}


/* ============================================================
   UPDATE CART QUANTITY
   ============================================================ */

async function updateCartQuantity(
    cartId,
    quantity,
    price
) {

    try {

        const response = await fetch(
            window.API.cart + "/" + cartId, {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    quantity: quantity,
                    price: price
                })
            }
        );

        const text = await response.text();

        if (!response.ok) {

            console.error(
                "Update Cart Error:",
                text
            );

            showCartMessage(
                "Unable to update quantity.",
                false
            );

            return;
        }

        await loadCart();

    } catch (error) {

        console.error(
            "Update Cart API Error:",
            error
        );

        showCartMessage(
            "Unable to connect to server.",
            false
        );
    }
}


/* ============================================================
   REMOVE CART ITEM
   ============================================================ */

async function removeCartItem(cartId) {

    try {

        const response = await fetch(
            window.API.cart + "/" + cartId, {
                method: "DELETE"
            }
        );

        const text = await response.text();

        if (!response.ok) {

            console.error(
                "Remove Cart Error:",
                text
            );

            showCartMessage(
                "Unable to remove product.",
                false
            );

            return;
        }

        showCartMessage(
            "Product removed from cart.",
            true
        );

        await loadCart();

    } catch (error) {

        console.error(
            "Remove Cart API Error:",
            error
        );

        showCartMessage(
            "Unable to connect to server.",
            false
        );
    }
}


/* ============================================================
   CLEAR CART
   ============================================================ */

async function clearCart() {

    try {

        const response = await fetch(
            window.API.cart +
            "/user/" +
            window.CURRENT_USER_ID, {
                method: "DELETE"
            }
        );

        const text = await response.text();

        if (!response.ok) {

            console.error(
                "Clear Cart Error:",
                text
            );

            showCartMessage(
                "Unable to clear cart.",
                false
            );

            return;
        }

        window.cartItems = [];

        renderCart();

        showCartMessage(
            "Cart cleared successfully.",
            true
        );

    } catch (error) {

        console.error(
            "Clear Cart API Error:",
            error
        );

        showCartMessage(
            "Unable to connect to server.",
            false
        );
    }
}


/* ============================================================
   ORDER SUMMARY
   ============================================================ */

function updateSummary() {

    let totalItems = 0;

    let subtotal = 0;

    window.cartItems.forEach(function(item) {

        const quantity =
            Number(item.quantity || 0);

        const price =
            Number(item.price || 0);

        totalItems += quantity;

        subtotal += price * quantity;
    });

    const totalItemsElement =
        document.getElementById("totalItems");

    const subtotalElement =
        document.getElementById("subtotal");

    const grandTotalElement =
        document.getElementById("grandTotal");

    if (totalItemsElement) {

        totalItemsElement.textContent =
            totalItems;
    }

    if (subtotalElement) {

        subtotalElement.textContent =
            subtotal.toFixed(2);
    }

    if (grandTotalElement) {

        grandTotalElement.textContent =
            subtotal.toFixed(2);
    }
}


/* ============================================================
   CHECKOUT
   ============================================================ */

function proceedToCheckout() {

    if (!window.cartItems ||
        window.cartItems.length === 0
    ) {

        showCartMessage(
            "Your cart is empty.",
            false
        );

        return;
    }

    window.location.href = "checkout.html";
}


/* ============================================================
   MESSAGE
   ============================================================ */

function showCartMessage(message, success) {

    const messageElement =
        document.getElementById("cartMessage");

    if (!messageElement) {

        alert(message);

        return;
    }

    messageElement.textContent =
        message;

    messageElement.style.color =
        success ? "green" : "red";

    setTimeout(function() {

        messageElement.textContent = "";

    }, 3000);
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