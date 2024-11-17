let selectedEmployeeId = null;





// // Func to display images, the old and the news
// function fetchAndDisplayImages(employeeId) {  
//     fetch(`/hr/get_employee_details/${employeeId}`)
//         .then(response => response.json())
//         .then(employee => {
//             if (employee.error) {
//                 alert(employee.error);
//                 return;
//             }

//             const imagePlaceholders = document.querySelectorAll('.image-container2, .placeholder');

//             // Display existing images from employee data
//             employee.image_data.forEach((imageUrl, index) => {
//                 if (index < imagePlaceholders.length) {
//                     fetch(imageUrl)
//                         .then(imgResponse => imgResponse.blob())   
//                         .then(imageBlob => {  
//                             const reader = new FileReader();  
//                             reader.onloadend = function() {  
//                                 const base64data = reader.result;
//                                 const imgElement = document.createElement('img');
//                                 imgElement.src = base64data;
//                                 imgElement.classList.add('uploaded-image');
//                                 imgElement.style.width = '100%';
//                                 imgElement.style.height = '100%';
//                                 imgElement.style.display = 'block';

//                                 // Replace placeholder content with the fetched image
//                                 imagePlaceholders[index].innerHTML = '';
//                                 imagePlaceholders[index].appendChild(imgElement);
//                             };
//                             reader.readAsDataURL(imageBlob);
//                         })
//                         .catch(error => console.error("Error loading image:", error));
//                 }
//             });

//             // Add file inputs for uploading new images
//             imagePlaceholders.forEach((placeholder, index) => {
//                 // Clear existing content in case of rerun
//                 if (!placeholder.querySelector('.employee-image-input')) {
//                     const inputElement = document.createElement('input');
//                     inputElement.type = 'file';
//                     inputElement.accept = 'image/*';
//                     inputElement.classList.add('employee-image-input');
//                     inputElement.onchange = previewImage;  // Use the previewImage function directly
//                     placeholder.appendChild(inputElement);
//                 }
//             });
//         })
//         .catch(error => console.error("Error fetching employee details:", error));
// }


// Usage:  
// Call this function with the employeeId you want to fetch images for  
// fetchAndDisplayImages(employeeId);




function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = function() {
            // Find the first placeholder without an image and set the preview there
            const placeholder = event.target.closest('.placeholder');
            const imgElement = document.createElement('img');
            imgElement.src = reader.result;
            imgElement.classList.add('uploaded-image');
            imgElement.style.width = '100%';
            imgElement.style.height = '100%';
            imgElement.style.display = 'block';

            // Clear the placeholder and add the new image preview
            placeholder.innerHTML = '';
            placeholder.appendChild(imgElement);
        };
        reader.readAsDataURL(file);
    }
}


// // we use this function in list.js to get the image when user choose that
// document.getElementById('employee-image-preview').addEventListener('change', function(event) {  
//     const file = event.target.files[0]; // Get the first uploaded file  
//     const uploadedImage = document.getElementById('employee-uploaded-image');  

//     if (file) {  
//         const reader = new FileReader();  

//         // Read the file as an ArrayBuffer (binary data)  
//         reader.readAsArrayBuffer(file);   

//         reader.onload = function(e) {  
//             const arrayBuffer = e.target.result; // This is the binary data  
//             const blob = new Blob([arrayBuffer], { type: file.type }); // Create a new Blob object  
//             const url = URL.createObjectURL(blob); // Create a URL for the Blob  

//             uploadedImage.src = url; // Set the src of img to Blob URL  
//             uploadedImage.style.display = 'block'; // Show the image  
//         };  
//         // Read the file here  
//         reader.readAsArrayBuffer(file);   
//     }  
// });



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

// document.addEventListener('DOMContentLoaded', function() {
//     const cancelButton = document.getElementById('buttonCancel');

//     // Cancel button click event (handle cancel action, e.g., redirect back to the main page)
//     cancelButton.addEventListener('click', function() {
//         window.location.href = '/hr/'; // Redirect to the main page (you can adjust the URL as needed)
//     });
// });


// // Function to open the modal and load employee data
// function openModal(employeeId) {
//     // Fetch the employee data and images for the modal content
//     fetch(`/hr/edit/${employeeId}`)
//         .then(response => response.text())
//         .then(htmlContent => {
//             // Insert the fetched HTML content into the modal's body
//             document.getElementById('editForm').innerHTML = htmlContent;
//             document.getElementById('employeeId').value = employeeId;

//             // Display the modal
//             document.getElementById('myModal').style.display = 'flex';
//         })
//         .catch(error => console.error('Error loading content:', error));
// }



document.getElementById('buttonSubmit').addEventListener('click', function() {
    submitForm(employeeId);
    console.log('employee id for submit:', employeeId)
});










function passEmployeeId(employeeId) {
    selectedEmployeeId = employeeId;
    console.log('employee ID in passEmployeeId', selectedEmployeeId);
}



document.getElementById('buttonSubmit').onclick = function() {
    submitForm(selectedEmployeeId);
    console.log('employee ID in getting submit button:', selectedEmployeeId);
};



// Function to submit form data for the specified employee when the submit button get clicked
function submitForm(employeeId) {

    console.log('employee id in submit form:', employeeId)
    // Check if employeeId is valid before proceeding
    //If no employee found, log an error and exit the function
    if (!employeeId) {
        console.error("No employee ID found");

        // Exit the function if employee is missing
        return;
    }

    // Create a new FormData object using the ID
    // This object will collects all the data form for sending it to the server
    const formData = new FormData(document.getElementById("updateForm"));

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
            response.text();
            // alert('Employee details updated successfully');
            // window.location.href = '/hr/';

        // Use the closeModal() function to close the popup and clear the selectedEmployeeId after successful update
        closeModal();

        } else {

            // If the response was not ok, show an error alert
            alert('Error updating employee details');
        }
    })

    
    // Catch any error
    .catch(error => {
        console.error('Error:', error);
        alert('Error submitting form');
    });
}



// Function to close the modal
function closeModal() {

    // Get the modal and give it style to get none display
    document.getElementById('myModal').style.display = 'none';

    // Clear the selectedEmployeeId after the Modal get closed
    selectedEmployeeId = null;
    console.log('select Employee after closing modal', selectedEmployeeId);

}

// Attach the submitForm function to the submit button
document.getElementById('buttonCancel').addEventListener('click', closeModal);




















// function openModal(employeeId) {
//     fetch(`/hr/edit/${employeeId}`)
//         .then(response => {
//             if (response.ok) {
//                 return response.text();
//             } else {
//                 throw new Error('Failed to load content');
//             }
//         })
//         .then(htmlContent => {
//             document.getElementById('modalBody').innerHTML = htmlContent;
//             document.getElementById('myModal').style.display = 'flex';
            
//             // Attach form submission handler after the modal loads
//             document.getElementById('updateForm').onsubmit = function(event) {
//                 event.preventDefault(); // Prevent default form submission
//                 submitForm(employeeId); // Call submitForm with employeeId
//             };
//         })
//         .catch(error => console.error('Error fetching content:', error));
// }


// function closeModal() {
//     document.getElementById('myModal').style.display = 'none';
// }


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
