from django.urls import path
from . import views

app_name = 'surveys'

urlpatterns = [
    # Survey CRUD URLs
    path('surveys/', views.SurveyListView.as_view(), name='survey-list'),
    path('surveys/create/', views.SurveyCreateView.as_view(), name='survey-create'),
    path('surveys/<int:pk>/', views.SurveyDetailView.as_view(), name='survey-detail'),
    
    # Excel Export URL
    path('surveys/export-excel/', views.SurveyExcelExportView.as_view(), name='survey-excel-export'),

    # Excel Import URL
    path('surveys/import-excel/', views.SurveyExcelImportView.as_view(), name='survey-excel-import'),

    # Template Download URL
    path('surveys/download-template/', views.SurveyExcelTemplateDownloadView.as_view(), name='survey-template-download'),

    path('surveys/statistics/', views.SurveyStatsView.as_view(), name='survey-statistics'),
]

