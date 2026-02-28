const API_BASE_URL = 'http://127.0.0.1:8000/api';

document.addEventListener('DOMContentLoaded', async () => {
    const tableHeaders = document.getElementById('tableHeaders');
    const tableBody = document.getElementById('tableBody');
    const noDataMessage = document.getElementById('noDataMessage');
    const searchFilter = document.getElementById('searchFilter');
    const searchInput = document.getElementById('searchInput');

    // Authentication Guard
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    let schemaFields = [];
    let employees = [];

    // --- 1. INITIAL DATA FETCH ---
    async function loadData() {
        try {
            // Fetch Schema (Headers) [cite: 24]
            const fieldsResponse = await fetch(`${API_BASE_URL}/fields/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            schemaFields = await fieldsResponse.json();

            // Fetch Employee Records [cite: 23]
            const empResponse = await fetch(`${API_BASE_URL}/employees/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            employees = await empResponse.json();

            renderHeadersAndFilters();
            renderTable(employees);

        } catch (error) {
            console.error('Error fetching data:', error);
            noDataMessage.textContent = 'Server connection error. Check your Django logs.';
            noDataMessage.style.display = 'block';
        }
    }

    // --- 2. DYNAMIC HEADER GENERATION ---
    function renderHeadersAndFilters() {
        if (!schemaFields || schemaFields.length === 0) return;

        tableHeaders.innerHTML = '';
        searchFilter.innerHTML = '<option value="all">Search All Fields</option>';

        schemaFields.forEach(field => {
            // Add Header Cell [cite: 24]
            const th = document.createElement('th');
            th.textContent = field.label;
            tableHeaders.appendChild(th);

            // Add Filter Option
            const option = document.createElement('option');
            const fieldKey = field.label.toLowerCase().replace(/\s+/g, '_');
            option.value = fieldKey;
            option.textContent = field.label;
            searchFilter.appendChild(option);
        });

        // Always add the Action column at the end
        const actionTh = document.createElement('th');
        actionTh.textContent = 'Actions';
        tableHeaders.appendChild(actionTh);
    }

    // --- 3. DYNAMIC TABLE CONTENT --- [cite: 23]
    function renderTable(dataToRender) {
        tableBody.innerHTML = '';

        if (!dataToRender || dataToRender.length === 0) {
            noDataMessage.style.display = 'block';
            return;
        } else {
            noDataMessage.style.display = 'none';
        }

        dataToRender.forEach(emp => {
            const tr = document.createElement('tr');
            const empData = emp.dynamic_data || {};

            schemaFields.forEach(field => {
                const td = document.createElement('td');
                const fieldKey = field.label.toLowerCase().replace(/\s+/g, '_');
                
                if (field.input_type === 'password') {
                    td.textContent = '********';
                } else {
                    // Safe access to data
                    td.textContent = empData[fieldKey] !== undefined ? empData[fieldKey] : '-';
                }
                tr.appendChild(td);
            });

            // Action Column: Delete Button [cite: 25]
            const actionTd = document.createElement('td');
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'btn-danger';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.onclick = () => deleteEmployee(emp.id);
            
            actionTd.appendChild(deleteBtn);
            tr.appendChild(actionTd);
            tableBody.appendChild(tr);
        });
    }

    // --- 4. DELETE LOGIC --- [cite: 25, 29]
    window.deleteEmployee = async function(id) {
        if(confirm('Delete this employee record?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/employees/${id}/`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    employees = employees.filter(emp => emp.id !== id);
                    renderTable(employees);
                } else {
                    alert('Could not delete record. Check permissions.');
                }
            } catch (error) {
                console.error('Delete error:', error);
            }
        }
    }

    // --- 5. SEARCH & FILTER LOGIC --- [cite: 24]
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const filterKey = searchFilter.value;

        const filteredEmployees = employees.filter(emp => {
            const empData = emp.dynamic_data || {};
            
            if (filterKey === 'all') {
                return Object.values(empData).some(val => 
                    String(val).toLowerCase().includes(searchTerm)
                );
            } else {
                const cellValue = empData[filterKey] ? String(empData[filterKey]).toLowerCase() : '';
                return cellValue.includes(searchTerm);
            }
        });

        renderTable(filteredEmployees);
    }

    searchInput.addEventListener('input', handleSearch);
    searchFilter.addEventListener('change', handleSearch);

    // Logout Functionality
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('access_token');
        window.location.href = 'index.html';
    });

    // Start loading
    loadData();
});