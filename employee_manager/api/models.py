from django.db import models
from django.contrib.auth.models import User


class DynamicField(models.Model):
    INPUT_CHOICES = (
        ('text', 'Text'),
        ('number', 'Number'),
        ('date', 'Date'),
        ('password', 'Password'),
    )
    
    label = models.CharField(max_length=255)
    input_type = models.CharField(max_length=50, choices=INPUT_CHOICES)
    order = models.IntegerField(default=0)
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        ordering = ['order'] 

    def __str__(self):
        return f"{self.label} ({self.input_type})"


class Employee(models.Model):
  
    dynamic_data = models.JSONField(default=dict)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Employee Record #{self.id}"
