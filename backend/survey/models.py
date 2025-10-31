from django.db import models
from accounts.models import UserMaster 


class Survey(models.Model):
    # Basic Property Information
    ward_no = models.PositiveIntegerField(blank=True, null=True)
    property_no = models.CharField(max_length=50, blank=True, null=True)
    old_ward_no = models.CharField(max_length=50, blank=True, null=True)
    old_property_no = models.CharField(max_length=50, blank=True, null=True)
    property_description = models.CharField(max_length=200, blank=True, null=True)

    # Address
    address = models.TextField(blank=True, null=True)
    address_marathi = models.TextField(blank=True, null=True)

    # Water Connection
    water_connection_available = models.CharField(
        max_length=3, 
        choices=[('Yes','Yes'),('No','No')], 
        blank=True, 
        null=True
    )
    number_of_water_connections = models.PositiveIntegerField(blank=True, null=True)
    connection_size = models.CharField(max_length=20, blank=True, null=True)

    # Remarks
    remarks = models.TextField(blank=True, null=True)
    remarks_marathi = models.TextField(blank=True, null=True)

    water_connection_owner_name = models.CharField(max_length=200, blank=True, null=True)
    pending_tax = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, default=0)
    current_tax = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, default=0)
    total_tax = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, default=0)

    # Timestamps
    created_by = models.ForeignKey(UserMaster, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('ward_no', 'property_no')

    def __str__(self):
        return f"Survey - Ward {self.ward_no}, Property {self.property_no}"
