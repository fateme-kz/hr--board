// close button of modal
document.getElementById('closePeruser').addEventListener('click', function() {  
    document.getElementById('modalOverLay').style.display = 'none';
    window.location.reload(); // Reload the page
});