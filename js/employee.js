// js/employee.js

const API_BASE_URL = 'http://127.0.0.1:8000/api';

document.addEventListener('DOMContentLoaded', async () => {
    const dynamicFieldsContainer = document.getElementById('dynamicFieldsContainer');
    const employeeCreationForm = document.getElementById('employeeCreationForm');
    const submitEmployeeBtn = document.getElementById('submitEmployeeBtn');
    const noFormWarning = document.getElementById('noFormWarning');

    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // 1. Fetch the Form Schema from Django API
    try {
        const response = await fetch(`${API_BASE_URL}/fields/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const fields = await response.json();

        if (fields.length > 0) {
            document.getElementById('formActions').style.display = 'block';

            fields.forEach(field => {
                const inputGroup = document.createElement('div');
                inputGroup.classList.add('input-group');

                const label = document.createElement('label');
                label.textContent = field.label;
                
                const inputName = field.label.toLowerCase().replace(/\s+/g, '_');
                label.setAttribute('for', inputName);

                const input = document.createElement('input');
                input.type = field.input_type || 'text'; 
                input.id = inputName;
                input.name = inputName;
                input.required = true; 
                input.classList.add('dynamic-input-element'); 

                inputGroup.appendChild(label);
                inputGroup.appendChild(input);
                dynamicFieldsContainer.appendChild(inputGroup);
            });
        } else {
            noFormWarning.style.display = 'block';
        }

    } catch (error) {
        console.error('Error fetching form schema:', error);
        noFormWarning.textContent = 'Error loading form. Is the server running?';
        noFormWarning.style.display = 'block';
    }

    // 2. Submit Employee Data to Django API
    if (employeeCreationForm) {
        employeeCreationForm.addEventListener('submit', async function(e) {
            e.preventDefault(); 

            const employeeData = {};
            const inputs = document.querySelectorAll('.dynamic-input-element');
            
            inputs.forEach(input => {
                employeeData[input.name] = input.value;
            });

            const payload = {
                dynamic_data: employeeData
            };

            try {
                const submitResponse = await fetch(`${API_BASE_URL}/employees/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                if (submitResponse.ok) {
                    alert('Employee saved successfully to the database!');
                    employeeCreationForm.reset();
                } else {
                    const errorData = await submitResponse.json();
                    alert('Failed to save employee. Check console.');
                    console.error(errorData);
                }
            } catch (error) {
                console.error('Error submitting employee:', error);
                alert('Connection error.');
            }
        });
    }

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('access_token');
        window.location.href = 'index.html';
    });
});