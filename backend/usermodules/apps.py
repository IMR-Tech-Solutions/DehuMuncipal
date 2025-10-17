from django.apps import AppConfig


class UsermodulesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'usermodules'

    def ready(self):
        import usermodules.signals
