# Employee_Management_System
A robust, full-stack web application that allows administrators to design custom employee registration forms on the fly and manage employee records through a dynamic directory. This project demonstrates the seamless integration of a Django REST Framework backend with a modern, Vanilla JavaScript frontend.

Quick Setup
# Install required packages
pip install django djangorestframework django-cors-headers djangorestframework-simplejwt

# Apply database migrations
python manage.py makemigrations
python manage.py migrate

# Create your admin account
python manage.py createsuperuser

# Start the server
python manage.py runserver

# 2. Frontend
Ensure your Django server is running at **http://127.0.0.1:8000.**

Open the project folder in VS Code.

Right-click index.html and select "Open with Live Server".
