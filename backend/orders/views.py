from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from .models import Customer, Order, OrderItem
from .serializers import CustomerSerializer, OrderSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['full_name', 'phone', 'email']

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                with open('error_log.txt', 'a', encoding='utf-8') as f:
                    f.write(f"CUSTOMER CREATE VALIDATION ERROR: {serializer.errors}\nPAYLOAD: {request.data}\n\n")
                return Response(serializer.errors, status=400)
            return super().create(request, *args, **kwargs)
        except Exception as e:
            import traceback
            with open('error_log.txt', 'a', encoding='utf-8') as f:
                f.write(f"CUSTOMER CREATE EXCEPTION: {str(e)}\nTRACEBACK:\n{traceback.format_exc()}\n\n")
            return Response({'detail': str(e)}, status=500)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related('customer', 'created_by').prefetch_related('items__book').all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering = ['-created_at']

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                with open('error_log.txt', 'a', encoding='utf-8') as f:
                    f.write(f"ORDER CREATE VALIDATION ERROR: {serializer.errors}\nPAYLOAD: {request.data}\n\n")
                return Response(serializer.errors, status=400)
            return super().create(request, *args, **kwargs)
        except Exception as e:
            import traceback
            with open('error_log.txt', 'a', encoding='utf-8') as f:
                f.write(f"ORDER CREATE EXCEPTION: {str(e)}\nTRACEBACK:\n{traceback.format_exc()}\n\n")
            return Response({'detail': str(e)}, status=500)

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_admin:
            qs = qs.filter(created_by=self.request.user)
        status = self.request.query_params.get('status')
        if status:
            qs = qs.filter(status=status)
        return qs

    @action(detail=False, methods=['get'], url_path='dashboard')
    def dashboard(self, request):
        if not request.user.is_admin:
            return Response({'error': 'Không có quyền.'}, status=403)
        today = timezone.now().date()
        last_30 = today - timedelta(days=30)
        stats = {
            'total_orders': Order.objects.count(),
            'total_revenue': Order.objects.filter(status='completed').aggregate(Sum('total_price'))['total_price__sum'] or 0,
            'orders_today': Order.objects.filter(created_at__date=today).count(),
            'revenue_last_30_days': Order.objects.filter(
                status='completed', created_at__date__gte=last_30
            ).aggregate(Sum('total_price'))['total_price__sum'] or 0,
            'orders_by_status': {
                s[0]: Order.objects.filter(status=s[0]).count()
                for s in Order.STATUS_CHOICES
            },
        }
        return Response(stats)
