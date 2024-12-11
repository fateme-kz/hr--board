// Func to display images, the old and the news
function fetchAndDisplayImages(employeeId) {  
    fetch(`/hr/get_employee_details/${employeeId}`)
        .then(response => response.json())
        .then(employee => {
            if (employee.error) {
                alert(employee.error);
                return;
            }


            document.querySelector('.input-Fname').value = employee.name;
            document.querySelector('.input-Lname').value = employee.last_name;
            document.querySelector('.input-company').value = employee.company_name;
            document.querySelector('.input-description').value = employee.description;
            
            // Display the first image
            const firstImageUrl =  employee.image_data[0];
            fetch(firstImageUrl)
                .then(imgResponse => imgResponse.blob())
                .then(imageBlob => {
                    const reader = new FileReader();
                    reader.onloadend = function() {
                        const base64data = reader.result;

                        // find the image preview element
                        const imagePreview = document.getElementById('employee-image-preview');
                        if (imagePreview) {
                            imagePreview.src = base64data;
                            imagePreview.style.display = 'block';
                            imagePreview.style.objectFit = 'cover';
                        } else {
                            console.error('image preview element not found!');
                        }
                    };
                    
                    // convert Blob to base64
                    reader.readAsDataURL(imageBlob); 
                })
                .catch(error => 
                    console.error('error loading first image')
                );


            // query and select placeholder to put the other images init
            const imagePlaceholders = document.querySelectorAll('.placeholder');

            // Display existing images from DB
            // loop for each image URL in the employee.image_data array
            employee.image_data.forEach((imageUrl, index) => {

                const imageId = employee.image_id[index];

                // fetch image URL
                fetch(imageUrl)

                    // once the image is fetched successfully, convert the response to a blob
                    .then(imgResponse => imgResponse.blob())   

                    // after converting to blob, handle the blob data
                    .then(imageBlob => {  

                        // create new FileReader object to read blob data
                        const reader = new FileReader();  

                        // set up an event listener that runs when FileReader has finished reding the data
                        reader.onloadend = function() {  

                            // get the result of the read operation, which is a base64 string of the image
                            const base64data = reader.result;

                            // create 'img' element
                            const imgElement = document.createElement('img');
                            imgElement.src = base64data;
                            imgElement.classList.add('uploaded-image');


                            // Create the delete button

                            const base64dataPrime = reader.result;
                            const deleteImageButton = document.createElement('button');
                            deleteImageButton.src = base64dataPrime;
                            deleteImageButton.classList.add('delete-image-button');
                            deleteImageButton.textContent = 'حذف';
                            deleteImageButton.onclick = function(event) {
                                // Prevent the form's default submission behavior
                                event.preventDefault();
                                event.stopPropagation(); // Prevent propagation to parent elements
                                deleteImage(imageId);
                            };

                            const placeholder = imagePlaceholders[index];  
                            placeholder.style.position = 'relative'; // Ensures children position relative to this
                            placeholder.innerHTML = ''; // Clear previous contents, if any  
                            placeholder.appendChild(imgElement);  
                            placeholder.appendChild(deleteImageButton);

                        };
                        reader.readAsDataURL(imageBlob);
                    })
                    .catch(error => console.error("Error loading image:", error));
                
            });

            // Add file inputs for uploading new images
            imagePlaceholders.forEach((placeholder, index) => {
                // Clear existing content in case of rerun
                if (!placeholder.querySelector('.employee-image-input')) {
                    const inputElement = document.createElement('input');
                    inputElement.type = 'file';
                    inputElement.accept = 'image/*';
                    inputElement.classList.add('employee-image-input');
                    inputElement.onchange = previewImage;
                    if (!placeholder.querySelector('.uploaded-image')) {
                        placeholder.appendChild(inputElement);
                    }                
                }
            });
        })
        .catch(error => console.error("Error fetching employee details:", error));
}




let cropper;  // Global variable to hold the cropper instance

function initializeCropper(imageElement) {
    if (cropper) {
        cropper.destroy(); // Destroy the previous cropper instance if it exists
    }
    cropper = new Cropper(imageElement, {
        aspectRatio: 1,  // Set the aspect ratio (optional)
        viewMode: 1,  // Set the view mode for cropping (optional)
        autoCropArea: 0.65,  // Adjust the crop area (optional)
        responsive: true,  // Make it responsive (optional)
    });
}





function previewImage(event) {
    console.log("File selected:", event.target.files[0]); // Check the selected file
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = function () {
            console.log("File read successfully:", reader.result); // Ensure file is read as Base64

            // Find the placeholder
            const placeholder = event.target.closest('.placeholder');
            if (!placeholder) {
                console.error("Placeholder not found for the selected file input.");
                return;
            }

            // Check if an image is already displayed
            let imgElement = placeholder.querySelector('.uploaded-image');
            if (!imgElement) {
                // Create a new image element if none exists
                imgElement = document.createElement('img');
                imgElement.classList.add('uploaded-image');
                imgElement.style.width = '100%';
                imgElement.style.height = '100%';
                imgElement.style.display = 'block';

                
                // Append the image to the placeholder without removing the file input
                placeholder.appendChild(imgElement);
                

            }

            // Update the image source with the new preview
            imgElement.src = reader.result;

            // Optionally log or handle additional actions
            console.log("Image preview updated. Ready for submission.");
        };
        reader.readAsDataURL(file);
    }
}


// function to delete image using delete button
function deleteImage(imageId) {

    // check the image id in console
    console.log('image id in deleting image func:', imageId);
    
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this image?')) return;

    console.log(`Attempting to delete image with ID: ${imageId}`);

    // Make a DELETE request
    fetch(`/hr/delete_image/${imageId}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Delete response:', data);  
            if (data.message) {  
                // Find the corresponding delete button  
                const deleteButtons = document.querySelectorAll('.delete-image-button');  
                deleteButtons.forEach(button => {  
                    // Check if the button's data attribute matches the imageId  
                    if (button.dataset.imageId === imageId.toString()) {  
                        const container = button.parentElement;  
                        if (container) {  
                            container.remove(); // Remove the image container from the DOM  
                            alert('Image deleted successfully!');  
                        }  
                    }  
                });
            } else if (data.error) {
                alert(data.error);
            }
        })
        .catch(error => {
            console.error('Error deleting image:', error);

            if (error.message === 'Failed to fetch') {
                alert('Network error: Please check your connection or the server status.');
            } else {
                alert('An error occurred while deleting the image. ' + error.message);
            }
        });
}


// Function to submit form data for the specified employee when the submit button get clicked
function submitForm() {

    const div = document.getElementById("myModal"); // The same div you set the attribute on  
    const employeeId = div.getAttribute('data-employee-id');  
    console.log('employee id from the data atrrr',employeeId); // This should log "12345" 

    // Check if employeeId is valid before proceeding
    //If no employee found, log an error and exit the function
    if (!employeeId) {
        console.error("No employee ID found");

        // Exit the function if employee is missing
        return;
    }

    // Create a new FormData object using the ID
    // This object will collects all the data form for sending it to the server
    // Select the form
    const form = document.getElementById('updateForm');
    
    // Create a FormData object from the form
    const formData = new FormData(form);

    // Gather existing images to include in the form data  
    const existingImages = document.querySelectorAll('.uploaded-image');  
    existingImages.forEach((img, index) => {  
        const imageSrc = img.src; // Get the base64 image source  
        if (imageSrc) {  
            // Optionally, you could send the image id if needed  
            formData.append(`images`, imageSrc); // Append each image data as needed  
        }  
    }); 
    
    // console.log(formData)
    for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
    }

    // Use fetch API to send POST request to server and update the data
    // The request URL includes the employeeId to specify which employee to update
    fetch(`/hr/update_user/${employeeId}`, {
        method: 'POST',
        body: formData,
    })
    .then(response => {

        // Check if the server response is successful
        if (response.ok) {

            // Return the response as a text
            return response.json();

        } else {

            // If the response was not ok, show an error alert
            throw new Error('Network response was not ok');  

        }
    })
    .then(data => {  
        alert('Employee details updated successfully');
        
        // Clear the inputs after submitting the form
        // THE PROBLEM: the inputs have other images that were uploaded for other employee
        const fileInputs = document.querySelectorAll('.employee-image-input');
        fileInputs.forEach(input => input.value = '');
        

        closeModal(); // Close the modal  
        window.location.reload(); // Reload the page  
    }) 
    // Catch any error
    .catch(error => {
        console.error('Errorr:', error);
        alert('Error submitting form');
    });
}



// Function to close the modal
function closeModal() {

    // Get the modal and give it style to get none display
    document.getElementById('myModal').style.display = 'none';

    window.location.reload();
}

// Attach the submitForm function to the submit button
document.getElementById('buttonCancel').addEventListener('click', closeModal);
