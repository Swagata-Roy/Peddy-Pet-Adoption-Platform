// Global variables
let allPets = [];
let currentCategory = '';
let likedPets = new Set();

// Show loading spinner and clear content
function showLoading() {
    const container = document.getElementById('pet-container');
    // Clear existing content and add centered spinner
    container.innerHTML = `
        <div class="min-h-[400px] w-full flex justify-center items-center bg-white">
            <span class="loading loading-spinner loading-lg text-mainColor"></span>
        </div>
    `;
}

// Scroll to adopt section
function scrollToAdopt() {
    document.getElementById('adopt-section').scrollIntoView({ behavior: 'smooth' });
}

// Fetch and display categories
async function loadCategories() {
    try {
        const response = await fetch('https://openapi.programming-hero.com/api/peddy/categories');
        const data = await response.json();
        
        const categoriesContainer = document.getElementById('categories');
        categoriesContainer.innerHTML = data.categories.map(category => `
            <button onclick="filterByCategory('${category.category.toLowerCase()}')" 
                    class="flex items-center gap-2 px-3 md:px-6 py-2 text-sm md:text-base rounded-full whitespace-nowrap ${currentCategory === category.category.toLowerCase() ? 'bg-mainColor text-white' : 'bg-base-200'}">
                <img src="${category.category_icon}" alt="${category.category}" class="w-4 h-4 md:w-6 md:h-6"/>
                ${category.category}
            </button>
        `).join('');
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Fetch and display pets
async function loadPets(category = '') {
    try {
        showLoading();
        
        const url = category 
            ? `https://openapi.programming-hero.com/api/peddy/category/${category}`
            : 'https://openapi.programming-hero.com/api/peddy/pets';
            
        const response = await fetch(url);
        const data = await response.json();
        
        allPets = category ? data.data : data.pets;
        
        // Wait for 2 seconds before showing new content
        await new Promise(resolve => setTimeout(resolve, 2000));
        displayPets(allPets);
        
    } catch (error) {
        console.error('Error loading pets:', error);
        displayPets([]); // Show no pets message if error occurs
    }
}

 // Update displayPets function
 function displayPets(pets) {
    const container = document.getElementById('pet-container');
    
    if (pets.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-10">
                <img src="images/error.webp" alt="No pets found" class="w-32 h-32 mx-auto mb-4"/>
                <h3 class="text-xl font-bold">No Pets Available</h3>
                <p class="text-gray-600">No pets found in this category. Please try another category.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${pets.map(pet => `
                <div class="card bg-base-100 shadow-xl">
                    <figure class="px-4 pt-4">
                        <img src="${pet.image}" alt="${pet.pet_name}" class="rounded-xl h-48 w-full object-cover"/>
                    </figure>
                    <div class="card-body">
                        <h2 class="card-title">${pet.pet_name || 'Unnamed Pet'}</h2>
                        <div class="space-y-2">
                            <p><span class="font-semibold">Breed:</span> ${pet.breed || 'Unknown'}</p>
                            <p><span class="font-semibold">Birth:</span> ${pet.date_of_birth || 'Unknown'}</p>
                            <p><span class="font-semibold">Gender:</span> ${pet.gender || 'Unknown'}</p>
                            <p><span class="font-semibold">Price:</span> $${pet.price || 'Contact for price'}</p>
                        </div>
                        <div class="card-actions mt-4">
                            <button class="btn btn-ghost" onclick="toggleLike('${pet.petId}', '${pet.image}')">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 ${likedPets.has(pet.petId.toString()) ? 'text-red-500 fill-current' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                            <button class="btn text-mainColor adopt-btn" onclick="handleAdopt(this)">Adopt</button>
                            <button class="btn text-mainColor" onclick="showPetDetails('${pet.petId}')">Details</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Filter pets by category
function filterByCategory(category) {
    currentCategory = category;
    loadPets(category);
    loadCategories(); // Refresh category buttons
}

// Update sortByPrice function
function sortByPrice() {
    const petsToSort = currentCategory ? 
        allPets.filter(pet => pet.category.toLowerCase() === currentCategory) : 
        allPets;
    
    const sortedPets = [...petsToSort].sort((a, b) => {
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        return priceB - priceA;
    });
    
    displayPets(sortedPets);
}

// Toggle like for a pet
function toggleLike(petId, petImage) {
    if (likedPets.has(petId)) {
        likedPets.delete(petId);
    } else {
        likedPets.add(petId);
    }
    updateLikedPetsDisplay();
    displayPets(allPets); // Refresh heart icons
}

// Update liked pets display
function updateLikedPetsDisplay() {
    const container = document.getElementById('liked-pets');
    container.innerHTML = Array.from(likedPets).map(petId => {
        const pet = allPets.find(p => p.petId.toString() === petId);
        return pet ? `
            <div class="relative group">
                <img src="${pet.image}" alt="${pet.pet_name}" class="w-full h-32 object-cover rounded-lg"/>
            </div>
        ` : '';
    }).join('');
}

// Handle adopt button click
function handleAdopt(button) {
    // Create and show modal
    const modal = document.createElement('dialog');
    modal.className = 'modal modal-open';
    modal.innerHTML = `
        <div class="modal-box relative bg-white rounded-lg shadow-2xl p-10 transform transition-all duration-200 scale-100 opacity-100">
            <div class="flex flex-col items-center">
                <h3 class="text-2xl font-bold mb-4">Congratulations</h3>
                <p class="mb-4">Adopting in progress</p>
                <div class="text-6xl font-bold text-mainColor mb-4 countdown">3</div>
                <p class="text-gray-600">Please wait while we process your adoption...</p>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop bg-black/30 fixed inset-0 flex items-center justify-center">
            <button class="cursor-default">close</button>
        </form>
    `;
    document.body.appendChild(modal);
    modal.showModal();

    let count = 3;
    button.disabled = true;

    const countdownInterval = setInterval(() => {
        count--;
        const countdownElement = modal.querySelector('.countdown');
        if (count > 0) {
            countdownElement.textContent = count;
        } else {
            clearInterval(countdownInterval);
            // Add a small delay before removing modal
            setTimeout(() => {
                modal.close();
                setTimeout(() => modal.remove(), 300); // Remove after animation
                button.textContent = 'Adopted';
                button.classList.add('btn-success');
            }, 500);
        }
    }, 1000);
}

// pet details modal
async function showPetDetails(petId) {
    try {
        // Show loading
        const modalContent = document.getElementById('modal-content');
        modalContent.innerHTML = `
            <div class="flex justify-center items-center min-h-[400px]">
                <span class="loading loading-spinner loading-lg text-mainColor"></span>
            </div>
        `;
        
        // Show modal first
        document.getElementById('pet-modal').showModal();

        // Fetch data
        const response = await fetch(`https://openapi.programming-hero.com/api/peddy/pet/${petId}`);
        const data = await response.json();
        
        if (!data.status) {
            throw new Error('Failed to fetch pet details');
        }

        // Wait for 2 seconds minimum
        await new Promise(resolve => setTimeout(resolve, 2000));

        const pet = data.petData;
        modalContent.innerHTML = `
            <img src="${pet.image}" alt="${pet.pet_name}" class="w-full h-64 object-cover rounded-lg mb-4"/>
            <div class="space-y-4">
                <h3 class="text-2xl font-bold">${pet.pet_name || 'Unnamed Pet'}</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <p><span class="font-semibold">Breed:</span> ${pet.breed || 'Unknown'}</p>
                        <p><span class="font-semibold">Birth Date:</span> ${pet.date_of_birth || 'Unknown'}</p>
                        <p><span class="font-semibold">Gender:</span> ${pet.gender || 'Unknown'}</p>
                        <p><span class="font-semibold">Price:</span> $${pet.price || 'Contact for price'}</p>
                    </div>
                    <div class="space-y-2">
                        <p><span class="font-semibold">Category:</span> ${pet.category || 'Unknown'}</p>
                        <p><span class="font-semibold">Location:</span> ${pet.location || 'Unknown'}</p>
                        <p><span class="font-semibold">Vaccination:</span> ${pet.vaccinated_status || 'Unknown'}</p>
                        <p><span class="font-semibold">Training:</span> ${pet.training_status ? 'Yes' : 'No'}</p>
                    </div>
                </div>
                <div class="mt-4">
                    <h4 class="font-semibold mb-2">Description:</h4>
                    <p class="text-gray-600">${pet.pet_details || 'No description available.'}</p>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error fetching pet details:', error);
        document.getElementById('modal-content').innerHTML = `
            <div class="text-center py-8">
                <p class="text-red-500">Failed to load pet details. Please try again.</p>
            </div>
        `;
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadPets();
});