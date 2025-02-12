# backend/api/views.py
from django.shortcuts import render
from rest_framework import viewsets, status
from .models import Form, Submission, Project
from .serializers import FormSerializer, SubmissionSerializer, ProjectSerializer, UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.decorators import action
import openpyxl
import os
from django.conf import settings

class FormViewSet(viewsets.ModelViewSet):
    queryset = Form.objects.all()
    serializer_class = FormSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def create_form(self, request, pk=None):
        project = Project.objects.get(pk=pk)
        form_name = request.data.get('name')
        questions = request.data.get('questions', [])  # Get questions from the request data
        form = Form.objects.create(project=project, name=form_name)

        # Create a new workbook and add the survey and settings sheets
        wb = openpyxl.Workbook()
        survey_ws = wb.active
        survey_ws.title = 'survey'
        settings_ws = wb.create_sheet(title='settings')

        # Add headers to the survey sheet
        survey_ws.append(['type', 'name', 'label'])

        # Add questions to the survey sheet
        for question in questions:
            question_type = question.get('type', 'text')  # Default to 'text' if type is not provided
            question_name = question.get('name', '')
            question_label = question.get('label', '')
            survey_ws.append([question_type, question_name, question_label])

        # Save the new XLSX file
        output_dir = os.path.join(settings.MEDIA_ROOT, 'update')
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, f'{form.name}.xlsx')
        wb.save(output_path)

        return Response({'message': 'Form created and files generated successfully', 'file_url': request.build_absolute_uri(output_path)}, status=status.HTTP_201_CREATED)

class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def forms(self, request, pk=None):
        project = self.get_object()
        forms = Form.objects.filter(project=project)
        serializer = FormSerializer(forms, many=True)
        return Response(serializer.data)

class CustomAuthToken(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key})
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

class RegisterUser(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)