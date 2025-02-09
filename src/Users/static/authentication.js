function openTab(event, tabName) {
    let i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";
    event.currentTarget.className += " active";
}

// Set default active tab
document.getElementById("login").style.display = "block";






document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector("#login form");

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();  // Prevent default form submission

            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());

            fetch(loginForm.action, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (response.redirected) {
                    window.location.href = response.url;  // Redirect on success
                } else {
                    return response.json();
                }
            })
            .then(data => {
                if (data && data.error) {
                    if (data.type === "unregistered") {
                        alert("❌ User not found! Please register.");
                    } else if (data.type === "wrong_password") {
                        alert("⚠️ Incorrect password. Try again!");
                    } else {
                        alert("❌ Login failed: " + data.error);
                    }
                }
            })
            .catch(error => {
                alert("❌ Network error! Please try again.");
                console.error("Error during login:", error);
            });
        });
    }
});

