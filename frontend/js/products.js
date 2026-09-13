/* ============================================================
   PRODUCTS PAGE
   ============================================================ */

window.allProducts = window.allProducts || [];
window.selectedProduct = window.selectedProduct || null;
window.CURRENT_USER_ID = window.CURRENT_USER_ID || 10;


/* ============================================================
   PAGE LOAD
   ============================================================ */

document.addEventListener("DOMContentLoaded", function() {

    loadProducts();

    const searchInput =
        document.getElementById("productSearch");

    if (searchInput) {
        searchInput.addEventListener("input", function() {
            searchProducts(this.value);
        });
    }

});


/* ============================================================
   IMAGE PATH
   ============================================================ */

function getProductImagePath(imageName) {

    if (!imageName) {
        return "";
    }

    let image = String(imageName).trim();

    /*
     * If database already contains a full URL
     */
    if (
        image.startsWith("http://") ||
        image.startsWith("https://") ||
        image.startsWith("data:")
    ) {
        return image;
    }

    /*
     * Remove leading slash
     */
    image = image.replace(/^\/+/, "");

    /*
     * If database already contains images/products/
     */
    if (image.startsWith("images/products/")) {
        return image;
    }

    /*
     * Normal database value:
     * car-cover.jpg
     */
    return "images/products/" + image;
}


/* ============================================================
   LOAD PRODUCTS
   ============================================================ */

async function loadProducts() {

    const loading =
        document.getElementById("productsLoading");

    const grid =
        document.getElementById("productsGrid");

    const count =
        document.getElementById("productCount");

    try {

        if (loading) {
            loading.style.display = "block";
            loading.textContent = "Loading products...";
        }

        if (grid) {
            grid.innerHTML = "";
        }

        const response =
            await fetch(window.API.products);

        if (!response.ok) {
            throw new Error(
                "HTTP " + response.status
            );
        }

        const data =
            await response.json();

        console.log(
            "Products API Response:",
            data
        );

        window.allProducts =
            Array.isArray(data) ? data : [];

        renderProducts(
            window.allProducts
        );

    } catch (error) {

        console.error(
            "Products API Error:",
            error
        );

        if (count) {
            count.textContent =
                "Products unavailable";
        }

        if (grid) {

            grid.innerHTML = `
                <div class="products-empty">
                    <div class="icon">⚠️</div>

                    <h3>Unable to Load Products</h3>

                    <p>
                        Make sure Spring Boot is running
                        on port 8081.
                    </p>
                </div>
            `;
        }

    } finally {

        if (loading) {
            loading.style.display = "none";
        }

    }

}


/* ============================================================
   RENDER PRODUCTS
   ============================================================ */

function renderProducts(products) {

    const grid =
        document.getElementById("productsGrid");

    const empty =
        document.getElementById("productsEmpty");

    const count =
        document.getElementById("productCount");

    if (!grid) {
        return;
    }

    grid.innerHTML = "";

    if (!Array.isArray(products) ||
        products.length === 0
    ) {

        if (empty) {
            empty.style.display = "block";
        }

        if (count) {
            count.textContent =
                "0 products found";
        }

        return;
    }

    if (empty) {
        empty.style.display = "none";
    }

    if (count) {

        count.textContent =
            products.length +
            (
                products.length === 1 ?
                " product found" :
                " products found"
            );
    }

    products.forEach(function(product) {

        const card =
            createProductCard(product);

        grid.appendChild(card);

    });

}


/* ============================================================
   CREATE PRODUCT CARD
   ============================================================ */

function createProductCard(product) {

    const card =
        document.createElement("div");

    card.className =
        "product-card";


    /* ========================================================
       IMAGE
       ======================================================== */

    const imageContainer =
        document.createElement("div");

    imageContainer.className =
        "product-image";


    if (product.image) {

        const image =
            document.createElement("img");

        const imagePath =
            getProductImagePath(
                product.image
            );

        console.log(
            "Product Image:",
            product.name,
            "=>",
            imagePath
        );

        image.src =
            imagePath;

        image.alt =
            product.name || "Product";

        image.loading =
            "lazy";

        image.onerror =
            function() {

                console.error(
                    "Image not found:",
                    image.src
                );

                imageContainer.innerHTML = `
                    <div class="no-image">
                        🚗
                        <span>No Image</span>
                    </div>
                `;
            };

        imageContainer.appendChild(
            image
        );

    } else {

        imageContainer.innerHTML = `
            <div class="no-image">
                🚗
                <span>No Image</span>
            </div>
        `;
    }


    /* ========================================================
       INFO
       ======================================================== */

    const info =
        document.createElement("div");

    info.className =
        "product-info";


    /* CATEGORY */

    const category =
        document.createElement("span");

    category.className =
        "product-category";

    category.textContent =
        product.category ||
        "Car Product";


    /* NAME */

    const name =
        document.createElement("h3");

    name.className =
        "product-name";

    name.textContent =
        product.name ||
        "Unnamed Product";


    /* DESCRIPTION */

    const description =
        document.createElement("p");

    description.className =
        "product-description";

    description.textContent =
        product.description ||
        "No description available.";


    /* PRICE */

    const price =
        document.createElement("div");

    price.className =
        "product-price";

    price.textContent =
        "₹" +
        formatPrice(product.price);


    /* STOCK */

    const stock =
        document.createElement("div");

    stock.className =
        "product-stock";

    const stockValue =
        Number(product.stock || 0);

    if (stockValue <= 0) {

        stock.classList.add(
            "stock-out"
        );

        stock.textContent =
            "Out of Stock";

    } else if (stockValue <= 5) {

        stock.classList.add(
            "stock-low"
        );

        stock.textContent =
            "Only " +
            stockValue +
            " left";

    } else {

        stock.classList.add(
            "stock-available"
        );

        stock.textContent =
            stockValue +
            " items available";
    }


    /* ========================================================
       ACTIONS
       ======================================================== */

    const actions =
        document.createElement("div");

    actions.className =
        "product-actions";


    /* VIEW BUTTON */

    const viewButton =
        document.createElement("button");

    viewButton.className =
        "btn-view";

    viewButton.type =
        "button";

    viewButton.textContent =
        "View";

    viewButton.addEventListener(
        "click",
        function() {

            openProductModal(product);

        }
    );


    /* CART BUTTON */

    const cartButton =
        document.createElement("button");

    cartButton.className =
        "btn-cart";

    cartButton.type =
        "button";

    if (stockValue <= 0) {

        cartButton.disabled =
            true;

        cartButton.textContent =
            "Out of Stock";

    } else {

        cartButton.textContent =
            "Add to Cart";

        cartButton.addEventListener(
            "click",
            function() {

                addToCart(product);

            }
        );
    }


    actions.appendChild(
        viewButton
    );

    actions.appendChild(
        cartButton
    );


    /* ========================================================
       APPEND
       ======================================================== */

    info.appendChild(
        category
    );

    info.appendChild(
        name
    );

    info.appendChild(
        description
    );

    info.appendChild(
        price
    );

    info.appendChild(
        stock
    );

    info.appendChild(
        actions
    );

    card.appendChild(
        imageContainer
    );

    card.appendChild(
        info
    );

    return card;
}


/* ============================================================
   SEARCH
   ============================================================ */

function searchProducts(searchText) {

    const search =
        String(searchText || "")
        .trim()
        .toLowerCase();

    if (!search) {

        renderProducts(
            window.allProducts
        );

        return;
    }

    const filteredProducts =
        window.allProducts.filter(
            function(product) {

                const name =
                    String(
                        product.name || ""
                    ).toLowerCase();

                const category =
                    String(
                        product.category || ""
                    ).toLowerCase();

                const description =
                    String(
                        product.description || ""
                    ).toLowerCase();

                return (
                    name.includes(search) ||
                    category.includes(search) ||
                    description.includes(search)
                );
            }
        );

    renderProducts(
        filteredProducts
    );
}


/* ============================================================
   PRODUCT MODAL
   ============================================================ */

function openProductModal(product) {

    window.selectedProduct =
        product;

    const modal =
        document.getElementById(
            "productModal"
        );

    if (!modal) {
        return;
    }


    const modalImage =
        document.getElementById(
            "modalImage"
        );

    const modalCategory =
        document.getElementById(
            "modalCategory"
        );

    const modalTitle =
        document.getElementById(
            "modalTitle"
        );

    const modalDescription =
        document.getElementById(
            "modalDescription"
        );

    const modalPrice =
        document.getElementById(
            "modalPrice"
        );

    const modalStock =
        document.getElementById(
            "modalStock"
        );

    const modalCartButton =
        document.getElementById(
            "modalCartButton"
        );


    /* IMAGE */

    if (modalImage) {

        modalImage.innerHTML = "";

        if (product.image) {

            const image =
                document.createElement("img");

            const imagePath =
                getProductImagePath(
                    product.image
                );

            console.log(
                "Modal Image:",
                imagePath
            );

            image.src =
                imagePath;

            image.alt =
                product.name ||
                "Product";

            image.onerror =
                function() {

                    console.error(
                        "Modal image not found:",
                        image.src
                    );

                    modalImage.innerHTML = `
                        <div class="no-image">
                            🚗
                            <span>No Image</span>
                        </div>
                    `;
                };

            modalImage.appendChild(
                image
            );

        } else {

            modalImage.innerHTML = `
                <div class="no-image">
                    🚗
                    <span>No Image</span>
                </div>
            `;
        }
    }


    /* CATEGORY */

    if (modalCategory) {

        modalCategory.textContent =
            product.category ||
            "Car Product";
    }


    /* TITLE */

    if (modalTitle) {

        modalTitle.textContent =
            product.name ||
            "Product";
    }


    /* DESCRIPTION */

    if (modalDescription) {

        modalDescription.textContent =
            product.description ||
            "No description available.";
    }


    /* PRICE */

    if (modalPrice) {

        modalPrice.textContent =
            "₹" +
            formatPrice(
                product.price
            );
    }


    /* STOCK */

    const stockValue =
        Number(product.stock || 0);

    if (modalStock) {

        if (stockValue <= 0) {

            modalStock.textContent =
                "Out of Stock";

            modalStock.className =
                "stock-out";

        } else {

            modalStock.textContent =
                "Stock: " +
                stockValue;

            modalStock.className =
                "stock-available";
        }
    }


    /* CART BUTTON */

    if (modalCartButton) {

        modalCartButton.disabled =
            stockValue <= 0;

        modalCartButton.textContent =
            stockValue <= 0 ?
            "Out of Stock" :
            "Add to Cart";

        modalCartButton.onclick =
            function() {

                if (
                    window.selectedProduct
                ) {

                    addToCart(
                        window.selectedProduct
                    );
                }
            };
    }

    modal.style.display =
        "flex";
}


/* ============================================================
   CLOSE MODAL
   ============================================================ */

function closeProductModal() {

    const modal =
        document.getElementById(
            "productModal"
        );

    if (modal) {

        modal.style.display =
            "none";
    }

    window.selectedProduct =
        null;
}


/* ============================================================
   CLOSE MODAL OUTSIDE
   ============================================================ */

document.addEventListener(
    "click",
    function(event) {

        const modal =
            document.getElementById(
                "productModal"
            );

        if (!modal) {
            return;
        }

        if (event.target === modal) {

            closeProductModal();

        }
    }
);


/* ============================================================
   ADD TO CART
   ============================================================ */

async function addToCart(product) {

    if (!product) {
        return;
    }

    const stockValue =
        Number(product.stock || 0);

    if (stockValue <= 0) {

        showProductMessage(
            "Product is out of stock.",
            false
        );

        return;
    }


    const cartButtons =
        document.querySelectorAll(
            ".btn-cart"
        );

    cartButtons.forEach(
        function(button) {
            button.disabled = true;
        }
    );


    try {

        const cartData = {

            userId: Number(
                window.CURRENT_USER_ID
            ),

            productId: Number(
                product.id
            ),

            quantity: 1,

            price: Number(
                product.price
            )
        };


        console.log(
            "Adding to backend cart:",
            cartData
        );


        const response =
            await fetch(
                window.API.cart, {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(
                        cartData
                    )
                }
            );


        const text =
            await response.text();


        console.log(
            "Cart API:",
            response.status,
            text
        );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status +
                ": " +
                text
            );
        }


        showProductMessage(
            product.name +
            " added to cart 🛒",
            true
        );


        /* LOCAL STORAGE */

        try {

            let localCart =
                JSON.parse(
                    localStorage.getItem(
                        "cart"
                    ) || "[]"
                );

            if (!Array.isArray(localCart)) {
                localCart = [];
            }

            const existingItem =
                localCart.find(
                    function(item) {

                        return Number(
                            item.productId
                        ) === Number(
                            product.id
                        );
                    }
                );


            if (existingItem) {

                existingItem.quantity =
                    Number(
                        existingItem.quantity || 0
                    ) + 1;

            } else {

                localCart.push({

                    productId: product.id,

                    name: product.name,

                    price: product.price,

                    image: product.image,

                    quantity: 1
                });
            }


            localStorage.setItem(
                "cart",
                JSON.stringify(
                    localCart
                )
            );

        } catch (storageError) {

            console.error(
                "Local storage error:",
                storageError
            );
        }


        closeProductModal();


        setTimeout(
            function() {

                window.location.href =
                    "cart.html";

            },
            700
        );


    } catch (error) {

        console.error(
            "Add To Cart Error:",
            error
        );

        showProductMessage(
            "Unable to add product to cart. " +
            error.message,
            false
        );

    } finally {

        cartButtons.forEach(
            function(button) {

                if (!button.textContent.includes(
                        "Out of Stock"
                    )) {

                    button.disabled =
                        false;
                }
            }
        );
    }
}


/* ============================================================
   MESSAGE
   ============================================================ */

function showProductMessage(
    message,
    success
) {

    const messageElement =
        document.getElementById(
            "productMessage"
        );

    if (!messageElement) {

        alert(message);

        return;
    }

    messageElement.textContent =
        message;

    messageElement.style.display =
        "block";

    messageElement.style.background =
        success ?
        "#111" :
        "#b91c1c";


    setTimeout(
        function() {

            messageElement.style.display =
                "none";

        },
        2500
    );
}


/* ============================================================
   FORMAT PRICE
   ============================================================ */

function formatPrice(price) {

    const number =
        Number(price || 0);

    return number.toLocaleString(
        "en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );
}