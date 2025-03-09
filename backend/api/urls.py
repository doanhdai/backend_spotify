from django.urls import path, include
from . import views

urlpatterns = [
    path('notes/', views.TaskListCreateView.as_view(), name='notes'),
    path('notes/delete/<int:pk>/', views.TaskDeleteView.as_view(), name='note'),
    
]