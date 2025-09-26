from django.urls import path
from . import views

urlpatterns = [
    path('reports/', views.community_reports, name='community_reports'),
    path('reports/<int:report_id>/', views.report_detail, name='report_detail'),
    path('reports/create/', views.create_report, name='create_report'),
    path('reports/my/', views.my_reports, name='my_reports'),
    path('reports/<int:report_id>/vote/', views.vote_report, name='vote_report'),
    path('challenges/', views.challenges, name='challenges'),
    path('challenges/<int:challenge_id>/join/', views.join_challenge, name='join_challenge'),
    path('analytics/', views.analytics, name='community_analytics'),
]