from django.db import models
from accounts.models import UserMaster 


class Survey(models.Model):
    # 1. Old Water Connection Number
    old_connection_number = models.CharField(max_length=50, blank=True, null=True)
    
    # 2. Ward No
    ward_no = models.PositiveIntegerField(blank=True, null=True)
    
    # 3. Property No
    property_no = models.CharField(max_length=50, blank=True, null=True)
    
    # 4. Property Description
    property_description = models.CharField(max_length=200, blank=True, null=True)
    
    # 5. Property Owner Name
    property_owner_name = models.CharField(max_length=200, blank=True, null=True)
    property_owner_name_marathi = models.CharField(max_length=200, blank=True, null=True)
    
    # 6. Property Type
    property_type = models.CharField(
        max_length=50,
        choices=[
            ('घरगुती', 'Residential'),
            ('अनिवासी', 'Non-residential'),
            ('औद्योगिक', 'Industrial'),
            ('अपार्टमेंट', 'Apartment'),
            ('बहुमजली इमारत', 'Multi-story Building'),
    ],
        blank=True,
        null=True
    )
    
    # 7. Water Connection Owner Name
    water_connection_owner_name = models.CharField(max_length=200, blank=True, null=True)
    water_connection_owner_name_marathi = models.CharField(max_length=200, blank=True, null=True)
    
    # 8. Connection Type
    connection_type = models.CharField(
        max_length=50,
        choices=[
            ('अधिकृत', 'अधिकृत'),
            ('अनधिकृत', 'अनधिकृत'),
        ],
        blank=True,
        null=True
    )
    
    # 10. Connection Size
    connection_size = models.CharField(max_length=20, blank=True, null=True)
    
    # 11. Number of Water Connections
    number_of_water_connections = models.PositiveIntegerField(blank=True, null=True)
    
    # 12. Mobile Number
    mobile_number = models.CharField(max_length=15, blank=True, null=True)
    
    # 13. Address
    address = models.TextField(blank=True, null=True)
    address_marathi = models.TextField(blank=True, null=True)
    
    # 14. Tax Information (Pending, Current, Total)
    pending_tax = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, default=0)
    current_tax = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, default=0)
    total_tax = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, default=0)
    
    # 15. Connection Photo
    connection_photo = models.ImageField(upload_to='connection_photos/', blank=True, null=True)
    
    # 16. Remarks
    remarks = models.TextField(blank=True, null=True)
    remarks_marathi = models.TextField(blank=True, null=True)

    road_name = models.CharField(max_length=200, blank=True, null=True)
    pincode = models.CharField(max_length=10, blank=True, null=True)
    
    # Timestamps
    created_by = models.ForeignKey(UserMaster, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ('ward_no', 'property_no')
    
    def __str__(self):
        return f"Survey - Ward {self.ward_no}, Property {self.property_no}"
