from django.core.mail import send_mail
from django.conf import settings

def send_reset_password_email(user_email, otp_code, user_name):
    subject = 'Password Reset Code - IMR Tech Solutions'
    message = f'''
    Hi {user_name}!
    
    Your password reset code is: {otp_code}
    
    This code will expire in 15 minutes.
    
    If you didn't request this, please ignore this email.
    
    Best regards,
    IMR Tech Team
    '''
    
    try:
        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,
            [user_email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Email sending failed: {e}")
        return False
