from rest_framework import serializers
from .models import Survey


class SurveySerializer(serializers.ModelSerializer):
    created_by = serializers.CharField(source='created_by.email', read_only=True)

    class Meta:
        model = Survey
        fields = '__all__'

    def create(self, validated_data):
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            validated_data["created_by"] = request.user
        
        return Survey.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
