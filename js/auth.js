// js/auth.js

const API_BASE_URL = 'http://127.0.0.1:8000/api';

document.addEventListener('DOMContentLoaded', () => {
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault(); 
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch(`${API_BASE_URL}/login/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('access_token', data.access);
                    alert('Login successful!');
                    window.location.href = 'dashboard.html';
                } else {
                    alert('Login failed: ' + (data.detail || 'Invalid credentials'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred connecting to the server.');
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('reg-username').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            
            try {
                const response = await fetch(`${API_BASE_URL}/register/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });

                if (response.ok) {
                    alert('Registration successful! Please login.');
                    window.location.href = 'index.html';
                } else {
                    const data = await response.json();
                    alert('Registration failed. Check console for details.');
                    console.error(data);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred connecting to the server.');
            }
        });
    }
});