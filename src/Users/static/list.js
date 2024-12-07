// calender button to render per user page
document.getElementById('calenderBtn').addEventListener('click', function(event) {
    event.preventDefault();
    const overlay = document.getElementById('modalOverLay')
    overlay.style.display = 'flex';
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
// SELECT ALL ELEMENTS AND LOOP OVER THEM
document.querySelectorAll('.delete-btn').forEach(button => {

// ADD CLICK EVENT LISTENER TO ALL BUTTON
button.addEventListener('click', function() {

    // GET THE ELEMENT'S ID FROM "data-id" ATTRIBUTE
    const employee_id = this.getAttribute('data-id');

    // CONFIRM THE USER TO SURE ABOUT DELETE OPTION
    if (confirm('Are you sure you want to delete this employee?')) {

        // LOG TO CONSOLE THAT WE WANT TO DELETE WITH GIVEN THE "employee_id"
        console.log(`Attempting to delete employee with ID: ${employee_id}`);

        // SEND DELETE REQUEST TO SERVER
        fetch(`/hr/delete/${employee_id}`, {
            method: 'DELETE'
        })  

        // CONVERT THE JSON RESPONSE
        .then(response => response.json())
        .then(data => {

            // LOG THE SERVER RESPONSE (ITS FOR DEBUGGING)
            console.log('Delete response:', data);

            // CHECK THE DATA MESSAGE AND IF IT'S SUCCESS MESSAGE REMOVE THAT ID
            if (data.message) { 
                const row = document.getElementById(`employee-${employee_id}`);
                if (row) {
                    row.remove();
                }

            // IF IT GET AN ERROR LIKE "employee not found" SHOW IT WITH ALERT
            } else if (data.error) {
                alert(data.error);
            }
        })

        // IF IT HAS AN ISSUE LIKE NETWORK ERROR, LOG IT TO THE CONSOLE
        .catch(error => {
            console.error('Error:', error);
        });
    }
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
                        img.style.height = '100px'; // Example styling
                        img.style.width = '100px';
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
