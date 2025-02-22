from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import JSONField

class Project(models.Model):
    name = models.CharField(max_length=255)
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

    def __str__(self):
        return self.name

class Form(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='forms')  # Set related_name to 'forms'
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)  # Add this line
    questions = models.JSONField(default=list)  # Use django.db.models.JSONField
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    default_language = models.ForeignKey('Language', null=True, blank=True, on_delete=models.SET_NULL, related_name='default_forms')
    other_languages = models.ManyToManyField('Language', blank=True, related_name='other_forms')

    def __str__(self):
        return self.name

class Submission(models.Model):
    form = models.ForeignKey(Form, related_name='submissions', on_delete=models.CASCADE)
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

class FormAccess(models.Model):
    project = models.ForeignKey(Project, related_name='form_access', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    access_level = models.CharField(max_length=50)

class Setting(models.Model):
    project = models.ForeignKey(Project, related_name='project_settings', on_delete=models.CASCADE)
    key = models.CharField(max_length=100)
    value = models.CharField(max_length=100)

class Language(models.Model):
    subtag = models.CharField(max_length=10, unique=True)
    type = models.CharField(max_length=50)
    description = models.TextField()
    added = models.DateField()
    deprecated = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.subtag