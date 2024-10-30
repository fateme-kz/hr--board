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

    // select all rows in the tbody
    const employeeRows = document.querySelectorAll('tbody tr');

    // for each row add a click event listener
    employeeRows.forEach(row => {
        row.addEventListener('click', function() {

            // get the employee ID from "data-is" of the clicked rows
            const employeeId = this.getAttribute('data-is');


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
                            imagePlaceholder.appendChild(imgElement); // Add to the placeholder  
                        }  
                        reader.readAsDataURL(imageBlob); // Convert blob to base64  
                    });  
                } 

                // change the buttons in left panel
                const leftPanelButton = document.querySelector('.add-btn')
                leftPanelButton.style.display = 'none'; // hide the add button

                let buttonContainer1 = document.querySelector('.button-container')
                console.log(buttonContainer1, 'buttonContainer')
                if (buttonContainer1 === null) {
                    const buttonContainer = document.createElement('div');
                    buttonContainer.classList.add('button-container');
                    buttonContainer.style.display = 'flex';
                    buttonContainer.style.gap = '5px';
                    

                    // create Edit Button
                    const editButton = document.createElement('button');
                    editButton.textContent = 'ویرایش';
                    editButton.classList.add('edit-button');
                    editButton.addEventListener('click', function(e) {
                        // the ".stopPropagation()" will tell the browser, when a row is clicked don't allow the click event go up to the row
                        e.preventDefault(); // Prevents default action
                        e.stopPropagation();
                        fetch(`/hr/edit/${employeeId}`, {
                            method: 'GET'})
                            .then(response => {
                                if (response.ok) {
                                    // here we have to render 'edit' route.
                                    window.location.href = `/hr/edit/${employeeId}`;
                                } else {
                                    console.error('Error occurred:', response.statusText);
                                }
                            })                    
                    });
                    

                    // create Quit Button
                    const quitButton = document.createElement('button');
                    quitButton.textContent = 'انصراف';
                    quitButton.classList.add('quit-button');
                    quitButton.addEventListener('click', function(e) {
                        e.preventDefault(); // Prevents default action
                        e.stopPropagation();
                        clearLeftPanel();
                    });

                    // Append buttons to the container
                    buttonContainer.appendChild(editButton);
                    buttonContainer.appendChild(quitButton);

                    // append the new button container to the left panel
                    document.querySelector('.left-pannel').appendChild(buttonContainer);
                

                }

            })
            .catch(error => {
                // handle any error
                console.error('Error fetching employee details', error);
            });
        });
    });

    function clearLeftPanel() {
        const inputField1 = document.querySelector('.input-filed1');
        inputField1.value = '';
        const inputField3 = document.querySelector('.input-filed3');
        inputField3.value = '';
        const inputField2 = document.querySelector('.input-filed2');
        inputField2.value = '';
        const descriptionField = document.querySelector('.description');  
        descriptionField.value = '';
        const imageContainer = document.getElementById('uploaded-image');     
        imageContainer.src = '';
    }
});
