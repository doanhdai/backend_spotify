# from channels.middleware import BaseMiddleware
# from channels.db import database_sync_to_async
# from django.contrib.auth.models import AnonymousUser
# from rest_framework_simplejwt.tokens import AccessToken
# from django.contrib.auth import get_user_model
# import jwt
# import logging

# logger = logging.getLogger(__name__)
# User = get_user_model()

# class JWTAuthMiddleware(BaseMiddleware):
#     async def __call__(self, scope, receive, send):
#         try:
#             # Get the token from headers
#             headers = dict(scope['headers'])
#             logger.info(f"Headers received: {headers}")
            
#             # Try different header formats
#             auth_header = None
#             for header_name in [b'authorization', b'Authorization']:
#                 if header_name in headers:
#                     auth_header = headers[header_name].decode()
#                     break
            
#             if not auth_header:
#                 logger.warning("No authorization header found")
#                 scope['user'] = AnonymousUser()
#                 return await super().__call__(scope, receive, send)
            
#             logger.info(f"Auth header found: {auth_header}")
            
#             if auth_header.startswith('Bearer '):
#                 token = auth_header.split(' ')[1]
#                 try:
#                     # Verify the token
#                     access_token = AccessToken(token)
#                     user_id = access_token.payload.get('user_id')
#                     if user_id:
#                         scope['user'] = await self.get_user(user_id)
#                         logger.info(f"User authenticated successfully: {user_id}")
#                         return await super().__call__(scope, receive, send)
#                     else:
#                         logger.warning("No user_id found in token")
#                 except Exception as e:
#                     logger.error(f"Token verification failed: {str(e)}")
#             else:
#                 logger.warning("Invalid authorization header format")
        
#         except Exception as e:
#             logger.error(f"Error in JWTAuthMiddleware: {str(e)}")
        
#         scope['user'] = AnonymousUser()
#         return await super().__call__(scope, receive, send)

#     @database_sync_to_async
#     def get_user(self, user_id):
#         try:
#             return User.objects.get(id=user_id)
#         except User.DoesNotExist:
#             logger.error(f"User not found: {user_id}")
#             return AnonymousUser() 


from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from urllib.parse import parse_qs
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        try:
            # Get the token from URL query parameters
            query_string = scope.get('query_string', b'').decode()
            query_params = parse_qs(query_string)
            token = query_params.get('token', [None])[0]

            if not token:
                logger.warning("No token found in URL")
                scope['user'] = AnonymousUser()
                return await super().__call__(scope, receive, send)

            logger.info("Token found in URL")
            
            try:
                # Verify the token
                access_token = AccessToken(token)
                user_id = access_token.payload.get('user_id')
                if user_id:
                    scope['user'] = await self.get_user(user_id)
                    logger.info(f"User authenticated successfully: {user_id}")
                    return await super().__call__(scope, receive, send)
                else:
                    logger.warning("No user_id found in token")
            except Exception as e:
                logger.error(f"Token verification failed: {str(e)}")
        
        except Exception as e:
            logger.error(f"Error in JWTAuthMiddleware: {str(e)}")
        
        scope['user'] = AnonymousUser()
        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            logger.error(f"User not found: {user_id}")
            return AnonymousUser()