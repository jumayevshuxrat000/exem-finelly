const wrapperEl = document.querySelector(".product-grid");
const btnSeemore = document.querySelector(".see-more-btn");
const categoriesEL = document.querySelector(".categories")
const collectionEl = document.querySelector(".collection")
const searchInputEl = document.querySelector(".search-wrapper input")
const searchDropEl = document.querySelector(".search__drop")
const categoryLoadingEl = document.querySelector(".category__loading")
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



const BASE_URL = "https://dummyjson.com";

const perPageCount = 8;
let offset = 0;
let productEndpoint = "/products";

async function fetchData(endpoint) {
    createLoading(perPageCount)
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`);
        const data = await response.json();
        createCard(data.products);
        if (data.total <= perPageCount + offset * perPageCount) {
            btnSeemore.style.display = "none";
        } else {
            btnSeemore.style.display = "block";
        }
    } catch (err) {
        console.error("Ma'lumotlarni olishda xatolik:", err);
    } finally {
        btnSeemore.removeAttribute("disabled");
        btnSeemore.textContent = "See more";
        loadingEl.style.display = "none"
    }
}

async function fetchCategory(endpoint){
    const response = await fetch(`${BASE_URL}${endpoint}`)
    response
        .json()
        .then(res => {
            createCategory(res);
        })
        .catch()
        .finally(()=>{
            collectionEl.style.display = "flex"
            categoryLoadingEl.style.display = "none"
        })
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

btnSeemore.addEventListener("click", () => {
    btnSeemore.setAttribute("disabled", true);
    btnSeemore.textContent = "Loading...";
    offset++;

    fetchData(`${productEndpoint}?limit=${perPageCount}&skip=${offset * perPageCount}`);
});


function createCategory(data){
    ["all", ...data].forEach((category)=> {
        const listEl = document.createElement("li")
        listEl.className = category === "all" ? "item active" :  "item"
        listEl.dataset.category = category === "all" ? "/products" : `/products/category/${category}`
        listEl.textContent = category
        collectionEl.appendChild(listEl)
        listEl.addEventListener("click", (e)=>{
            let endpoint = e.target.dataset.category

            productEndpoint = endpoint
            offset = 0
            wrapperEl.innerHTML = null
            fetchData(`${endpoint}?limit=${perPageCount}`)
            document.querySelectorAll(".collection .item").forEach((i)=>{
                i.classList.remove("active")
            })
            e.target.classList.add("active")
        })
    })
}

window.addEventListener("load", () => {
    fetchData(`${productEndpoint}?limit=${perPageCount}&skip=0`);
    fetchCategory("/products/category-list")
});

wrapperEl.addEventListener("click", e => {
    if(e.target.tagName === "IMG"){
        // BOM
        open(`/pages/product.html?id=${e.target.dataset.id}`, "_self")
    }
    
})

searchInputEl.addEventListener("keyup", async (e) => {
    const value = e.target.value.trim();
    if (value) {
        searchDropEl.style.display = "block"; // Drop-down ko'rsatish
        try {
            const response = await fetch(`${BASE_URL}/products/search?q=${value}&limit=5`);
            const res = await response.json();
            searchDropEl.innerHTML = ""; // Oldingi natijalarni tozalash
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
            console.error("Search error:", err);
        }
    } else {
        searchDropEl.style.display = "none"; // Agar input bo'sh bo'lsa, drop-downni yashirish
        searchDropEl.innerHTML = ""; // Natijalarni tozalash
    }
});

searchDropEl.addEventListener("click", e => {
    if(e.target.closest(".search__item")?.className === "search__item"){
        const id = e.target.closest(".search__item").dataset.id
        open(`/pages/product.html?id=${id}`, "_self")
        searchInputEl.value = ""
    }
})
