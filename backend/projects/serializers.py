from rest_framework import serializers
from .models import Project
from accounts.serializers import UserSerializer

class ProjectSerializer(serializers.ModelSerializer):
    created_by_details = UserSerializer(source='created_by', read_only=True)
    workers_details = UserSerializer(source='workers', many=True, read_only=True)
    worker_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'status', 'created_by_details', 'workers_details', 'worker_ids', 'created_at', 'updated_at']

    def create(self, validated_data):
        worker_ids = validated_data.pop('worker_ids', [])
        project = Project.objects.create(**validated_data)
        if worker_ids:
            project.workers.set(worker_ids)
        return project

    def update(self, instance, validated_data):
        worker_ids = validated_data.pop('worker_ids', None)
        if worker_ids is not None:
            instance.workers.set(worker_ids)
        return super().update(instance, validated_data)
