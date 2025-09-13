const API_BASE = window.location.origin;
const token = localStorage.getItem('token');

// Redirect non-admin
const user = JSON.parse(localStorage.getItem('user'));
if (!user || user.role !== 'admin') {
    window.location.href = '/login';
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

// Load hostels into table
async function loadHostels() {
    try {
        const res = await fetch(`${API_BASE}/api/hostels`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const hostels = await res.json();
        const container = document.getElementById('hostelsContainer');
        container.innerHTML = '';

        hostels.forEach(h => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td contenteditable="true" data-field="name" data-id="${h._id}">${h.name}</td>
                <td contenteditable="true" data-field="location" data-id="${h._id}">${h.location}</td>
                <td contenteditable="true" data-field="price" data-id="${h._id}">${h.price}</td>
                <td contenteditable="true" data-field="ratings" data-id="${h._id}">${h.ratings}</td>
                <td><input type="text" value="${h.images?.[0] || ''}" data-field="images" data-id="${h._id}" class="form-control form-control-sm"></td>
                <td>
                    <button class="btn btn-sm btn-primary update-btn" data-id="${h._id}">Update</button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${h._id}">Delete</button>
                </td>
            `;
            container.appendChild(tr);
        });

        document.querySelectorAll('.update-btn').forEach(btn => btn.addEventListener('click', updateHostel));
        document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', deleteHostel));

    } catch (err) {
        console.error(err);
        alert('Error loading hostels');
    }
}

// Add new hostel
document.getElementById('addHostelForm').addEventListener('submit', async e => {
  e.preventDefault();
 const newHostel = {
  name: document.getElementById('hostelName').value,
  description: document.getElementById('hostelDescription').value, // Added this line
  location: document.getElementById('hostelLocation').value,
  price: Number(document.getElementById('hostelPrice').value),
  ratings: Number(document.getElementById('hostelRating').value),
  images: document.getElementById('hostelImage').value ? [document.getElementById('hostelImage').value] : []
};
  try {
    const res = await fetch(`${API_BASE}/api/hostels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newHostel)
    });

    const data = await res.json().catch(() => ({}));
    console.log('Add hostel response:', res.status, data);

    if (res.ok) {
      alert('Hostel added successfully');
      loadHostels();
      e.target.reset();
    } else {
      alert(data.message || 'Error adding hostel');
    }
  } catch (err) {
    console.error('Add hostel error:', err);
    alert('Error adding hostel');
  }
});

// Update hostel
async function updateHostel(e) {
    const id = e.target.dataset.id;
    const tr = e.target.closest('tr');
    const updatedHostel = {
        name: tr.querySelector('[data-field="name"]').innerText,
        location: tr.querySelector('[data-field="location"]').innerText,
        price: Number(tr.querySelector('[data-field="price"]').innerText),
        ratings: Number(tr.querySelector('[data-field="ratings"]').innerText),
        images: [tr.querySelector('[data-field="images"]').value]
    };

    try {
        const res = await fetch(`${API_BASE}/api/hostels/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedHostel)
        });
        if (res.ok) {
            alert('Hostel updated successfully');
            loadHostels();
        } else {
            const data = await res.json();
            alert(data.message || 'Error updating hostel');
        }
    } catch (err) {
        console.error(err);
        alert('Error updating hostel');
    }
}

// Delete hostel
async function deleteHostel(e) {
    const id = e.target.dataset.id;
    if (!confirm('Are you sure you want to delete this hostel?')) return;

    try {
        const res = await fetch(`${API_BASE}/api/hostels/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            alert('Hostel deleted successfully');
            loadHostels();
        } else {
            const data = await res.json();
            alert(data.message || 'Error deleting hostel');
        }
    } catch (err) {
        console.error(err);
        alert('Error deleting hostel');
    }
}

// Initial load
loadHostels();