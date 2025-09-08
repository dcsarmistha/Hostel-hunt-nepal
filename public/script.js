// API base URL
const API_BASE = window.location.origin;

// Frontend JS
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    updateAuthUI(user);

    if (document.getElementById('hostelsContainer')) {
        loadHostels();
    }
 if (document.getElementById('recommendationsContainer')) {
        loadRecommendations();
    }

    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) searchBtn.addEventListener('click', searchHostels);

    // Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            login(email, password);
        });
    }

    // Signup
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;

            if (password !== confirmPassword) {
                showAlert('Passwords do not match', 'danger');
                return;
            }

            register(name, email, password);
        });
    }
});

// Show alerts
function showAlert(message, type = 'success') {
    const alertBox = document.createElement('div');
    alertBox.className = `alert alert-${type} text-center`;
    alertBox.textContent = message;
    document.body.prepend(alertBox);

    setTimeout(() => alertBox.remove(), 3000);
}

// Update navbar/auth buttons
function updateAuthUI(user) {
    const authButtons = document.getElementById('authButtons');
    if (!authButtons) return;

    if (user && user.token) {
        authButtons.innerHTML = `
            <span class="navbar-text me-3">Hello, ${user.name}</span>
            <button class="btn btn-outline-light" onclick="logout()">Logout</button>
        `;
    } else {
        authButtons.innerHTML = `
            <a href="/login" class="btn btn-outline-light me-2">Login</a>
            <a href="/signup" class="btn btn-primary">Sign Up</a>
        `;
    }
}

// Load hostels
async function loadHostels() {
  try {
    const res = await fetch(`${API_BASE}/api/hostels`);
    const hostels = await res.json();
    console.log('Loaded hostels:', hostels);

    const container = document.getElementById('hostelsContainer');
    container.innerHTML = '';

    if (!hostels.length) {
      container.innerHTML = '<p>No hostels available right now.</p>';
      return;
    }

    hostels.forEach(h => container.appendChild(createHostelCard(h)));
  } catch (err) {
    console.error('Error loading hostels:', err);
  }
}

// ✅ Load personalized recommendations
async function loadRecommendations() {
    try {
        const response = await fetch(`${API_BASE}/api/recommendations`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const hostels = await response.json();

        const container = document.getElementById('recommendationsContainer');
        if (!container) return;

        container.innerHTML = '';
        if (hostels.length === 0) {
            container.innerHTML = '<div class="col-12 text-center"><p>No recommendations yet.</p></div>';
            return;
        }

        hostels.forEach(h => {
            const card = createHostelCard(h); // You already have this function
            container.appendChild(card);
        });
    } catch (err) {
        console.error('Error loading recommendations:', err);
    }
}

// Create hostel card
function createHostelCard(hostel) {
    const div = document.createElement('div');
    div.className = 'col-md-4';
    div.innerHTML = `
        <div class="card hostel-card">
            <img src="${hostel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'}" class="card-img-top hostel-image">
            <div class="card-body">
                <h5 class="card-title">${hostel.name}</h5>
                <p class="card-text">${hostel.location}</p>
                <p class="price">$${hostel.price}</p>
                <p class="rating">${'★'.repeat(Math.floor(hostel.ratings))}${'☆'.repeat(5-Math.floor(hostel.ratings))} (${hostel.ratings})</p>
            </div>
        </div>
    `;
    return div;
}

// Search hostels
async function searchHostels() {
    const location = document.getElementById('locationInput').value;
    const minPrice = document.getElementById('minPriceInput').value;
    const maxPrice = document.getElementById('maxPriceInput').value;
    const rating = document.getElementById('ratingInput').value;

    let url = `${API_BASE}/api/hostels?`;
    if (location) url += `location=${location}&`;
    if (minPrice) url += `minPrice=${minPrice}&`;
    if (maxPrice) url += `maxPrice=${maxPrice}&`;
    if (rating) url += `minRating=${rating}&`;

    try {
        const res = await fetch(url);
        const hostels = await res.json();
        const container = document.getElementById('hostelsContainer');
        container.innerHTML = '';
        if (!hostels.length) {
            container.innerHTML = '<div class="col-12 text-center"><p>No hostels found.</p></div>';
            return;
        }
        hostels.forEach(h => container.appendChild(createHostelCard(h)));
    } catch (err) {
        console.error(err);
        showAlert('Error searching hostels', 'danger');
    }
}

// Login
async function login(email, password) {
    try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            updateAuthUI(data);
            window.location.href = data.role === 'admin' ? '/admin' : '/';
        } else {
            showAlert(data.message || 'Login failed', 'danger');
        }
    } catch (err) {
        console.error(err);
        showAlert('Login error', 'danger');
    }
}

// Register
async function register(name, email, password) {
    try {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            updateAuthUI(data);
            window.location.href = '/';
        } else {
            showAlert(data.message || 'Registration failed', 'danger');
        }
    } catch (err) {
        console.error(err);
        showAlert('Registration error', 'danger');
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateAuthUI(null);
    window.location.href = '/';
}
