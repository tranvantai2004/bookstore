from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, BookViewSet

router = DefaultRouter()
router.register('categories', CategoryViewSet)
router.register('', BookViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
