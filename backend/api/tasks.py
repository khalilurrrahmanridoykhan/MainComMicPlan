from celery import shared_task
from .models import Submission

@shared_task
def process_submission(submission_id):
    submission = Submission.objects.get(id=submission_id)
    # Process submission data (e.g., validation, transformation)
    return f"Processed submission {submission_id}"
