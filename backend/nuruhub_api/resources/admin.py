from django.contrib import admin

from .models import (
    BookListing, Category, Favorite, Order, OrderItem, Payment,
    Report, Resource, ResourceOwnership, Review,
)

admin.site.register(Category)
admin.site.register(Resource)
admin.site.register(BookListing)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Payment)
admin.site.register(ResourceOwnership)
admin.site.register(Favorite)
admin.site.register(Review)
admin.site.register(Report)
