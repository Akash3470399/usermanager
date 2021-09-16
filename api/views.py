from re import template
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth.models import User
from django.contrib.auth import authenticate

from .serializers import UserSerializer, AddressSerializer
from .models import Address

class UserSignUpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = dict(request.data)
        password, address = data['password'], data['address']
        del data['password'], data['address']

        #checking if user with email already exists
        try:
            u = User.objects.filter(email= data['email'])
            if u:
                return Response({'errors':{'email':['user with this email already exits.']}})
        except:
            pass

        # creating new user
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.set_password(password)
            user.save()
            data = {'user':user.id, 'address':address}

            address_serializer = AddressSerializer(data = data)
            if address_serializer.is_valid():
                address_serializer.save()
                res = serializer.data
                res['address']= address
                return Response(res, status.HTTP_201_CREATED)
            else:
                user.delete()
                return Response({'errors':address_serializer.errors}, status.HTTP_400_BAD_REQUEST)
            
        return Response({'errors':serializer.errors}, status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes =[AllowAny]
    def post(self, request):
        user = User.objects.filter(email=request.data['email']).first()
        if user:
            try:
                usr_auth = authenticate(username=user.username, password=request.data['password'])
            except:
                # print('error')
                pass

            if usr_auth:
                tokens = RefreshToken.for_user(user)
                token = {'refresh':str(tokens), 'access':str(tokens.access_token)}
                users = User.objects.all();
                res =[]
                for user in users:
                    user_serializer = UserSerializer(user)
                    temp = user_serializer.data
                    address = Address.objects.filter(user=user).first()
                    temp['id'] = user.id
                    temp['address'] = address.address
                    res.append(temp)
                print(res)    
                return Response({'data':res, 'token':token}, status.HTTP_200_OK)
            else:
                return Response({'errors': "please check the credentials.",}, status.HTTP_400_BAD_REQUEST)
        return Response({'errors':"user with this email don't exits."}, status.HTTP_400_BAD_REQUEST)

class UpdateView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        print(request.headers)
        req_data = dict(request.data)
        user = User.objects.get(id=req_data['id'])
        serializer = UserSerializer(instance=user, data={'username':req_data['username'], 'email':req_data['email']})
        if serializer.is_valid():
            a = Address.objects.get(user=user)
            add_serializer = AddressSerializer(a, data={'address':req_data['address']})
            if add_serializer.is_valid():
                a = add_serializer.save()
            serializer.save()
            res = serializer.data
            res['address'] = a.address
            print('done')
            return Response({'data':res}, status.HTTP_201_CREATED)
        else: 
            return Response({'errors':serializer.errors}, status.HTTP_400_BAD_REQUEST)

class DeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        id = request.data['id']

        User.objects.get(id = id).delete()

        return Response({'data':'user deleted'},status.HTTP_200_OK)