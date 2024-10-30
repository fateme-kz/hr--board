//back button to home page
function reloadPage() {  
    window.location.href = '/hr/'; // Change the URL to the desired route  
}


// we use this function in list.js to get the image when user choose that
document.getElementById('image-preview').addEventListener('change', function(event) {  
    const file = event.target.files[0]; // Get the first uploaded file  
    const uploadedImage = document.getElementById('uploaded-image');  

    if (file) {  
        const reader = new FileReader();  

        // Read the file as an ArrayBuffer (binary data)  
        reader.readAsArrayBuffer(file);   

        reader.onload = function(e) {  
            const arrayBuffer = e.target.result; // This is the binary data  
            const blob = new Blob([arrayBuffer], { type: file.type }); // Create a new Blob object  
            const url = URL.createObjectURL(blob); // Create a URL for the Blob  

            uploadedImage.src = url; // Set the src of img to Blob URL  
            uploadedImage.style.display = 'block'; // Show the image  
        };  
        // Read the file here  
        reader.readAsArrayBuffer(file);   
    }  
});



// delete image
const deleteButtons = document.querySelectorAll('.delete-button');  
deleteButtons.forEach(deleteButton => {  
    deleteButton.addEventListener('click', function () {  
        // console.log(this)
        if (confirm('Are you sure you want to delete this image?')) {  
            const imageId = this.getAttribute('data-image-id');  
            console.log(`Attempting to delete image with ID: ${imageId}`);  

            // Prevent the form from submitting  
            event.preventDefault();   

            console.log(`URL for DELETE request: /hr/delete_image/${imageId}`);
            // Make a DELETE request to the backend  
            fetch(`/hr/delete_image/${imageId}`, {   
                method: 'DELETE'   
            })  
            .then(response => {  
                if (!response.ok) {  
                    throw new Error(`HTTP error! Status: ${response.status}`);  
                }  
                return response.json();  
            })  
            .then(data => {  
                console.log('Delete response:', data);  

                // Check for successful deletion  
                if (data.message) {  
                    const imageContainer = document.getElementById(`image-container-${imageId}`); // Check ID consistency  
                    if (imageContainer) {  
                        imageContainer.remove();  
                        alert('Image deleted successfully!'); // User feedback  
                    }  
                } else if (data.error) {  
                    alert(data.error);  
                }  
            })  
            .catch(error => {  
                console.error('Error deleting image:', error);  

                // Check if it was a network error  
                if (error.message === 'Failed to fetch') {  
                    alert('Network error: Please check your connection or the server status.');  
                } else {  
                    alert('An error occurred while deleting the image. ' + error.message);  
                }  
            });  
        }  
    });  
});  