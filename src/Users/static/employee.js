document.addEventListener('DOMContentLoaded', function() {  
    const employeeId = { employee_id };

    fetch(`/users?name=${encodeURIComponent(employeeId)}`)
        .then(response => {  
            return response.json();
        })  
        .then(data => {  
            document.getElementById('employee-name').innerText = data.name;  
            const imagesContainer = document.getElementById('profile-images');  
            imagesContainer.innerHTML = ''; // Clear any existing images  

            data.images.forEach(imageUrl => {  
                const img = document.createElement('img');  
                img.src = imageUrl; // Set the image source  
                img.alt = "Uploaded Img"; // Set the alt text  
                imagesContainer.appendChild(img); // Append the image to the container  
            });  
        })  
        .catch(error => {  
            console.error('Error fetching employee data:', error); // Log any errors  
        });  
});