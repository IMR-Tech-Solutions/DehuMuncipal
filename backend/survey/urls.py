from django.urls import path
from . import views

app_name = 'surveys'

urlpatterns = [
    # Survey CRUD URLs
    path('surveys/', views.SurveyListView.as_view(), name='survey-list'),
    path('surveys/create/', views.SurveyCreateView.as_view(), name='survey-create'),
    path('surveys/<int:pk>/', views.SurveyDetailView.as_view(), name='survey-detail'),
    path('surveys-mini/', views.SurveyMiniListViewAPIView.as_view(), name='survey-mini-list'),
    # Excel Export URL
    # 1. Export ALL surveys (No parameters needed)
    path('export-all/', views.SurveyExcelExportAllView.as_view(), name='survey-export-all'),
    
    # 2. Export Ward-wise (Pass ward_no)
    path('export-ward-wise/', views.SurveyExcelExportWardWiseView.as_view(), name='survey-export-ward-wise'),
    
    # 3. Export Property Range-wise (Pass ward_no, property_no_start, property_no_end)
    path('export-property-range/', views.SurveyExcelExportPropertyRangeView.as_view(), name='survey-export-property-range'),

    # Excel Import URL
    path('surveys/import-excel/', views.SurveyExcelImportView.as_view(), name='survey-excel-import'),

    # Template Download URL
    path('surveys/download-template/', views.SurveyExcelTemplateDownloadView.as_view(), name='survey-template-download'),

    path('surveys/statistics/', views.SurveyStatsView.as_view(), name='survey-statistics'),
]

