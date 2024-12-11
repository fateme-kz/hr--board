// Select all calendar buttons in list.html  
document.querySelectorAll('.calender-btn').forEach(button => {   

    // Add an event to click on the button and call a function  
    button.addEventListener('click', function (event) {  
        // Get the employee ID from the button's data attribute  
        const employeeId = this.getAttribute('data-id');  
        
        console.log('Employee ID in attendance modal:', employeeId);  

        // Get modal overlay and reset its content  
        const overlay = document.getElementById('modalOverLay');  
        const modalContent = document.getElementById('perUserModal');  
        
        // Use fetch API to get logs  
        fetch(`/hr/get_employee_logs/${employeeId}`, {  
            method: 'GET',  
        })  
        .then(response => {  
            if (!response.ok) {  
                throw new Error(`HTTP error! Status: ${response.status}`);  
            }  
            return response.json();  
        })  
        .then(data => {  
            const { logs } = data;

            // Reset attendance table content  
            const attendanceTableBody = modalContent.querySelector('.attendance-table tbody');  
            attendanceTableBody.innerHTML = ''; // Clear previous content  

            if (logs && logs.length > 0) {  
                logs.forEach(log => {  
                    const row = document.createElement('tr');  
                    row.className = 'att-row-body';  

                    // Create the table row with button and log data
                    row.innerHTML = `  
                        <td class="out-time">  
                            <div class="custom-cell">  
                                <button class="calender-add"></button>  
                                <span class="log-time">${log['out-time']}</span>  
                            </div>  
                        </td>  
                        <td class="in-time">  
                            <div class="custom-cell">  
                                <button class="calender-add"></button>  
                                <span class="log-time">${log['in-time']}</span>  
                            </div>  
                        </td>  
                    `;  
                    attendanceTableBody.appendChild(row);  
                });  
            } else {  
                attendanceTableBody.innerHTML = `  
                    <tr>  
                        <td class="no-attendance" colspan="2">No attendance here</td>  
                    </tr>  
                `;  
            }  

            // Show the modal  
            overlay.style.display = 'flex';  
        })  
        .catch(error => {  
            console.error('Error fetching employee logs:', error.message);  

            // If fetching the logs fails, show a placeholder message in the modal  
            modalContent.querySelector('.attendance-table tbody').innerHTML = `  
                <tr>  
                    <td class="no-attendance" colspan="2">--- Logs are currently unavailable ---</td>  
                </tr>  
            `;  

            // Show the modal  
            overlay.style.display = 'flex';  
        });
        
        

        // Prevent default action  
        event.preventDefault();  
    });  
});  




document.getElementById('image-preview').addEventListener('change', function(event) {  
    const file = event.target.files[0]; // Get the first uploaded file  
    const uploadedImage = document.getElementById('list-uploaded-image');  

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



// DELETE BUTTON FOR ATTENDANCE LIST
// Select all buttons with the class 'delete-btn' and iterate over them  
document.querySelectorAll('.delete-btn').forEach(button => {  

    // Add a click event listener for each button  
    button.addEventListener('click', function () {  

        // Get the employee ID from the button's "data-id" attribute  
        const employee_id = this.getAttribute('data-id');  

        // Prompt the user to confirm deletion of the employee  
        if (confirm('Are you sure you want to delete this employee?')) {  

            // Log the attempt to delete the employee with the retrieved ID  
            console.log(`Attempting to delete employee with ID: ${employee_id}`);  

            // Send a DELETE request to the server to remove the employee  
            fetch(`/hr/delete/${employee_id}`, {  
                method: 'DELETE', // Specify that the request method is DELETE  
            })  

            .then(response => response.json()) // Parse the response as JSON  
                
            

            .then(data => {  

                // Log the server response  
                console.log('Delete response:', data);  

                // Check if the response contains a success message  
                    if (data.message) {  
                        alert('Employee deleted successfully!');  

                        // Remove the row
                        const row = document.querySelector(`tr[data-id="${employee_id}"]`);  
                        if (row) row.remove();  

                        // Clear the form if it is showing the deleted employee's details
                        const form = document.getElementById('employee-form');
                        if (form && form.getAttribute('data-id') === employee_id) {  
                            form.reset();  
                            form.setAttribute('data-id', ''); // Clear the ID
                        }  
                        
                } else if (data.error) {  

                    // Alert the user of an error received from the server  
                    alert(data.error);
                }  
            })  
            .catch(error => {  

                // Log any error that occurs during the fetch operation  
                console.error('Error:', error);  
            });  
        }  
    });  
});


    
document.getElementById('employee-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the default form submission

    const form = this; // Get the form element
    const formData = new FormData(form); // Create a fresh FormData object

    fetch(form.action, {
        method: form.method,
        body: formData,
    })
        .then(response => {
            // Check if the response is JSON
            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                return response.json(); // Parse JSON response
            } else {
                return 'reload'; // Indicate page reload if not JSON
            }
        })
        .then(data => {
            if (data === 'reload') {
                window.location.reload(); // Reload the page
                return; // Exit the function here
            }

            // If JSON response is received
            if (data.message) {
                alert(data.message); // Display success message
                form.reset(); // Clear the form fields
            } else if (data.error) {
                alert(data.error); // Display error message
            }
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            alert('Error submitting form. Please try again.');
        });
});




// CLICK ON EMPLOYEE ROW AND SHOW DETAILS IN LEFT PANEL
// wait until the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', function () {

    let currentEmployeeId = null

    // select all rows in the tbody
    const employeeRows = document.querySelectorAll('tbody tr');
    console.log('employee row details:', employeeRows);
    

    // for each row add a click event listener
    employeeRows.forEach(row => {
        row.addEventListener('click', function() {

            // get the employee ID from "data-id" of the clicked rows
            const employeeId = this.getAttribute('data-id');
            console.log('employee id in row:', employeeId);
            currentEmployeeId = employeeId

            clearLeftPanel();
            
            // fetch the details from the server using the employee ID
            fetch(`/hr/get_employee_details/${employeeId}`)
            .then(response => response.json())
            .then(employee => {

                // if there is an error in employee response, alert the user and stop  the execution
                if (employee.error) {
                    alert(employee.error);
                    return;
                }

                // populate the name field in the left panel with employee name
                document.querySelector('.input-filed1').value = employee.name;

                // populate the name field in the left panel with employee last name
                document.querySelector('.input-filed3').value = employee.last_name;
                
                // populate the name field in the left panel with company name
                document.querySelector('.input-filed2').value = employee.company_name;

                // populate the description in the left panel with employee description
                document.querySelector('.description').value = employee.description;

                // add them in a new CSS class; something like 'field-populated'
                document.querySelector('.input-filed1').classList.add('field-populated');
                document.querySelector('.input-filed3').classList.add('field-populated');
                document.querySelector('.input-filed2').classList.add('field-populated');
                document.querySelector('.description').classList.add('field-populated');                

                // Clear previous images
                const imagePlaceholder = document.querySelector('.image-placeholder');  
                imagePlaceholder.innerHTML = '';

                // Check if there are images before proceeding  
                if (employee.image_data.length > 0) {  

                    // Get the first image URL
                    const firstImageUrl = employee.image_data[0];   

                    //fetch the image
                    fetch(firstImageUrl)  

                    // Get the image data as a Blob
                    .then(imgResponse => imgResponse.blob())   
                    .then(imageBlob => {  
                        
                        // FileReader is a JS interface lets app read the contents of files
                        const reader = new FileReader();  
                        reader.onloadend = function() {  
                            const base64data = reader.result; // Get the base64 string  
                            const imgElement = document.createElement('img');  
                            imgElement.src = base64data; // Set the base64 data as source  
                            imgElement.style.width = '100%'; // Set image width to 100%  
                            imgElement.style.height = '100%'; // Keep aspect ratio  
                            imgElement.style.display = 'block'; // Display block
                            imgElement.style.borderRadius = '5px'; // Set border radius
                            imgElement.style.objectFit = 'cover';
                            imagePlaceholder.appendChild(imgElement); // Add to the placeholder  
                        }  
                        reader.readAsDataURL(imageBlob); // Convert blob to base64  
                    });  
                } 

                
                // Hide the 'add-btn' button in the left panel
                const leftPanelButton = document.querySelector('.add-btn');
                if (leftPanelButton) {
                    leftPanelButton.style.display = 'none';
                }

                // Check if the button container already exists in the DOM
                let buttonContainer = document.querySelector('.button-container');
                console.log(buttonContainer, 'buttonContainer');

                if (buttonContainer === null) {
                    // Create a new button container
                    buttonContainer = document.createElement('div');
                    buttonContainer.classList.add('button-container');
                    buttonContainer.style.display = 'flex';
                    buttonContainer.style.gap = '5px';


                    const editButton = document.createElement('button');
                    editButton.textContent = 'ویرایش';
                    editButton.classList.add('edit-button');

                    editButton.addEventListener('click', function(e) {
                        
                        e.preventDefault();
                    
                        // the ".stopPropagation()" will tell the browser, when a row is clicked don't allow the click event go up to the row
                        e.stopPropagation();

                        // Fetch employee details and populate the modal  
                        fetchAndDisplayImages(currentEmployeeId);  

                        const div = document.getElementById('myModal');
                        div.style.display = 'flex';
                        div.setAttribute('data-employee-id', employeeId)
                                       
                    });

                    

                    // Create the Quit button
                    const quitButton = document.createElement('button');
                    quitButton.textContent = 'انصراف';
                    quitButton.classList.add('quit-button');
                    quitButton.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        clearLeftPanel(); // Function to close the modal
                    });

                    // Append buttons to the container
                    buttonContainer.appendChild(editButton);
                    buttonContainer.appendChild(quitButton);

                    // Append the button container to the left panel
                    document.querySelector('.left-pannel').appendChild(buttonContainer);
                }
            });
        })}
    );

    
    function clearLeftPanel() {
        // Reset all input fields to their default state
        const inputFields = document.querySelectorAll('.input-filed1, .input-filed2, .input-filed3');
        inputFields.forEach(field => {
            field.value = ''; // Clear the input field
            field.classList.remove('field-populated'); // Remove any additional CSS classes
        });
    
        // Clear the description field
        const descriptionField = document.querySelector('.description');
        if (descriptionField) {
            descriptionField.value = ''; // Clear the textarea
            descriptionField.classList.remove('field-populated'); // Remove any additional CSS classes
        }
    
        // Handle the image container
        const imageContainer = document.querySelector('.image-placeholder');
        if (imageContainer) {
            // Remove all children (including images and file input) from the image container
            imageContainer.innerHTML = '';
    
            // Re-create and append a new file input
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'image-preview';
            fileInput.name = 'file';
            fileInput.className = 'image-input';
            fileInput.accept = 'image/*';
            fileInput.style.height = '38%';
            fileInput.style.width = '22%';
            fileInput.style.paddingBottom = '30px';
    
            // Event listener to display the image when a file is selected
            fileInput.addEventListener('change', function () {
                const file = fileInput.files[0]; // Get the selected file
                if (file) {
                    const reader = new FileReader(); // Create a FileReader to read the file
                    reader.onload = function (e) {
                        // Create an image element and set its source to the file data
                        const img = document.createElement('img');
                        img.src = e.target.result; // Base64-encoded string of the image
                        img.alt = 'Selected Image';
                        img.style.height = '100%'; // Example styling
                        img.style.width = '100%';
                        img.style.objectFit = 'cover';
    
                        // Clear the container and add the image and input back
                        imageContainer.innerHTML = '';
                        imageContainer.appendChild(img);
                        imageContainer.appendChild(fileInput);
                    };
                    reader.readAsDataURL(file); // Read the file as a Data URL
                }
            });
    
            imageContainer.appendChild(fileInput); // Add the new file input to the container
        }
    
        // Show the "Add Employee" button in the left panel
        const leftPanelButton = document.querySelector('.add-btn');
        if (leftPanelButton) {
            leftPanelButton.style.display = 'block'; // Ensure the button is visible
        }
    
        // Remove any button container (e.g., edit/cancel buttons)
        const buttonContainer = document.querySelector('.button-container');
        if (buttonContainer) {
            buttonContainer.remove(); // Remove the button container to clean up
        }
    }
    
    
});
