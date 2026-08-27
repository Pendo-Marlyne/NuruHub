from django.conf import settings
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Resource(models.Model):
    TYPE_NOTES = 'notes'
    TYPE_GUIDE = 'guide'
    TYPE_FLASHCARDS = 'flashcards'
    TYPE_SUMMARY = 'summary'
    TYPE_QUESTIONS = 'questions'
    TYPE_PASTPAPER = 'pastpaper'
    TYPE_REFERENCE = 'reference'
    TYPE_CHOICES = [
        (TYPE_NOTES, 'Study Notes'),
        (TYPE_GUIDE, 'Revision Guide'),
        (TYPE_FLASHCARDS, 'Flashcards'),
        (TYPE_SUMMARY, 'Study Summary'),
        (TYPE_QUESTIONS, 'Practice Questions'),
        (TYPE_PASTPAPER, 'Past Paper'),
        (TYPE_REFERENCE, 'Reference Book'),
    ]

    STATUS_PENDING = 'pending'
    STATUS_APPROVED = 'approved'
    STATUS_REJECTED = 'rejected'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending Review'),
        (STATUS_APPROVED, 'Approved'),
        (STATUS_REJECTED, 'Rejected'),
    ]

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='uploaded_resources'
    )
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='resources'
    )
    title = models.CharField(max_length=300)
    description = models.TextField()
    course_code = models.CharField(max_length=20, blank=True)
    course_name = models.CharField(max_length=200, blank=True)
    topic = models.CharField(max_length=200, blank=True)
    university = models.CharField(max_length=200, blank=True)
    resource_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default=TYPE_NOTES)
    file = models.FileField(upload_to='resources/', blank=True, null=True)
    preview_url = models.URLField(blank=True)
    is_free = models.BooleanField(default=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    can_sell = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    is_premium = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    download_count = models.PositiveIntegerField(default=0)
    purchase_count = models.PositiveIntegerField(default=0)
    average_rating = models.FloatField(default=0.0)
    rating_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class BookListing(models.Model):
    CONDITION_NEW = 'new'
    CONDITION_GOOD = 'good'
    CONDITION_FAIR = 'fair'
    CONDITION_WORN = 'worn'
    CONDITION_CHOICES = [
        (CONDITION_NEW, 'New'),
        (CONDITION_GOOD, 'Good'),
        (CONDITION_FAIR, 'Fair'),
        (CONDITION_WORN, 'Worn'),
    ]

    LIST_BORROW = 'borrow'
    LIST_LEND = 'lend'
    LIST_SELL = 'sell'
    LISTING_TYPE_CHOICES = [
        (LIST_BORROW, 'Borrow'),
        (LIST_LEND, 'Lend'),
        (LIST_SELL, 'Sell'),
    ]

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='book_listings'
    )
    title = models.CharField(max_length=300)
    author = models.CharField(max_length=200)
    edition = models.CharField(max_length=50, blank=True)
    course = models.CharField(max_length=200, blank=True)
    condition = models.CharField(max_length=10, choices=CONDITION_CHOICES, default=CONDITION_GOOD)
    listing_type = models.CharField(max_length=10, choices=LISTING_TYPE_CHOICES, default=LIST_LEND)
    is_available = models.BooleanField(default=True)
    location = models.CharField(max_length=300, blank=True)
    contact_info = models.CharField(max_length=200, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Order(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_SUCCESSFUL = 'successful'
    STATUS_FAILED = 'failed'
    STATUS_CANCELLED = 'cancelled'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_SUCCESSFUL, 'Successful'),
        (STATUS_FAILED, 'Failed'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders'
    )
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='order_items')
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.resource.title} - {self.order_id}"


class Payment(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_SUCCESSFUL = 'successful'
    STATUS_FAILED = 'failed'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_SUCCESSFUL, 'Successful'),
        (STATUS_FAILED, 'Failed'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments'
    )
    phone_number = models.CharField(max_length=15)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    mpesa_receipt = models.CharField(max_length=50, blank=True)
    checkout_request_id = models.CharField(max_length=100, blank=True)
    merchant_request_id = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    callback_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)


class ResourceOwnership(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_resources'
    )
    resource = models.ForeignKey(
        Resource, on_delete=models.CASCADE, related_name='owners'
    )
    order = models.ForeignKey(
        Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='ownerships'
    )
    purchased_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'resource']


class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites'
    )
    resource = models.ForeignKey(
        Resource, on_delete=models.CASCADE, related_name='favorited_by'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'resource']


class Review(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews'
    )
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField()
    comment = models.TextField(blank=True)
    helpful_count = models.PositiveIntegerField(default=0)
    not_helpful_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'resource']
        ordering = ['-created_at']


class Report(models.Model):
    STATUS_OPEN = 'open'
    STATUS_REVIEWED = 'reviewed'
    STATUS_RESOLVED = 'resolved'
    STATUS_CHOICES = [
        (STATUS_OPEN, 'Open'),
        (STATUS_REVIEWED, 'Reviewed'),
        (STATUS_RESOLVED, 'Resolved'),
    ]

    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports_filed'
    )
    resource = models.ForeignKey(
        Resource, on_delete=models.CASCADE, related_name='reports', null=True, blank=True
    )
    book_listing = models.ForeignKey(
        BookListing, on_delete=models.CASCADE, related_name='reports', null=True, blank=True
    )
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_OPEN)
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
