from rest_framework import serializers  
from .ActorBankAccountModel import ActorBankAccountModel

class ActorBankAccountSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = ActorBankAccountModel
        fields = '__all__'
