// Elementlar va API manzili
const loginInputEl = document.querySelector(".input__user");
const passwordEL = document.querySelector(".input__pass");
const formEL = document.querySelector(".form");
const BASE_URL = "https://dummyjson.com";

function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split(".")[1])); 
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime; 
}

async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
        console.warn("Refresh token not found");
        return false;
    }

    try {
        const response = await fetch(`${BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            throw new Error("Failed to refresh token");
        }

        const data = await response.json();
        localStorage.setItem("accessToken", data.accessToken);
        return true;
    } catch (err) {
        console.error("Error refreshing token:", err);
        localStorage.clear(); // Tokenlarni tozalash
        alert("Session expired. Please log in again.");
        window.location.href = "/login.html";
        return false;
    }
}

async function ensureValidToken() {
    const token = localStorage.getItem("accessToken");

    if (token && isTokenExpired(token)) {
        console.log("Token expired. Refreshing...");
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
            throw new Error("Token refresh failed");
        }
    }
}

formEL.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = {
        username: loginInputEl.value,
        password: passwordEL.value,
    };

    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
        });

        if (!response.ok) {
            throw new Error("Username or password incorrect");
        }

        const data = await response.json();
        localStorage.setItem("accessToken", data.token); // Asosiy token
        localStorage.setItem("refreshToken", data.refreshToken); // Yangilash tokeni
        alert("Login successful!");
        window.location.href = "/index.html";
    } catch (err) {
        alert(err.message);
    }
});

// Himoyalangan ma'lumotlarni olish
async function fetchProtectedData(endpoint) {
    await ensureValidToken(); // Tokenni tekshirish va yangilash
    const token = localStorage.getItem("accessToken");

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch protected data");
        }

        const data = await response.json();
        console.log("Protected data:", data);
        return data;
    } catch (err) {
        console.error("Error fetching data:", err);
    }
}

window.addEventListener("load", async () => {
    try {
        const data = await fetchProtectedData("/products");
        console.log("Loaded protected data:", data);
    } catch (err) {
        console.error(err);
    }
});
