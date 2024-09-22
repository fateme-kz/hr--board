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


document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', function() {
        const employee_id = this.getAttribute('data-id');

        // fetch employee data
        fetch(`/users/edit/${employee_id}`, {
            method: 'GET'
        })
            .then(response => {
                // check if response is ok
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                //if needed, handle the fetched data here
               console.log(data);

                // now navigate to the employee.html page
                window.location.href = `/users/edit/${employee_id}`;
            })
            .catch(error => {
                console.error("there is a problem: ", error);
            });
        });
   });

