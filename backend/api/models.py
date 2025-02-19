from django.db import models
from django.contrib.auth.models import User

class Project(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    summary = models.TextField(null=True, blank=True)
    form = models.JSONField(null=True, blank=True)
    data = models.JSONField(null=True, blank=True)
    settings = models.JSONField(null=True, blank=True)
    report = models.JSONField(null=True, blank=True)
    data_table = models.JSONField(null=True, blank=True)
    map = models.JSONField(null=True, blank=True)
    microplaning = models.JSONField(null=True, blank=True)
    user = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, related_name='projects', on_delete=models.CASCADE)

class Form(models.Model):
    project = models.ForeignKey(Project, related_name='forms', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    # Add other form fields here

class Submission(models.Model):
    form = models.ForeignKey(Form, related_name='submissions', on_delete=models.CASCADE)
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

class FormAccess(models.Model):
    project = models.ForeignKey(Project, related_name='form_access', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    access_level = models.CharField(max_length=50)
    # Add other access fields here

class Setting(models.Model):
    project = models.ForeignKey(Project, related_name='project_settings', on_delete=models.CASCADE)
    key = models.CharField(max_length=100)
    value = models.CharField(max_length=100)
    # Add other settings fields here