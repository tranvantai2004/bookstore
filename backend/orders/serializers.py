from rest_framework import serializers
from .models import Customer, Order, OrderItem
from books.serializers import BookSerializer

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ['id', 'book', 'book_title', 'quantity', 'unit_price', 'subtotal']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'customer', 'customer_name', 'created_by', 'created_by_username',
                  'status', 'total_price', 'note', 'items', 'created_at', 'updated_at']
        read_only_fields = ['total_price', 'created_by']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data, created_by=self.context['request'].user)
        total = 0
        for item_data in items_data:
            book = item_data['book']
            qty = item_data['quantity']
            price = book.price
            OrderItem.objects.create(order=order, book=book, quantity=qty, unit_price=price)
            total += qty * price
            book.stock -= qty
            book.save()
        order.total_price = total
        order.save()
        return order
