// js/app.js

const API_BASE_URL = 'http://127.0.0.1:8000/api';

document.addEventListener('DOMContentLoaded', async () => {
    const addFieldBtn = document.getElementById('addFieldBtn');
    const saveFormBtn = document.getElementById('saveFormBtn');
    const dropzone = document.getElementById('dropzone');
    const emptyStateMessage = document.getElementById('emptyStateMessage');

    // Get the VIP pass (token) from login
    const token = localStorage.getItem('access_token');
    if (!token && window.location.pathname.includes('dashboard')) {
        window.location.href = 'index.html';
        return;
    }

    // Load saved fields from API when page loads
    if (dropzone && token) {
        try {
            const response = await fetch(`${API_BASE_URL}/fields/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const savedFields = await response.json();

            if (savedFields && savedFields.length > 0) {
                emptyStateMessage.style.display = 'none';
                
                savedFields.forEach(field => {
                    const fieldWrapper = document.createElement('div');
                    fieldWrapper.classList.add('dynamic-field-wrapper');
                    fieldWrapper.setAttribute('draggable', 'true');
                    fieldWrapper.dataset.type = field.input_type;
                    fieldWrapper.dataset.label = field.label;

                    const fieldContent = document.createElement('div');
                    fieldContent.classList.add('field-content');
                    
                    const fieldLabel = document.createElement('label');
                    fieldLabel.textContent = field.label;
                    fieldLabel.style.display = 'block';
                    fieldLabel.style.marginBottom = '5px';
                    fieldLabel.style.fontWeight = 'bold';

                    const fieldInput = document.createElement('input');
                    fieldInput.type = field.input_type;
                    fieldInput.disabled = true;
                    fieldInput.style.width = '100%';
                    fieldInput.style.padding = '8px';

                    fieldContent.appendChild(fieldLabel);
                    fieldContent.appendChild(fieldInput);

                    const removeBtn = document.createElement('button');
                    removeBtn.textContent = 'Remove';
                    removeBtn.classList.add('remove-btn');
                    removeBtn.addEventListener('click', () => {
                        dropzone.removeChild(fieldWrapper);
                        if (dropzone.children.length === 0) emptyStateMessage.style.display = 'block';
                    });

                    fieldWrapper.appendChild(fieldContent);
                    fieldWrapper.appendChild(removeBtn);
                    addDragEvents(fieldWrapper);
                    dropzone.appendChild(fieldWrapper);
                });
            }
        } catch (error) {
            console.error('Error loading saved fields:', error);
        }
    }

    let draggedItem = null;

    if (addFieldBtn) {
        addFieldBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const labelValue = document.getElementById('fieldLabel').value.trim();
            const typeValue = document.getElementById('fieldType').value;

            if (!labelValue) return alert('Please enter a field label.');
            if (emptyStateMessage) emptyStateMessage.style.display = 'none';

            const fieldWrapper = document.createElement('div');
            fieldWrapper.classList.add('dynamic-field-wrapper');
            fieldWrapper.setAttribute('draggable', 'true'); 
            fieldWrapper.dataset.type = typeValue;
            fieldWrapper.dataset.label = labelValue;

            const fieldContent = document.createElement('div');
            fieldContent.classList.add('field-content');
            
            const fieldLabel = document.createElement('label');
            fieldLabel.textContent = labelValue;
            fieldLabel.style.display = 'block';
            fieldLabel.style.marginBottom = '5px';
            fieldLabel.style.fontWeight = 'bold';

            const fieldInput = document.createElement('input');
            fieldInput.type = typeValue;
            fieldInput.disabled = true;
            fieldInput.style.width = '100%';
            fieldInput.style.padding = '8px';

            fieldContent.appendChild(fieldLabel);
            fieldContent.appendChild(fieldInput);

            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.classList.add('remove-btn');
            removeBtn.addEventListener('click', () => {
                dropzone.removeChild(fieldWrapper);
                if (dropzone.children.length === 0) emptyStateMessage.style.display = 'block';
            });

            fieldWrapper.appendChild(fieldContent);
            fieldWrapper.appendChild(removeBtn);
            addDragEvents(fieldWrapper);
            dropzone.appendChild(fieldWrapper);

            document.getElementById('fieldLabel').value = '';
        });
    }

    function addDragEvents(item) {
        item.addEventListener('dragstart', function () {
            draggedItem = item;
            setTimeout(() => item.style.opacity = '0.5', 0);
        });
        item.addEventListener('dragend', function () {
            setTimeout(() => {
                draggedItem.style.opacity = '1';
                draggedItem = null;
            }, 0);
        });
    }

    if (dropzone) {
        dropzone.addEventListener('dragover', function (e) {
            e.preventDefault(); 
            const afterElement = getDragAfterElement(dropzone, e.clientY);
            if (afterElement == null) {
                dropzone.appendChild(draggedItem);
            } else {
                dropzone.insertBefore(draggedItem, afterElement);
            }
        });
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.dynamic-field-wrapper:not([style*="opacity: 0.5"])')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // THIS IS THE FIX: Saving the form to Django API using fetch
    if (saveFormBtn) {
        saveFormBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const fieldElements = dropzone.querySelectorAll('.dynamic-field-wrapper');
            if (fieldElements.length === 0) {
                return alert('Cannot save an empty form. Please add fields first!');
            }

            try {
                // Step 1: Delete all existing fields from the database
                try {
                    const existingFieldsResponse = await fetch(`${API_BASE_URL}/fields/`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    const existingFields = await existingFieldsResponse.json();

                    // Delete each existing field
                    for (let field of existingFields) {
                        await fetch(`${API_BASE_URL}/fields/${field.id}/`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                    }
                } catch (deleteError) {
                    console.error('Error deleting old fields:', deleteError);
                }

                // Step 2: Save the current fields from the preview
                for (let i = 0; i < fieldElements.length; i++) {
                    const el = fieldElements[i];
                    const payload = {
                        order: i + 1,
                        label: el.dataset.label,
                        input_type: el.dataset.type
                    };

                    await fetch(`${API_BASE_URL}/fields/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}` 
                        },
                        body: JSON.stringify(payload)
                    });
                }
                
                alert('Form schema saved successfully! All changes have been applied.');
                
            } catch (error) {
                console.error('Error saving form:', error);
                alert('Failed to save form. Check console.');
            }
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('access_token');
            window.location.href = 'index.html';
        });
    }
});