// document.addEventListener('DOMContentLoaded', function() {  
//     const employeeId = { employee_id };

//     fetch(`/users?name=${encodeURIComponent(employeeId)}`)
//         .then(response => {  
//             return response.json();
//         })  
//         .then(data => {  
//             document.getElementById('employee-name').innerText = data.name;  
//             const imagesContainer = document.getElementById('profile-images');  
//             imagesContainer.innerHTML = ''; // Clear any existing images  

//             data.images.forEach(imageUrl => {  
//                 const img = document.createElement('img');  
//                 img.src = imageUrl; // Set the image source  
//                 img.alt = "Uploaded Img"; // Set the alt text  
//                 imagesContainer.appendChild(img); // Append the image to the container  
//             });  
//         })  
//         .catch(error => {  
//             console.error('Error fetching employee data:', error); // Log any errors  
//         });  
// });

document.addEventListener('DOMContentLoaded', () => {  
    const addImageButton = document.getElementById('add-image-button');  

    addImageButton.addEventListener('click', () => {  
        const gallery = document.querySelector('.gallery');  
        const newImageCard = document.createElement('div');  
        newImageCard.className = 'image-card';  
        
        newImageCard.innerHTML = `  
            <img src="new_image.jpg" alt="New Image">  
            <div class="image-info">  
                <input type="text" value="New Image" class="image-name">  
                <button class="delete-button">Delete</button>  
            </div>  
        `;  

        gallery.appendChild(newImageCard);  

        // Add event listener for the delete button  
        newImageCard.querySelector('.delete-button').addEventListener('click', () => {  
            gallery.removeChild(newImageCard);  
        });  
    });  

    // Add delete functionality to existing delete buttons  
    document.querySelectorAll('.delete-button').forEach(button => {  
        button.addEventListener('click', (event) => {  
            const card = event.target.closest('.image-card');  
            card.parentNode.removeChild(card);  
        });  
    });  
});