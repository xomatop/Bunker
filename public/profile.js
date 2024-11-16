// profile.js

document.getElementById('profile-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const response = await fetch('/profile', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const message = await response.text();
    alert(message);
});

document.getElementById('photo-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const response = await fetch('/profile/photo', {
        method: 'POST',
        body: formData
    });
    const message = await response.text();
    alert(message);
});
