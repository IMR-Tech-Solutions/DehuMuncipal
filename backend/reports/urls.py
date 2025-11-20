# reports/urls.py
from django.urls import path
from .views_115 import SingleReport115GenerateView, BulkReport115GenerateView


app_name = 'reports'

urlpatterns = [
    # 115 Reports
    path('115/single/<int:survey_id>/', SingleReport115GenerateView.as_view(), name='single-report-115'),
    path('115/bulk/', BulkReport115GenerateView.as_view(), name='bulk-report-115'),

    
]
