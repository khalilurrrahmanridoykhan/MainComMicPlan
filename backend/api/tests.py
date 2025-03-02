from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Form, Language, Project
import json

class UpdateTranslationsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.project = Project.objects.create(name="Test Project", description="Test Description")
        self.default_language = Language.objects.create(description="English", subtag="en")
        self.other_language = Language.objects.create(description="Spanish", subtag="es")
        self.form = Form.objects.create(
            project=self.project,
            name="Test Form",
            questions=[
                {
                    "type": "text",
                    "name": "question1",
                    "label": "Question 1",
                    "subQuestions": [
                        {
                            "type": "text",
                            "name": "subquestion1",
                            "label": "Sub Question 1"
                        }
                    ]
                }
            ],
            default_language=self.default_language
        )
        self.form.other_languages.add(self.other_language)

    def test_update_translations(self):
        url = reverse('update_translations', args=[self.form.id])
        data = {
            "translations": {
                "Question 1": "Pregunta 1",
                "Sub Question 1": "Sub Pregunta 1"
            },
            "language_subtag": "es"
        }
        response = self.client.put(url, data=json.dumps(data), content_type='application/json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.form.refresh_from_db()
        self.assertEqual(self.form.questions[0]['translations']['Spanish (es)'], "Pregunta 1")
        self.assertEqual(self.form.questions[0]['subQuestions'][0]['translations']['Spanish (es)'], "Sub Pregunta 1")

if __name__ == "__main__":
    TestCase.main()
