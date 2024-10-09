// function convertToPersianNumbers(str) {
//     const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
//     return str.replace(/\d/g, function(digit) {
//         return persianNumbers[digit];
//     });
// }

// document.addEventListener('DOMContentLoaded', function () {
//     const employeeId = document.querySelectorAll('.employee-id');
//     employeeId.foreach(function(id) {
//         id.textContent = convertToPersianNumbers(id.textContent);
//         console.log(id.textContent);
//     });;
// });






// DELETE BUTTON FOR ATTENDANCE LIST
// SELECT ALL ELEMENTS AND LOOP OVER THEM
document.querySelectorAll('.delete-btn').forEach(button => {

// ADD CLICK EVENT LISTENER TO ALL BUTTON
button.addEventListener('click', function() {

    // GET THE ELEMENT'S ID FROM "data-is" ATTRIBUTE
    const employee_id = this.getAttribute('data-id');

    // CONFIRM THE USER TO SURE ABOUT DELETE OPTION
    if (confirm('Are you sure you want to delete this employee?')) {

        // LOG TO CONSOLE THAT WE WANT TO DELETE WITH GIVEN THE "employee_id"
        console.log(`Attempting to delete employee with ID: ${employee_id}`);

        // SEND DELETE REQUEST TO SERVER
        fetch(`/users/delete/${employee_id}`, {
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

            // get the employee ID from "data-id" of the clicked rows
            const employeeId = this.getAttribute('data-id');

            // find the button inside the clicked row
            const actionButton = this.querySelector('.action-btn');

            // replace the existing button with new buttons
            if (actionButton) {

                // edit button
                const editButton = document.createElement('button');
                editButton.textContent = 'ویرایش';
                editButton.classList.add('edit-button');
                editButton.addEventListener('click', function() {
                    alert('Editing employee ${employeeId}');
                });

                // quit button
                const quitButton = document.createElement('button');
                quitButton.textContent = 'انصراف';
                quitButton.classList.add('quit-btn');
                quitButton.addEventListener('click', function() {
                    alert('quit employee ${employeeId');
                });

                // create a  container for two new button
                const buttonContainer = document.createElement('div');
                buttonContainer.appendChild(editButton);
                buttonContainer.appendChild(quitButton);

                // replace the buttons
                actionButton.replaceWith(buttonContainer);
            }


            // fetch the details from the server using the employee ID
            fetch(`/users/get_employee_details/${employeeId}`)
            .then(response => response.json())
            .then(employee => {

                // if there is an error in employee response, alert the user and stop  the execution
                if (employee.error) {
                    alert(employee.error);
                    return;
                }

                // populate the name field in the left panel with employee name
                document.querySelector('.input-filed1').value = employee.name;
                
                // select the image container by the ID
                const imageContainer = document.getElementById('image-preview');

                // clear any previous image
                imageContainer.innerHTML = '';

                // check if the employee has image data
                if (employee.image_data && employee.image_data.length > 0) {

                    // create an img element to display image
                    const imgElement = document.createElement('img');

                    // set src attribute with base64 image  data
                    imgElement.src = `data:image/jpeg;base64,${employee.image_data[0]}`;

                    // add a class to the image to allow CSS styling
                    imgElement.classList.add('employee-image');

                    // append the img element to the container
                    imageContainer.appendChild(imgElement);

                } else {

                    // if the image container has no image, display "No image available"
                    imageContainer.innerHTML = `<span>No image available</span>`;
                }
            })
            .catch(error => {
                // handle any error
                console.error('Error fetching employee details', error);
            });
        });
    });
});





















// document.querySelectorAll('.vazirmatn-edit-btn').forEach(button => {
//     button.addEventListener('click', function() {
//         const employee_id = this.getAttribute('data-id');

//         // fetch employee data
//         fetch(`/users/edit/${employee_id}`, {
//             method: 'GET'
//         })
//             // .then(response => {
//             //     // check if response is ok
//             //     if (!response.ok) {
//             //         throw new Error('Network response was not ok');
//             //     }
//             //     return response.json();
//             // })
//              .then(data => {
//                 //if needed, handle the fetched data here
//                 console.log(data);

//                 // now navigate to the employee.html page
//                 window.location.href = `/users/edit/${employee_id}`;
//             })
//             .catch(error => {
//                 console.error("there is a problem: ", error);
//             });
//         });
//    });

