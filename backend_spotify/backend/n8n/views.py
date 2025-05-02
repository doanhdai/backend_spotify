from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from songs.models import Song, Playlist

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def ai_music(request):
    """
    Nhận message từ frontend, gửi đến n8n để xử lý intent,
    sau đó tương tác với MySQL qua Django ORM và trả về kết quả.
    """
    # Parse request payload
    try:
        payload = request.data
        message = payload.get('message', '').strip()
        current_song_id = payload.get('currentSongId', None)
        print(f"Received payload: {payload}")
        
        # Kiểm tra message hợp lệ
        if not message:
            return JsonResponse({'status': 'fail', 'message': 'Message không được để trống.'}, status=400)
    except Exception as e:
        print(f"Error parsing payload: {str(e)}")
        return JsonResponse({'status': 'fail', 'message': 'Payload không hợp lệ.'}, status=400)

    # Gửi message tới n8n Webhook
    try:
        n8n_resp = requests.post(
            'http://localhost:5678/webhook/spotify-ai',
            json={'message': message},
            timeout=5
        )
        print(f"n8n status code: {n8n_resp.status_code}")
        print(f"n8n raw response: {n8n_resp.text}")
        
        # Kiểm tra phản hồi có phải JSON không
        try:
            n8n_data = n8n_resp.json()
            print(f"Parsed n8n response: {n8n_data}")
        except ValueError:
            print("n8n response is not valid JSON")
            return JsonResponse({'status': 'fail', 'message': 'Phản hồi từ n8n không phải JSON hợp lệ.'}, status=502)
    except requests.RequestException as e:
        print(f"Error connecting to n8n: {str(e)}")
        return JsonResponse({'status': 'fail', 'message': 'Không thể kết nối n8n.'}, status=502)

    # Kiểm tra intent
    if 'intent' not in n8n_data:
        print("Missing 'intent' in n8n response")
        return JsonResponse({'status': 'fail', 'message': 'Không nhận được intent hợp lệ từ n8n.'}, status=400)

    intent = n8n_data.get('intent')

    # Hàm xử lý intent
    def handle_search_mood():
        mood = n8n_data.get('mood', '')
        if not mood:
            return JsonResponse({'status': 'fail', 'message': 'Không xác định được mood.'}, status=400)
        # Giới hạn số lượng bản ghi để tối ưu hiệu suất
        song = Song.objects.filter(mood__icontains=mood)[:10].order_by('?').first()
        if not song:
            return JsonResponse({'status': 'fail', 'message': f"Không tìm thấy nhạc theo mood '{mood}'."}, status=404)
        return JsonResponse({'status': 'success', 'song': {'title': song.title, 'url': song.audio_url}})

    def handle_play_song():
        title = n8n_data.get('song', '')
        if not title:
            return JsonResponse({'status': 'fail', 'message': 'Không xác định được bài hát.'}, status=400)
        song = Song.objects.filter(title__iexact=title).first()
        if not song:
            return JsonResponse({'status': 'fail', 'message': f"Không tìm thấy bài '{title}'."}, status=404)
        return JsonResponse({'status': 'success', 'song': {'title': song.title, 'url': song.audio_url}})

    def handle_add_to_playlist():
        playlist_name = n8n_data.get('playlist', '')
        user = request.user
        if not user or user.is_anonymous:
            return JsonResponse({'status': 'fail', 'message': 'Vui lòng đăng nhập để thao tác.'}, status=401)
        if not playlist_name or not current_song_id:
            return JsonResponse({'status': 'fail', 'message': 'Thiếu thông tin playlist hoặc bài hát.'}, status=400)
        playlist = Playlist.objects.filter(name__iexact=playlist_name, user=user).first()
        if not playlist:
            return JsonResponse({'status': 'fail', 'message': f"Không tìm thấy playlist '{playlist_name}'."}, status=404)
        try:
            song = Song.objects.get(id=current_song_id)
        except Song.DoesNotExist:
            return JsonResponse({'status': 'fail', 'message': 'Bài hát không tồn tại.'}, status=404)
        playlist.songs.add(song)
        return JsonResponse({'status': 'success', 'message': f"Đã thêm '{song.title}' vào playlist '{playlist.name}'."})

    def handle_simple_intent():
        return JsonResponse({'status': 'success', 'intent': intent})

    # Ánh xạ intent với hàm xử lý
    intent_handlers = {
        'search_mood': handle_search_mood,
        'play_song': handle_play_song,
        'add_to_playlist': handle_add_to_playlist,
        'pause': handle_simple_intent,
        'next': handle_simple_intent,
    }

    # Thực thi hàm xử lý tương ứng
    handler = intent_handlers.get(intent)
    if handler:
        return handler()
    return JsonResponse({'status': 'fail', 'message': 'Yêu cầu không hợp lệ.'}, status=400)