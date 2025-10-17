from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_password_reset_email_task(self, user_email, otp_code, user_name):
    subject = 'Password Reset Code - IMR Tech Solutions'
    message = f"""
    Hi {user_name}!

    Your password reset code is: {otp_code}

    This code will expire in 5 minutes.

    If you didn't request this, please ignore this email.

    Best regards,
    IMR Tech Team
    """
    try:
        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,
            [user_email],
            fail_silently=False,
        )
        
        logger.info(f"Password reset email sent successfully to {user_email}")
        return f"Email sent successfully to {user_email}"
        
    except Exception as exc:
        logger.error(f"Failed to send email to {user_email}: {str(exc)}")
        
        # Retry the task
        try:
            raise self.retry(exc=exc, countdown=60)
        except self.MaxRetriesExceededError:
            logger.error(f"Max retries exceeded for email to {user_email}")
            return f"Failed to send email to {user_email} after 3 attempts"
