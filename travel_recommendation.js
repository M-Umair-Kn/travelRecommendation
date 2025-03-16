// Global variables
let allRecommendations = [];
let currentSection = 'home';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    document.getElementById('contact-form').addEventListener('submit', handleFormSubmit);
    
    // Fetch the travel recommendations from the JSON file
    fetchRecommendations();
});

// Fetch recommendations data
function fetchRecommendations() {
    fetch('travel_recommendation_api.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            allRecommendations = data;
            // Initially hide the recommendations section
            document.getElementById('recommendations').classList.remove('active-section');
        })
        .catch(error => {
            console.error('Error fetching travel recommendations:', error);
            document.getElementById('travel-container').innerHTML = 
                '<p style="color: red; text-align: center;">Error loading travel recommendations. Please try again later.</p>';
        });
}

// Display recommendations based on the data provided
function displayTravelRecommendations(recommendationsData) {
    const travelContainer = document.getElementById('travel-container');
    
    // Clear any existing content
    travelContainer.innerHTML = '';
    
    // Check if data exists and is an array
    if (!recommendationsData || !Array.isArray(recommendationsData) || recommendationsData.length === 0) {
        travelContainer.innerHTML = '<p style="text-align: center; margin-top: 20px;">No travel recommendations match your search. Try a different keyword.</p>';
        return;
    }
    
    // Show the recommendations section and hide other sections
    showSection('recommendations');
    
    // Create a card for each travel recommendation
    recommendationsData.forEach(recommendation => {
        const card = document.createElement('div');
        card.className = 'travel-card';
        
        const image = recommendation.image ? recommendation.image : 'https://via.placeholder.com/300x200?text=No+Image+Available';
        
        // Get the local time for the destination if the optional feature is implemented
        const localTime = getLocalTime(recommendation.country);
        
        card.innerHTML = `
            <img src="${image}" alt="${recommendation.destination}">
            <div class="card-content">
                <h3>${recommendation.destination}</h3>
                <p><strong>Country:</strong> ${recommendation.country}</p>
                <p><strong>Category:</strong> ${recommendation.category}</p>
                <p>${recommendation.description}</p>
                <p class="rating"><strong>Rating:</strong> ${recommendation.rating} / 5</p>
                ${localTime ? `<p><strong>Local Time:</strong> ${localTime}</p>` : ''}
            </div>
        `;
        
        travelContainer.appendChild(card);
    });
}

// Search recommendations based on user input
function searchRecommendations() {
    const searchInput = document.getElementById('search-input').value.trim().toLowerCase();
    
    // If search input is empty, show a message
    if (!searchInput) {
        alert('Please enter a search term like "beach", "temple", or a country name.');
        return;
    }
    
    // Filter recommendations based on the search input
    const filteredRecommendations = allRecommendations.filter(recommendation => {
        // Check for matches in destination, country, category, or description
        const matchesDestination = recommendation.destination.toLowerCase().includes(searchInput);
        const matchesCountry = recommendation.country.toLowerCase().includes(searchInput);
        const matchesCategory = recommendation.category.toLowerCase().includes(searchInput);
        const matchesDescription = recommendation.description.toLowerCase().includes(searchInput);
        
        // Special case for common search terms
        const isBeach = (searchInput === 'beach' || searchInput === 'beaches' || searchInput === 'BEACH' || searchInput === 'Beach') && 
                       (recommendation.category.toLowerCase().includes('beach') || 
                        recommendation.description.toLowerCase().includes('beach'));
        
        const isTemple = (searchInput === 'temple' || searchInput === 'temples' || searchInput === 'TEMPLE' || searchInput === 'Temple') && 
                        (recommendation.category.toLowerCase().includes('temple') || 
                         recommendation.description.toLowerCase().includes('temple') ||
                         recommendation.category.toLowerCase().includes('cultural'));
        
        return matchesDestination || matchesCountry || matchesCategory || matchesDescription || isBeach || isTemple;
    });
    
    // Display the filtered recommendations
    displayTravelRecommendations(filteredRecommendations);
}

// Clear search results
function clearResults() {
    document.getElementById('search-input').value = '';
    document.getElementById('travel-container').innerHTML = '';
    
    // Go back to home page
    showSection('home');
}

// Show the selected section and hide others
function showSection(sectionId) {
    // Update the current section
    currentSection = sectionId;
    
    // Hide all sections
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(section => {
        section.classList.remove('active-section');
    });
    
    // Show the selected section
    document.getElementById(sectionId).classList.add('active-section');
    
    // Update active navigation link
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick').includes(sectionId)) {
            link.classList.add('active');
        }
    });
    
    // Hide search bar in about and contact pages, show in home and recommendations
    const searchContainer = document.querySelector('.search-container');
    if (sectionId === 'about' || sectionId === 'contact') {
        searchContainer.style.display = 'none';
    } else {
        searchContainer.style.display = 'flex';
    }
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    // In a real application, you would send this data to a server
    console.log('Form submitted:', { name, email, message });
    
    // Show a success message
    alert(`Thank you, ${name}! Your message has been sent. We'll get back to you soon.`);
    
    // Reset the form
    document.getElementById('contact-form').reset();
    
    // Redirect to home page
    showSection('home');
}

// Optional: Get local time for a country (simplified approach)
function getLocalTime(country) {
    // Map of countries to time zones (simplified)
    const timeZones = {
        'France': 'Europe/Paris',
        'Japan': 'Asia/Tokyo',
        'United States': 'America/New_York',
        'Indonesia': 'Asia/Jakarta',
        'Greece': 'Europe/Athens',
        'Tanzania': 'Africa/Dar_es_Salaam'
    };
    
    // If we have a time zone for this country, get the local time
    if (timeZones[country]) {
        try {
            const options = { 
                timeZone: timeZones[country], 
                hour12: true, 
                hour: 'numeric', 
                minute: 'numeric',
                second: 'numeric',
                weekday: 'long',
                month: 'short',
                day: 'numeric'
            };
            
            return new Date().toLocaleString('en-US', options);
        } catch (error) {
            console.error('Error getting local time:', error);
            return null;
        }
    }
    
    return null;
} 