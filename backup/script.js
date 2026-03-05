// Service selection and modal handling
const modal = document.getElementById('uploadModal');
const closeBtn = document.querySelector('.close');
const serviceButtons = document.querySelectorAll('.select-service-btn');
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const previewArea = document.getElementById('previewArea');
const previewImage = document.getElementById('previewImage');
const changePhotoBtn = document.getElementById('changePhoto');
const continueBtn = document.getElementById('continueBtn');
const selectedServiceName = document.querySelector('.selected-service-name');

// Service names mapping
const serviceNames = {
    'bw-upscale': 'Black & White Upscale',
    'color-upscale': 'Color Photo Upscale',
    'colorize': 'Photo Colorization',
    'color-correction': 'Color Correction',
    'custom-ai': 'Custom AI Edit'
};

let currentService = '';

// Open modal when service is selected
serviceButtons.forEach(button => {
    button.addEventListener('click', function() {
        currentService = this.getAttribute('data-service');
        selectedServiceName.textContent = `Selected: ${serviceNames[currentService]}`;
        modal.style.display = 'block';
        resetUploadArea();
    });
});

// Close modal
closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
});

window.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// File upload handling
fileInput.addEventListener('change', handleFileSelect);

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        displayPreview(file);
    } else {
        alert('Please select a valid image file');
    }
}

// Drag and drop functionality
uploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    uploadArea.style.borderColor = '#667eea';
    uploadArea.style.background = '#f8f9ff';
});

uploadArea.addEventListener('dragleave', function(e) {
    e.preventDefault();
    uploadArea.style.borderColor = '#ddd';
    uploadArea.style.background = 'transparent';
});

uploadArea.addEventListener('drop', function(e) {
    e.preventDefault();
    uploadArea.style.borderColor = '#ddd';
    uploadArea.style.background = 'transparent';
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        displayPreview(file);
    } else {
        alert('Please drop a valid image file');
    }
});

// Display image preview
function displayPreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImage.src = e.target.result;
        uploadArea.style.display = 'none';
        previewArea.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// Change photo button
changePhotoBtn.addEventListener('click', function() {
    resetUploadArea();
});

// Reset upload area
function resetUploadArea() {
    uploadArea.style.display = 'block';
    previewArea.style.display = 'none';
    fileInput.value = '';
    previewImage.src = '';
}

// Continue to checkout
continueBtn.addEventListener('click', function() {
    alert(`Proceeding to checkout with ${serviceNames[currentService]}!\n\nIn a real implementation, this would:\n- Save the uploaded image\n- Calculate pricing based on frame size\n- Redirect to payment page`);
    modal.style.display = 'none';
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Contact form handling
const contactForm = document.querySelector('.contact-form');
contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    this.reset();
});

// Add scroll animation for service cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '0';
            entry.target.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                entry.target.style.transition = 'all 0.6s ease';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, 100);
            
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all service cards
document.querySelectorAll('.service-card').forEach(card => {
    observer.observe(card);
});

// Add navbar background on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'linear-gradient(135deg, #1a252f 0%, #2c3e50 100%)';
    } else {
        navbar.style.background = 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)';
    }
});

console.log('Heritage Frames website loaded successfully!');
console.log('Available services:', serviceNames);
