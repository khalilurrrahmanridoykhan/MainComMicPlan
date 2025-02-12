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

        # Load the XLSX template
        template_path = os.path.join(settings.MEDIA_ROOT, 'template/commicplan_form_template.xlsx')
        if not os.path.exists(template_path):
            return Response({'error': 'Template file not found'}, status=status.HTTP_404_NOT_FOUND)

        wb = openpyxl.load_workbook(template_path)
        ws = wb.active

        # Update the template with form data
        ws['A1'] = form.name  # Example of updating a cell

        # Add questions to the template
        start_row = 2  # Starting row for questions
        for idx, question in enumerate(questions, start=start_row):
            ws[f'A{idx}'] = question

        # Save the new XLSX file
        output_dir = os.path.join(settings.MEDIA_ROOT, 'update')
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, f'{form.name}.xlsx')
        wb.save(output_path)

        # Create additional files for the form
        extra_file_path = os.path.join(output_dir, f'{form.name}_extra.txt')
        with open(extra_file_path, 'w') as f:
            f.write('Extra file content')

        return Response({'message': 'Form created and files generated successfully'}, status=status.HTTP_201_CREATED)

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