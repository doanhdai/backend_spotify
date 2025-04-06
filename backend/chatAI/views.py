import requests
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
import os

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyDL9QAPI5FXCeJ_Nm3h9EoJ2kicyqUmIBA')

@api_view(["POST"])
def chat_with_ai(request):
    if not GEMINI_API_KEY:
        return Response(
            {"error": "API key not configured"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    user_message = request.data.get("message", "")
    if not user_message:
        return Response(
            {"error": "Message is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Prepare the request payload with Vietnamese language support
        payload = {
            "contents": [{
                "parts": [{
                    "text": user_message
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 1024,
            },
            "safetySettings": [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        params = {
            "key": GEMINI_API_KEY
        }

        # Make the API request
        response = requests.post(GEMINI_API_URL, json=payload, headers=headers, params=params)
        response.raise_for_status()
        
        # Parse the response
        response_data = response.json()
        bot_response = response_data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "Xin lỗi, tôi không hiểu.")

        return Response({"bot_response": bot_response}, status=status.HTTP_200_OK)

    except requests.exceptions.RequestException as e:
        error_message = str(e)
        if hasattr(e.response, 'json'):
            error_details = e.response.json()
            error_message = f"API Error: {error_details.get('error', {}).get('message', str(e))}"
        
        return Response(
            {
                "error": "Lỗi kết nối Google Gemini",
                "details": error_message
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    except Exception as e:
        return Response(
            {
                "error": "Lỗi hệ thống",
                "details": str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
