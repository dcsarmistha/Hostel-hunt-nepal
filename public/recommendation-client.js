// Client-side recommendation logic
async function getPersonalizedRecommendations(userId, limit = 5) {
    try {
        const response = await fetch(`/api/recommendations?userId=${userId}&limit=${limit}`);
        const recommendations = await response.json();
        return recommendations;
    } catch (error) {
        console.error('Error getting recommendations:', error);
        return [];
    }
}

// Display recommendations on the page
async function displayRecommendations() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    
    const recommendations = await getPersonalizedRecommendations(user._id, 5);
    const container = document.getElementById('recommendationsContainer');
    
    if (!container || recommendations.length === 0) return;
    
    container.innerHTML = '<h3>Recommended for You</h3>';
    
    recommendations.forEach(hostel => {
        const card = createHostelCard(hostel);
        container.appendChild(card);
    });
}

// Initialize recommendations when page loads
if (document.getElementById('recommendationsContainer')) {
    displayRecommendations();
}