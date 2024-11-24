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
            

            const imagePlaceholders = document.querySelectorAll('.placeholder');

            // Display existing images from DB
            employee.image_data.forEach((imageUrl, index) => {
                if (index < imagePlaceholders.length) {
                    fetch(imageUrl)
                        .then(imgResponse => imgResponse.blob())   
                        .then(imageBlob => {  
                            const reader = new FileReader();  
                            reader.onloadend = function() {  
                                const base64data = reader.result;
                                const imgElement = document.createElement('img');
                                imgElement.src = base64data;
                                imgElement.classList.add('uploaded-image');


                                // Clear existing content in the placeholder and append image and button  
                                
                                const base64dataPrime = reader.result;
                                const deleteImageButton = document.createElement('button');
                                deleteImageButton.src = base64dataPrime;
                                deleteImageButton.classList.add('delete-button');

                                
                                
                                const placeholder = imagePlaceholders[index];  
                                placeholder.style.position = 'relative'; // Ensures children position relative to this
                                placeholder.innerHTML = ''; // Clear previous contents, if any  
                                placeholder.appendChild(imgElement);  
                                placeholder.appendChild(deleteImageButton);

                                
                            };
                            reader.readAsDataURL(imageBlob);
                        })
                        .catch(error => console.error("Error loading image:", error));
                }
            });

            // Add file inputs for uploading new images
            imagePlaceholders.forEach((placeholder, index) => {
                // Clear existing content in case of rerun
                if (!placeholder.querySelector('.employee-image-input')) {
                    const inputElement = document.createElement('input');
                    inputElement.type = 'file';
                    inputElement.accept = 'image/*';
                    inputElement.classList.add('employee-image-input');
                    // inputElement.onchange = previewImage;
                    placeholder.appendChild(inputElement);
                }
            });
        })
        .catch(error => console.error("Error fetching employee details:", error));
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
                imgElement.onclick = addDeleteButtonListeners;

                
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



function addDeleteButtonListeners(event) {  
    // delete image
    // const deleteButtons = document.querySelectorAll('.delete-button');  
    deleteButtons.forEach(deleteButton => {  
        deleteButton.addEventListener('click', function () {  
            
            // Prevent the form from submitting  
            event.preventDefault();   

            if (confirm('Are you sure you want to delete this image?')) {  
                const imageId = this.getAttribute('data-image-id');  
                console.log(`Attempting to delete image with ID: ${imageId}`);  


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
}



const submitButton = document.getElementById('buttonSubmit');
submitButton.addEventListener('click', submitForm);
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









// document.addEventListener('click', (event) => {
//     if (event.target.id === 'buttonSubmit') {
//         const form = document.getElementById('updateForm');
//         const formData = new FormData(form);

//         fetch(`/hr/update_user`, {
//             method: 'POST',
//             body: formData
//         })
//         .then(response => {
//             if (response.ok) {
//                 alert('employee changes get updated successfully');
//                 document.getElementById('myModal').style.display = 'none';
//             } else {
//                 throw new Error('failed to update');
//             }
//         })
//         .catch(error => {
//             console.error('ERROR IN SUBMIT FORM FUNCTION:', error);
//             alert('updating was not successful')
//         })
//     }
// })











// function submitForm(employeeId) {
//     const form = document.getElementById('updateForm');
//     const formData = new FormData(form);

//     fetch(`/hr/update_user/${employeeId}`, {
//         method: 'POST',
//         body: formData,
//     })
//         .then(response => {
//             if (!response.ok) {
//                 return response.json().then(data => {
//                     console.error('Server responded with an error:', data.error);
//                     throw new Error(data.error || 'Server error');
//                 });
//             }
//             return response.json();
//         })
//         .then(data => {
//             if (data.message) {
//                 alert(data.message); // Success message
//                 closeModal();
//                 location.reload(); // Reload to reflect changes
//             }
//         })
//         .catch(error => {
//             console.error('Error submitting form:', error);
//             alert('An error occurred while submitting the form: ' + error.message);
//         });
// }




// // a function to submit the details of edit employee page
// function submitForm(employeeId) {
    
//     // Prepare the FormData object to send the data (including images)
//     const formData = new FormData();
    
//     // Select the file input field and get the files chosen by the user  
//     const imageFiles = document.querySelector('input[type="file"]').files;

//     // Loop through each file the user selected  
//     for (let i = 0; i < imageFiles.length; i++) {
//         // Add each image file to the FormData object under the name 'images'  
//         formData.append('images', imageFiles[i]);
//     }

//     // Make a POST request to the server using the Fetch API  
//     fetch(`/hr/update_user/${employeeId}`, {
//         method: 'POST',

//         // Send the FormData object as the body of the request
//         body: formData
//     })
//     .then(response => {

//         // Check if the response from the server is okay (status 200-299)  
//         if (response.ok) {

//             // Show a success message if the update was successful  
//             alert('Employee details updated successfully');

//             // Redirect the user to the HR list page after the update  
//             window.location.href = '/hr/';
//         } else {

//             // Show an error message if there was an issue with the update
//             alert('Error updating employee details');
//         }
//     })
//     .catch(error => {

//         // If there was an error in making the request, log it to the console
//         console.error('Error:', error);

//         // Show an error message to the user
//         alert('Error updating employee details');
//     });
// }


// // use the function that we define in LIst.js to use the employeeId for submitting the form data
// function submitForm(employeeId) {  

//     // Create a formData object to hold the the data
//     const formData = new FormData(document.getElementById('employeeForm'));  
    
//     // Append the employeeId to the FormData object  
//     formData.append("employee_id", employeeId);  

//     // Debug line: check the ID
//     console.log('employee id for submitNew:', employeeId);

//         fetch(`/hr/update_user/${employeeId}`, {  
//             method: 'POST',  
//             body: formData,  
//         })  
//         .then(response => {  
//             if (!response.ok) {  
//                 return response.json().then(errorData => {  
//                     throw new Error(errorData.message || 'Failed to save employee details. Please try again.');  
//                 });  
//             }  
            
//             return response.json();  // Assuming you return JSON from your route  
//         })  
//         .then(data => {  
//             alert('Employee information and images updated successfully!'); // Success message  
            
//             // Optionally refresh the page or update the UI accordingly  
//             window.location.href = '/hr/'; // Redirect to the main page (you can adjust the URL as needed)
//         })  
//         .catch(error => {  
//             console.error('Error saving employee data:', error);  
//             alert(error.message);  // Show error to the user  
//         });  
// }  
