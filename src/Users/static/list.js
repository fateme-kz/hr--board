// calender button to render per user page
document.getElementById('calender-btn').addEventListener('click', function() {
    window.location.href = '/hr/employee_log'; // Change the URL to the desired route  
})



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

    // select all rows in the tbody
    const employeeRows = document.querySelectorAll('tbody tr');
    console.log('employee row details:', employeeRows);
    

    // for each row add a click event listener
    employeeRows.forEach(row => {
        row.addEventListener('click', function() {

            // get the employee ID from "data-id" of the clicked rows
            const employeeId = this.getAttribute('data-id');


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

                const editButton = document.createElement('button');
                    editButton.textContent = 'ویرایش';
                    editButton.classList.add('edit-button');

                    editButton.addEventListener('click', function(e) {
                        
                        e.preventDefault();
                    
                        // the ".stopPropagation()" will tell the browser, when a row is clicked don't allow the click event go up to the row
                        e.stopPropagation();

                        // Fetch employee details and populate the modal  
                        fetchAndDisplayImages(employeeId);  

                        const div = document.getElementById('myModal');
                        div.style.display = 'flex';
                        div.setAttribute('data-employee-id', employeeId)
                        
                        // fetch(`/hr/edit/${employeeId}`, {
                        //     method: 'GET'})
                        //     .then(response => {
                        //         if (response.ok) {
                        //             // here we have to render 'edit' route.
                        //             window.location.href = `/hr/edit/${employeeId}`;
                        //         } else {
                        //             console.error('Error occurred:', response.statusText);
                        //         }
                        //     })                    
                    });

                if (buttonContainer === null) {
                    // Create a new button container
                    buttonContainer = document.createElement('div');
                    buttonContainer.classList.add('button-container');
                    buttonContainer.style.display = 'flex';
                    buttonContainer.style.gap = '5px';

                    // Create the Edit button
                    

                    // editButton.addEventListener('click', function(e) {  
                    //     e.preventDefault(); // Prevent the default button action (like form submission)  
                    //     e.stopPropagation(); // Stop the event from bubbling up to parent elements  

                    //     document.addEventListener('DOMContentLoaded', function() {
                    //         // Fetch the employee details from the specified route  
                    //         fetch(`/hr/edit/${employeeId}`, { method: 'GET' })  

                    //             .then(response => {  

                    //                 if (response.ok) {  
                    //                     return response.text(); // Return the response text (HTML content)  

                    //                 } else {  
                    //                     throw new Error('Failed to load content: ' + response.statusText); // Handle error  
                    //                 }  
                    //             })  

                    //             .then(htmlContent => {  
                    //                 const modal = document.getElementById('myModal'); // Get the modal element
                    //                 console.log('Modal element:', modal); // Log the modal element  
 
                                    
                    //                 if (!modal) {  
                    //                     throw new Error('the first error: Modal element is null'); // Error if modal is not found  
                    //                 }  
                                    
                    //                 // Load the fetched HTML content into the modal  
                    //                 modal.querySelector('.modal-content').innerHTML = htmlContent; // Fill the modal with content  
                                    
                    //                 // Display the modal  
                    //                 modal.style.display = 'flex'; // Set modal to visible  
                                    
                    //                 // Load external CSS for the modal content  
                    //                 const cssLink = document.createElement('link'); // Create a new link element for CSS  
                    //                 cssLink.rel = 'stylesheet'; // Set its relationship as stylesheet  
                    //                 cssLink.href = '/users/static/employee.css'; // Adjust the path to your CSS file  
                    //                 document.head.appendChild(cssLink); // Append the link to the document head  
                                    
                    //                 // Load external JS for the modal content  
                    //                 const script = document.createElement('script'); // Create a new script element for JS  
                    //                 script.src = '/users/static/employee.js'; // Adjust the path to your JS file  
                    //                 modal.querySelector('.modal-content').appendChild(script); // Append the script to the modal content  
                                    
                    //                 // Optionally, set up the close button functionality  
                    //                 const closeBtn = modal.querySelector('.close-btn'); // Get the close button  
                    //                 if (closeBtn) {  
                    //                     closeBtn.addEventListener('click', closeModal); // Add click event to close modal  
                    //                 }  

                    //                 // Close the modal when clicking outside of the content  
                    //                 modal.addEventListener('click', (e) => {  
                    //                     if (e.target === modal) {  
                    //                         closeModal(); // Close if the user clicks outside the modal content  
                    //                     }  
                    //                 });  
                    //             })  
                    //             .catch(error => {  
                    //                 console.error('Fetch error:', error); // Log any fetch errors  
                    //             });  
                    //     });
                    // });  

                    // // Function to close the modal  
                    // function closeModal() {  
                    //     const modal = document.getElementById('myModal'); // Get the modal element  
                    //     modal.style.display = 'none'; // Hide the modal  
                    //     modal.querySelector('.modal-content').innerHTML = ''; // Optionally clear content  
                    // }

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
        const inputField1 = document.querySelector('.input-filed1');
        inputField1.value = '';
        const inputField3 = document.querySelector('.input-filed3');
        inputField3.value = '';
        const inputField2 = document.querySelector('.input-filed2');
        inputField2.value = '';
        const descriptionField = document.querySelector('.description');  
        descriptionField.value = '';
        const imageContainer = document.getElementById('list-uploaded-image');     
        imageContainer.src = '';
    }
});
