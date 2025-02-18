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
import random
import string
from django.conf import settings
import re

def generate_random_id(length=7):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def get_ordinal_suffix(n):
    if 10 <= n % 100 <= 20:
        suffix = 'th'
    else:
        suffix = {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th')
    return f'_{n}{suffix}_choice'

def sanitize_name(name):
    return re.sub(r'[^a-zA-Z0-9_]', '', name)

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
        choices_ws = wb.create_sheet(title='choices')

        # Add headers to the survey sheet
        survey_ws.append(['type', 'name', 'label', 'required', 'appearance', 'parameters', 'hint', 'default', 'guidance_hint', 'hxl', 'constraint_message', 'constraint'])

        # Add headers to the choices sheet
        choices_ws.append(['list_name', 'name', 'label'])

        # Add questions to the survey sheet
        for question in questions:
            question_type = question.get('type', 'text')  # Default to 'text' if type is not provided
            question_name = question.get('name', '')
            question_label = question.get('label', '')
            question_required = question.get('required', False)
            question_parameters = question.get('parameters', '')
            question_hint = question.get('hint', '')
            question_default = question.get('default', '')
            question_appearance = question.get('appearance', '')
            question_guidance_hint = question.get('guidance_hint', '')
            question_hxl = question.get('hxl', '')
            question_constraint_message = question.get('constraint_message', '')
            question_constraint = question.get('constraint', '')

            if question_type == 'rating':
                # Generate a single list ID for all select_one questions under this rating question
                list_id = generate_random_id()

                # Add begin_group row
                survey_ws.append(['begin_group', question_name, '', '', 'field-list', '', '', '', '', '', '', ''])

                # Add first select_one row with name <user added name>_header
                survey_ws.append([f'select_one {list_id}', f'{question_name}_header', question_label, '', 'label', '', '', '', '', '', question_constraint_message, question_constraint])

                # Add sub-questions
                for sub_question in question.get('subQuestions', []):
                    sub_question_name = sub_question['name']
                    sub_question_label = sub_question['label']
                    sub_question_required = sub_question['required']
                    sub_question_appearance = sub_question['appearance']
                    sub_question_parameters = sub_question.get('parameters', '')
                    sub_question_constraint_message = question_constraint_message

                    # Ensure the sub-question name starts with an underscore if it starts with a number
                    if sub_question_label and sub_question_label[0].isdigit():
                        sub_question_name = f'_{sub_question_name}'

                    # Sanitize the sub-question name
                    sanitized_sub_question_name = sanitize_name(sub_question_name)

                    # Generate the constraint for the sub-question
                    sub_question_index = sub_question['index']
                    sub_question_constraint = ''
                    for i in range(sub_question_index):
                        other_sub_question_name = question["subQuestions"][i]["name"]
                        if question["subQuestions"][i]["label"][0].isdigit():
                            other_sub_question_name = f'_{other_sub_question_name}'
                        # Sanitize the other sub-question name
                        sanitized_other_sub_question_name = sanitize_name(other_sub_question_name)
                        if sub_question_constraint:
                            sub_question_constraint += ' and '
                        sub_question_constraint += f'${{{sanitized_sub_question_name}}} != ${{{sanitized_other_sub_question_name}}}'

                    survey_ws.append([f'select_one {list_id}', sanitized_sub_question_name, sub_question_label, sub_question_required, sub_question_appearance, sub_question_parameters, '', '', '', '', sub_question_constraint_message, sub_question_constraint])

                # Add end_group row
                survey_ws.append(['end_group', '', '', '', '', '', '', '', '', '', '', ''])

                # Add options to the choices sheet
                options = question.get('options', ['Option 1', 'Option 2'])
                for idx, option in enumerate(options):
                    choices_ws.append([list_id, f'option_{idx + 1}', option])
            else:
                if question_type in ['select_one', 'select_multiple']:
                    list_id = generate_random_id()
                    question_type = f'{question_type} {list_id}'
                    options = question.get('options', [])
                    for idx, option in enumerate(options):
                        choices_ws.append([list_id, f'option_{idx + 1}', option])

                survey_ws.append([question_type, question_name, question_label, question_required, question_appearance, question_parameters, question_hint, question_default, question_guidance_hint, question_hxl, question_constraint_message, question_constraint])

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