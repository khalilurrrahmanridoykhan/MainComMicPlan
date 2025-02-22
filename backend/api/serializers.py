from django.contrib.auth.models import User
from rest_framework import serializers, viewsets, status
from rest_framework.response import Response
from .models import Project, Form, FormAccess, Setting, Submission, Language

class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = '__all__'

class FormSerializer(serializers.ModelSerializer):
    default_language = serializers.PrimaryKeyRelatedField(queryset=Language.objects.all(), allow_null=True, required=False)
    other_languages = serializers.PrimaryKeyRelatedField(queryset=Language.objects.all(), many=True, required=False)

    class Meta:
        model = Form
        fields = '__all__'

class FormViewSet(viewsets.ModelViewSet):
    queryset = Form.objects.all()
    serializer_class = FormSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Handle default_language
        default_language = request.data.get('default_language')

        if default_language:
            instance.default_language_id = default_language

        instance.save()

        return Response(serializer.data)

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
        fields = ['id', 'name', 'description', 'summary', 'form', 'data', 'settings', 'report', 'data_table', 'map', 'microplaning', 'user', 'forms', 'form_access', 'project_settings', 'created_by']

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