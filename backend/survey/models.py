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

    # Property Owner (मालमत्ता धारकाचे नाव)
    property_owner_name = models.CharField(max_length=200, blank=True, null=True)

    # Property Type (मालमतेचा प्रकार)
    property_type = models.CharField(
        max_length=50,
        choices=[
            ('घरगुती', 'Residential'),
            ('अपार्टमेंट', 'Apartment'),
            ('बहुमजली इमारत', 'Multi-story Building')
        ],
        blank=True,
        null=True
    )

    # Pipe Holder Name (नळधारकाचे नाव)
    pipe_holder_name = models.CharField(max_length=200, blank=True, null=True)

    # Water Connection
    water_connection_available = models.CharField(
        max_length=3, 
        choices=[('Yes','Yes'),('No','No')], 
        blank=True, 
        null=True
    )

    # Connection Type (कनेक्शन प्रकार)
    connection_type = models.CharField(
        max_length=50,
        choices=[
            ('निवासी', 'Residential'),
            ('अनिवासी', 'Non-residential'),
            ('इतर', 'Other')
        ],
        blank=True,
        null=True
    )

    # Connection Size (कनेक्शन साईज)
    connection_size = models.CharField(max_length=20, blank=True, null=True)

    # Connection Number (कनेक्शन संख्या)
    connection_number = models.CharField(max_length=50, blank=True, null=True, unique=True)

    # Pipe Holder Contact Number (नळ धारकाचा संपर्क क्रमांक)
    pipe_holder_contact = models.CharField(max_length=15, blank=True, null=True)

    # Connection Photo (कनेक्शन सह फोटो)
    connection_photo = models.ImageField(upload_to='connection_photos/', blank=True, null=True)

    # Old Connection Number (जुना कनेक्शन क्रमांक)
    old_connection_number = models.CharField(max_length=50, blank=True, null=True)

    # Water Connection Owner Name
    water_connection_owner_name = models.CharField(max_length=200, blank=True, null=True)

    # Water Bill Arrears (पानीपटी थकबाकी)
    pending_tax = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, default=0)
    current_tax = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, default=0)
    total_tax = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, default=0)

    # Remarks
    remarks = models.TextField(blank=True, null=True)
    remarks_marathi = models.TextField(blank=True, null=True)

    # Timestamps
    created_by = models.ForeignKey(UserMaster, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('ward_no', 'property_no')

    def __str__(self):
        return f"Survey - Ward {self.ward_no}, Property {self.property_no}"
