
const BASE_URL = "https://dummyjson.com";
const detailEl = document.querySelector(".detail");
const wrapperEl = document.querySelector(".product-grid");
const btnSeemore = document.querySelector(".see-more-btn");
const searchInputEl = document.querySelector(".search-wrapper input");
const searchDropEl = document.querySelector(".search__drop");
const collectionEl = document.querySelector(".collection");
const loadingEl = document.querySelector(".loading")
const sidebar = document.querySelector(".sidebar");
const sidebarOverlay = document.querySelector(".sidebar-overlay");
const menuBtn = document.querySelector(".menu");
const closeSidebarBtn = document.querySelector(".sidebar-close-btn");

function openSidebar() {
    sidebar.classList.add("active");
    sidebarOverlay.classList.add("active");
}

function closeSidebar() {
    sidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
}

menuBtn.addEventListener("click", openSidebar);
closeSidebarBtn.addEventListener("click", closeSidebar);
sidebarOverlay.addEventListener("click", closeSidebar);
const perPageCount = 4;
let offset = 0;
let productEndpoint = "/products";

async function fetchData(endpoint, callback) {
    createLoading(perPageCount)
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (callback) callback(data);
    } catch (err) {
        console.error("Ma'lumotlarni olishda xatolik:", err);
    }finally {
        btnSeemore.removeAttribute("disabled");
        btnSeemore.textContent = "See more";
        loadingEl.style.display = "none"
    }
}



function createLoading(n){
    loadingEl.style.display = "grid"
    loadingEl.innerHTML = null
    Array(n).fill().forEach(()=>{
        const div = document.createElement("div")
        div.className = "loading__item"
        div.innerHTML = `
            <div class="loading__image to-left"></div>
            <div class="loading__title to-left"></div>
            <div class="loading__title to-left"></div>
        `
        loadingEl.appendChild(div)
    })
}

function createCard(products) {
    if (!products || !Array.isArray(products)) {
        console.error("Kartochkalarni yaratish uchun noto'g'ri ma'lumot berilgan.");
        return;
    }

    products.forEach((product) => {
        const divEl = document.createElement("div");
        divEl.className = "product-card";
        divEl.innerHTML = `
            <div class="product-badge">NEW</div>
            <img data-id=${product.id} src="${product.thumbnail}" alt="${product.title}">
            <div class="product-icons">
                <button class="wishlist-btn">🤍</button>
                <button class="view-btn">👁️</button>
            </div>
            <h3>${product.title}</h3>
            <p class="price">$${product.price}</p>
            <p class="rating">⭐ ${product.rating} (${product.stock})</p>
        `;
        wrapperEl.appendChild(divEl);
    });
}

wrapperEl.addEventListener("click", e => {
    if(e.target.tagName === "IMG"){
        // BOM
        open(`/pages/product.html?id=${e.target.dataset.id}`, "_self")
    }
    
})

function createDetailPage(data) {
    if (!data) {
        detailEl.innerHTML = "<p>Mahsulot haqida ma'lumot topilmadi.</p>";
        return;
    }

    detailEl.innerHTML = `
        <div class="product-detail-container">
            <div class="product-gallery">
                <img src="${data.images[0]}" alt="Main Image" id="mainImage">
                <div class="thumbnail-gallery">
                    ${data.images
                        .map(
                            (image, index) => `
                            <img src="${image}" alt="Thumbnail ${index + 1}" onclick="changeImage('${image}')">
                        `
                        )
                        .join("")}
                </div>
            </div>
            <div class="product-info">
                <h1>${data.title}</h1>
                <div class="product-meta">
                    <span class="rating">⭐ ${data.rating}</span>
                    <span class="stock-status">${
                        data.stock > 0 ? "In Stock" : "Out of Stock"
                    }</span>
                </div>
                <p class="price">$${data.price.toFixed(2)}</p>
                <p class="description">${data.description}</p>
                <button class="buy-now-button">Buy Now</button>
            </div>
        </div>
    `;
}

async function loadDetailPage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (id) {
        await fetchData(`/products/${id}`, createDetailPage);
    } else {
        detailEl.innerHTML = "<p>Mahsulot ID ko'rsatilmagan.</p>";
    }
}

function createCategory(data) {
    ["all", ...data].forEach((category) => {
        const listEl = document.createElement("li");
        listEl.className = category === "all" ? "item active" : "item";
        listEl.dataset.category = category === "all" ? "/products" : `/products/category/${category}`;
        listEl.textContent = category;
        collectionEl.appendChild(listEl);

        listEl.addEventListener("click", (e) => {
            let endpoint = e.target.dataset.category;

            wrapperEl.innerHTML = null; 
            createLoading(perPageCount);
            loadingEl.style.display = "grid";

            productEndpoint = endpoint;
            offset = 0;

            fetchData(`${endpoint}?limit=${perPageCount}`, (data) => {
                createCard(data.products);
            });

            document.querySelectorAll(".collection .item").forEach((i) => {
                i.classList.remove("active");
            });
            e.target.classList.add("active");
        });
    });
}




searchInputEl.addEventListener("keyup", async (e) => {
    const value = e.target.value.trim();

    if (value) {
        searchDropEl.style.display = "block";
        try {
            const response = await fetch(`${BASE_URL}/products/search?q=${value}&limit=5`);
            const res = await response.json();
            searchDropEl.innerHTML = "";

            if (res.products.length > 0) {
                res.products.forEach((item) => {
                    const divEl = document.createElement("div");
                    divEl.className = "search__item";
                    divEl.dataset.id = item.id;
                    divEl.innerHTML = `
                        <img src=${item.thumbnail} alt="">
                        <div>
                            <p>${item.title}</p>
                        </div>
                    `;
                    searchDropEl.appendChild(divEl);
                });
            } else {
                searchDropEl.innerHTML = "<p class='no-results'>No results found</p>";
            }
        } catch (err) {
            console.error("Qidiruv xatosi:", err);
        }
    } else {
        searchDropEl.style.display = "none";
        searchDropEl.innerHTML = "";
    }
});

searchDropEl.addEventListener("click", (e) => {
    const item = e.target.closest(".search__item");
    if (item) {
        const id = item.dataset.id;
        open(`/pages/product.html?id=${id}`, "_self");
        searchInputEl.value = "";
    }
});

btnSeemore.addEventListener("click", () => {
    btnSeemore.setAttribute("disabled", true);
    btnSeemore.textContent = "Loading...";
    offset++;

    fetchData(`${productEndpoint}?limit=${perPageCount}&skip=${offset * perPageCount}`, (data) => {
        createCard(data.products);
        btnSeemore.style.display = data.total <= perPageCount + offset * perPageCount ? "none" : "block";
        btnSeemore.removeAttribute("disabled");
        btnSeemore.textContent = "See more";
    });
});


window.addEventListener("load", () => {
    fetchData(`${productEndpoint}?limit=${perPageCount}&skip=0`, (data) => createCard(data.products));
    loadDetailPage();
});
