from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Project, Form, FormAccess, Setting, Submission

class FormSerializer(serializers.ModelSerializer):
    class Meta:
        model = Form
        fields = '__all__'

class FormAccessSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormAccess
        fields = '__all__'

class SettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setting
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    forms = FormSerializer(many=True, read_only=True)
    form_access = FormAccessSerializer(many=True, read_only=True)
    project_settings = SettingSerializer(many=True, read_only=True)
    created_by = serializers.ReadOnlyField(source='created_by.username')

    class Meta:
        model = Project
        fields = ['name', 'description', 'summary', 'form', 'data', 'settings', 'forms', 'form_access', 'project_settings', 'created_by']

class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user