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
    translations = models.JSONField(default=dict, blank=True)
    def __str__(self):
        return self.name

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Check if the request is to update the default language
        update_default_language = request.data.get('update_default_language', False)

        # Update the associated XLSX file
        form = serializer.instance
        questions = request.data.get('questions', form.questions)  # Get questions from the request data or use existing
        default_language = form.default_language_id
        default_language_description = Language.objects.get(id=default_language).description if default_language else ''

        output_dir = os.path.join(settings.MEDIA_ROOT, 'update')
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, f'{form.name}.xlsx')

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

        # Add default_language to the settings sheet if updating default language
        if update_default_language:
            settings_ws.append(['default_language'])
            settings_ws.append([default_language_description])

        wb.save(output_path)

        return Response(serializer.data)

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