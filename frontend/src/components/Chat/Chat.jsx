import { useState, useEffect, useRef, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faSearch, faUser } from '@fortawesome/free-solid-svg-icons';
import { AiOutlineUsergroupAdd } from 'react-icons/ai';
import { IoMdMore } from 'react-icons/io';
import { useSelector, useDispatch } from 'react-redux';
import { wsService } from '@/api/websocket';
import { formatDate, formatHours } from '@/Utils/index';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { CiFaceSmile } from 'react-icons/ci';
import {
    getAllConversation,
    getChat,
    getAllUser,
    createConversation,
    getChatAI,
    createGroupChat,
    remove_participant,
    add_participant,
    leaveGroupChat,
} from '@/service/apiService';
import { setConversations, setCurrentConversation, setMessages, addMessage } from '@/redux/Reducer/chatSlice';
import { assets } from '@/assets/assets';
import meta from '../../assets/images/albums/meta-ai.png';

function Chat() {
    const dispatch = useDispatch();
    const { conversations, currentConversation, messages } = useSelector((state) => state.chat);
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    const id_user = localStorage.getItem('id_user');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [messagesAI, setMessagesAI] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const messagesEndRef = useRef(null);
    const [showLeaveMenu, setShowLeaveMenu] = useState(false);
    const metaAIConversation = useMemo(
        () => ({
            id: 'meta_ai',
            name: 'Meta AI',
            participants: [{ id: 1, name: 'Meta AI', email: 'metaai@ai.com', avatar: null }],
            created_at: '2025-04-03T06:30:27.868463Z',
            updated_at: '2025-04-03T06:30:27.868463Z',
            last_message: null,
            unread_count: 0,
            type: 'meta_ai',
        }),
        [],
    );
    console.log(conversations);
    useEffect(() => {
        if (isLoggedIn) {
            wsService.connect();
            fetchConversations();
        }
        return () => wsService.disconnect();
    }, [isLoggedIn]);
    const handleEmojiSelect = (emoji) => {
        setNewMessage((prev) => prev + emoji.native);
    };
    const fetchConversations = async () => {
        try {
            const { data } = await getAllConversation();
            console.log('Fetched conversations:', data.conversations);

            // Tách dữ liệu thành private và group từ data.conversations
            const privateChats = data.conversations.filter((conv) => conv.type_conversation === 'private');
            const groupChats = data.conversations.filter((conv) => conv.type_conversation === 'group');

            dispatch(setConversations([...privateChats, ...groupChats]));
        } catch (error) {
            console.error('Error fetching conversations:', error);
            dispatch(setConversations([]));
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }
        try {
            const { data } = await getAllUser();
            const filteredUsers = data.filter(
                (user) => user.name.toLowerCase().includes(query.toLowerCase()) && user.id !== parseInt(id_user),
            );
            setSearchResults(filteredUsers);
            setShowSearchResults(true);
        } catch (error) {
            console.error('Error searching users:', error);
            setSearchResults([]);
        }
    };

    const handleUserSelect = async (user) => {
        // console
        const existingConversation = conversations.find(
            (conv) => conv.type_conversation === 'private' && conv.participants.some((p) => p.id === user.id),
        );

        try {
            const conversation = existingConversation || (await createConversation({ participant_id: user.id })).data;
            if (!existingConversation) {
                dispatch(setConversations([...conversations, { ...conversation, type: 'conversation' }]));
            }
            handleConversationSelect({ ...conversation, type: 'conversation' });
        } catch (error) {
            console.error('Error creating conversation:', error);
        } finally {
            setSearchQuery('');
            setSearchResults([]);
            setShowSearchResults(false);
        }
    };

    const fetchMessages = async (conversationId) => {
        try {
            const { data } = await getChat(conversationId);
            dispatch(setMessages(data));
        } catch (error) {
            console.error('Error fetching messages:', error);
            dispatch(setMessages([]));
        }
    };

    const handleConversationSelect = (conversation) => {
        setSelectedConversation(conversation);
        dispatch(setCurrentConversation(conversation));
        if (conversation.id === 'meta_ai') {
            setMessagesAI([]);
        } else {
            fetchMessages(conversation.id);
        }
        scrollToBottom();
    };

    const scrollToBottom = () => {
        // Cuộn ngay lập tức xuống cuối mà không có hiệu ứng trượt
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
    };
    // thay đổi khi có tin nhắn
    useEffect(() => {
        scrollToBottom();
    }, [messages, messagesAI]);

    useEffect(() => {
        const handleNewMessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                const isGroupChat = !!message.group_chat_id;
                // Chuẩn hóa convId để khớp với selectedConversation.id
                const convId = isGroupChat ? message.group_chat_id : message.conversation_id;

                // Chuẩn hóa timestamp
                const timestamp =
                    message.timestamp && !isNaN(new Date(message.timestamp).getTime())
                        ? message.timestamp
                        : new Date().toISOString();

                console.log('Received message:', {
                    message,
                    convId,
                    selectedConversationId: selectedConversation?.id,
                    isGroupChat,
                });

                // Cập nhật tin nhắn trong cuộc hội thoại đang chọn
                if (selectedConversation?.id == convId) {
                    dispatch(
                        addMessage({
                            id: Date.now(),
                            content: message.message,
                            timestamp,
                            sender: { id: message.sender_id },
                        }),
                    );
                }

                // Cập nhật last_message cho tất cả cuộc hội thoại (bao gồm cả nhóm)
                const updateChats = (chats, id, isGroup) =>
                    chats.map((chat) => {
                        // Chuẩn hóa kiểu dữ liệu khi so sánh
                        const chatId = parseInt(chat.id);
                        const targetId = parseInt(id);
                        console.log('Comparing chat.id with id:', { chatId, targetId });

                        // Chỉ cập nhật nếu type_conversation khớp
                        const typeMatch = isGroup
                            ? chat.type_conversation === 'group'
                            : chat.type_conversation === 'private';
                        if (chatId === targetId && typeMatch) {
                            return {
                                ...chat,
                                last_message: {
                                    id: Date.now(),
                                    content: message.message,
                                    timestamp,
                                    sender: { id: message.sender_id },
                                },
                            };
                        }
                        return chat;
                    });

                // Cập nhật conversations (chứa cả private và group)
                const updatedConversations = updateChats(conversations, convId, isGroupChat);
                dispatch(setConversations(updatedConversations));
                console.log('Updated conversations:', updatedConversations);
            } catch (error) {
                console.error('Error handling new message:', error);
            }
        };

        if (wsService.ws) {
            wsService.ws.onmessage = handleNewMessage;
        }
        return () => {
            if (wsService.ws) {
                wsService.ws.onmessage = null;
            }
        };
    }, [selectedConversation, dispatch, conversations]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        console.log('handleSendMessage called', {
            conversationId: selectedConversation.id,
            conversationType: selectedConversation.type,
            typeConversation: selectedConversation.type_conversation,
            userId: id_user,
        });

        if (selectedConversation.id === 'meta_ai') {
            if (loading) return;
            const userMessage = { role: 'user', content: newMessage };
            setMessagesAI((prev) => [...prev, userMessage]);
            setNewMessage('');
            setLoading(true);

            try {
                const { data } = await getChatAI(newMessage);
                setMessagesAI((prev) => [...prev, { role: 'bot', content: data.bot_response || 'Lỗi phản hồi!' }]);
            } catch (error) {
                setMessagesAI((prev) => [...prev, { role: 'bot', content: 'Lỗi khi gửi tin nhắn!' }]);
            } finally {
                setLoading(false);
            }
        } else {
            const newMessageObj = {
                id: Date.now(),
                content: newMessage,
                timestamp: new Date().toISOString(),
                sender: { id: parseInt(id_user) },
            };

            const isGroupChat = selectedConversation.type_conversation === 'group';

            if (isGroupChat) {
                const messageData = {
                    message: newMessage,
                    group_id: selectedConversation.id,
                    sender_id: parseInt(id_user),
                    timestamp: newMessageObj.timestamp,
                };
                console.log('Sending group message:', messageData);
                wsService.sendMessage(messageData);
            } else {
                const receiver = selectedConversation.participants.find((p) => parseInt(p.id) !== parseInt(id_user));
                const messageData = {
                    message: newMessage,
                    conversation_id: selectedConversation.id,
                    receiver_id: receiver?.id,
                    sender_id: parseInt(id_user),
                    timestamp: newMessageObj.timestamp,
                };
                console.log('Sending private message:', messageData);
                wsService.sendMessage(messageData);
            }

            setNewMessage('');
        }
    };

    const uniqueMessages = useMemo(() => {
        const normalized = messages.map((msg) => ({
            id: msg.id || Date.now() + Math.random(),
            content: msg.content || msg.message,
            timestamp: msg.timestamp || new Date().toISOString(),
            sender: msg.sender || { id: msg.sender_id },
        }));
        return Array.from(new Map(normalized.map((msg) => [`${msg.content}-${msg.timestamp}`, msg])).values());
    }, [messages]);

const filteredConversations = useMemo(() => {
    console.log('searchQuery:', searchQuery); // Log giá trị searchQuery

    const combined = conversations
        .map((conv) => ({
            ...conv,
            type: conv.type_conversation === 'group' ? 'group_chat' : 'conversation',
        }))
        .filter((conv) => {
            // Nếu searchQuery rỗng, giữ lại tất cả cuộc hội thoại
            if (!searchQuery.trim()) return true;

            // Lọc theo tên nhóm cho GroupChat
            if (conv.type_conversation === 'group') {
                return conv.name?.toLowerCase().includes(searchQuery.toLowerCase());
            }

            // Lọc theo tên người tham gia cho PrivateChat
            return conv.participants.some(
                (p) => p.id !== parseInt(id_user) && p.name?.toLowerCase().includes(searchQuery.toLowerCase()),
            );
        });

    console.log('Filtered conversations:', combined);

    return combined.sort((a, b) => {
        const aTime = a.last_message?.timestamp ? new Date(a.last_message.timestamp).getTime() : 0;
        const bTime = b.last_message?.timestamp ? new Date(b.last_message.timestamp).getTime() : 0;
        return bTime - aTime; // Sắp xếp giảm dần (mới nhất lên đầu)
    });
}, [conversations, searchQuery, id_user]);

    const formatTimestamp = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / 60000);

        if (diffInMinutes < 60) {
            return diffInMinutes === 0 ? 'Vừa xong' : `${diffInMinutes} phút trước`;
        }
        if (diffInMinutes < 1440) {
            return `${Math.floor(diffInMinutes / 60)} giờ trước`;
        }
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (!isLoggedIn) return null;

    const fetchAllUsers = async () => {
        try {
            const { data } = await getAllUser();
            setAllUsers(data.filter((user) => user.id !== parseInt(id_user)));
        } catch (error) {
            console.error('Error fetching users:', error);
            setAllUsers([]);
        }
    };

    const handleGroupModalToggle = () => {
        setShowGroupModal((prev) => !prev);
        if (!showGroupModal) {
            fetchAllUsers();
        } else {
            setSelectedParticipants([]);
        }
    };

    const handleParticipantToggle = (userId) => {
        setSelectedParticipants((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
        );
    };

    const handleCreateGroup = async () => {
        if (selectedParticipants.length === 0) {
            alert('Vui lòng chọn ít nhất một người tham gia.');
            return;
        }
        try {
            console.log(selectedParticipants);
            const { data } = await createGroupChat({ participant_ids: selectedParticipants });
            dispatch(setConversations([...conversations, { ...data, type: 'group_chat' }]));
            setShowGroupModal(false);
            setSelectedParticipants([]);
            handleConversationSelect({ ...data, type: 'group_chat' });
        } catch (error) {
            console.error('Error creating group chat:', error);
            alert('Không thể tạo nhóm chat. Vui lòng thử lại.');
        }
    };

    const handleLeaveGroup = async () => {
        if (!selectedConversation || selectedConversation.type_conversation !== 'group') return;

        try {
            console.log(selectedConversation.id);
            await leaveGroupChat(selectedConversation.id);
            setShowLeaveMenu(false);
            setSelectedConversation(null);
            dispatch(setCurrentConversation(null));
            await fetchConversations();
        } catch (error) {
            console.error('Error leaving group chat:', error);
            alert('Không thể rời nhóm. Vui lòng thử lại.');
        }
    };

    return (
        <div className="bg-[#121212] w-[79%] h-[97.4%] rounded-xl my-2 mr-2 py-4 flex">
            <div className="w-1/3 border-r border-[#404040] flex flex-col">
                <div className="p-4 border-b border-[#404040]">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <FontAwesomeIcon
                                icon={faSearch}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#b3b3b3]"
                            />
                            <input
                                type="text"
                                placeholder="Tìm kiếm người dùng hoặc nhóm..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full bg-[#282828] text-white rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1ed760]"
                            />
                        </div>
                        <button
                            onClick={handleGroupModalToggle}
                            className=" text-white w-10 h-10 rounded-full flex items-center justify-center hover:scale-105"
                            title="Tạo nhóm chat"
                        >
                            <AiOutlineUsergroupAdd size={25} />
                        </button>
                    </div>
                    {showSearchResults && searchResults.length > 0 && (
                        <div className="absolute z-10 w-96 mt-2 bg-[#282828] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {searchResults.map((user) => (
                                <div
                                    key={user.id}
                                    onClick={() => handleUserSelect(user)}
                                    className="flex items-center p-3 hover:bg-[#404040] cursor-pointer"
                                >
                                    <div className="w-10 h-10 rounded-full bg-[#404040] flex items-center justify-center mr-3">
                                        <FontAwesomeIcon icon={faUser} className="text-[#b3b3b3]" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium">{user.name}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {showGroupModal && (
                        <div className="absolute z-20 w-96 mt-2 bg-[#282828] rounded-lg shadow-lg max-h-80 overflow-y-auto p-4">
                            <h3 className="text-white font-semibold mb-2">Chọn người tham gia nhóm</h3>
                            {allUsers.length > 0 ? (
                                allUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center p-2 hover:bg-[#404040] cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedParticipants.includes(user.id)}
                                            onChange={() => handleParticipantToggle(user.id)}
                                            className="mr-2"
                                        />
                                        <div className="w-8 h-8 rounded-full bg-[#404040] flex items-center justify-center mr-2">
                                            <FontAwesomeIcon icon={faUser} className="text-[#b3b3b3]" />
                                        </div>
                                        <span className="text-white">{user.name}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[#b3b3b3]">Không tìm thấy người dùng</p>
                            )}
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={handleGroupModalToggle}
                                    className="bg-[#404040] text-white px-4 py-2 rounded hover:bg-[#505050]"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleCreateGroup}
                                    className="bg-[#1ed760] text-black px-4 py-2 rounded hover:bg-[#1db954]"
                                    disabled={selectedParticipants.length === 0}
                                >
                                    Tạo nhóm
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div
                    className="flex items-center p-4 cursor-pointer hover:bg-[#282828] py-2"
                    onClick={() => handleConversationSelect(metaAIConversation)}
                >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4">
                        <img src={meta} className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div className="flex-1 items-center">
                        <div className="flex justify-between items-center">
                            <h3 className="text-white text-base font-semibold">Meta AI</h3>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.map((conversation) => {
                        const displayName =
                            conversation.type_conversation === 'group'
                                ? conversation.name
                                : conversation.participants.find((p) => p.id !== parseInt(id_user))?.name ||
                                  'Không xác định';
                        const lastMessage = conversation.last_message || conversation.messages?.slice(-1)[0];

                        return (
                            <div
                                key={`${conversation.type}-${conversation.id}`}
                                onClick={() => handleConversationSelect(conversation)}
                                className={`flex items-center p-4 cursor-pointer hover:bg-[#282828] ${
                                    selectedConversation?.id === conversation.id &&
                                    selectedConversation?.type === conversation.type
                                        ? 'bg-[#282828]'
                                        : ''
                                }`}
                            >
                                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4">
                                    <img
                                        src={assets.avt}
                                        alt={`Avatar-${conversation.id}`}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                </div>
                                <div className="flex-1 items-center">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-white text-base font-semibold">{displayName}</h3>
                                        <span className="text-[#b3b3b3] text-sm">
                                            {lastMessage ? formatTimestamp(lastMessage.timestamp) : ''}
                                        </span>
                                    </div>
                                    <p
                                        className={`text-sm truncate ${
                                            conversation.unread_count > 0 ? 'text-white font-bold' : 'text-[#b3b3b3]'
                                        }`}
                                    >
                                        {lastMessage ? lastMessage.content : 'Chưa có tin nhắn'}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* chỗ nhắn tin  */}
            <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                    <>
                        <div className="p-3.5 border-b border-[#404040] flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-4">
                                    <img
                                        src={selectedConversation.id === 'meta_ai' ? meta : assets.avt}
                                        alt={`Avatar-${selectedConversation.id}`}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold">
                                        {selectedConversation.id === 'meta_ai'
                                            ? 'Meta AI'
                                            : selectedConversation.type_conversation === 'group'
                                            ? selectedConversation.name
                                            : selectedConversation.participants.find((p) => p.id !== parseInt(id_user))
                                                  ?.name || 'Không xác định'}
                                    </h3>
                                    <p className="text-[#b3b3b3] text-sm">
                                        {selectedConversation.id === 'meta_ai' ? 'AI Assistant' : 'online'}
                                    </p>
                                </div>
                            </div>
                            {selectedConversation.type_conversation === 'group' && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowLeaveMenu((prev) => !prev)}
                                        className="text-[#b3b3b3] hover:text-white"
                                    >
                                        <IoMdMore size={24} />
                                    </button>
                                    {showLeaveMenu && (
                                        <div className="absolute right-0 mt-2 w-40 bg-[#282828] rounded-lg shadow-lg z-10">
                                            <button
                                                onClick={handleLeaveGroup}
                                                className="w-full text-left px-4 py-2 text-white hover:bg-[#404040] rounded-lg"
                                            >
                                                Rời nhóm
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-1">
                            {selectedConversation.id === 'meta_ai'
                                ? messagesAI.map((message, index) => (
                                      <div
                                          key={`message-${message.role}-${index}`}
                                          className={`flex ${
                                              message.role === 'user' ? 'justify-end' : 'justify-start'
                                          }`}
                                      >
                                          <div
                                              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                                  message.role === 'user'
                                                      ? 'bg-[#1ed760] text-black'
                                                      : 'bg-[#404040] text-white'
                                              }`}
                                          >
                                              <p className="text-sm">{message.content}</p>
                                          </div>
                                      </div>
                                  ))
                                : uniqueMessages.map((message) => (
                                      <div
                                          key={message.id}
                                          className={`flex ${
                                              message.sender?.id === parseInt(id_user) ? 'justify-end' : 'justify-start'
                                          }`}
                                      >
                                          {message.sender?.id !== parseInt(id_user) && (
                                              <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2 mt-2">
                                                  <img
                                                      src={assets.avt}
                                                      alt={`Avatar-${message.sender?.id}`}
                                                      className="w-full h-full object-cover rounded-full"
                                                  />
                                              </div>
                                          )}
                                          <div
                                              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                                  message.sender?.id === parseInt(id_user)
                                                      ? 'bg-[#1ed760] text-black'
                                                      : 'bg-[#404040] text-white'
                                              }`}
                                          >
                                              <p className="text-sm">{message.content}</p>
                                              <span
                                                  className={` text-xs mt-1 ${
                                                      message.sender?.id === parseInt(id_user)
                                                          ? 'text-right text-black'
                                                          : 'text-left text-[#b3b3b3]'
                                                  }`}
                                              >
                                                  {formatHours(message.timestamp)}
                                              </span>
                                          </div>
                                      </div>
                                  ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-[#404040]">
                            <div className="flex gap-2 items-center">
                                {/* Nút mở Emoji Picker */}
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="text-white text-xl hover:scale-110 transition"
                                    aria-label="Chọn emoji"
                                >
                                    <CiFaceSmile />
                                </button>

                                {/* Emoji Picker */}
                                {showEmojiPicker && (
                                    <div className="absolute bottom-16 left-2 z-50">
                                        <Picker
                                            data={data}
                                            onEmojiSelect={handleEmojiSelect}
                                            theme="dark"
                                            previewPosition="none"
                                            skinTonePosition="none"
                                        />
                                    </div>
                                )}
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Nhập tin nhắn..."
                                    className="flex-1 bg-[#404040] text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1ed760]"
                                />
                                <button
                                    type="submit"
                                    className="bg-[#1ed760] text-black w-10 h-10 rounded-full flex items-center justify-center hover:scale-105"
                                >
                                    <FontAwesomeIcon icon={faPaperPlane} />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-[#282828] flex items-center justify-center mx-auto mb-4">
                                <FontAwesomeIcon icon={faUser} className="text-[#b3b3b3] text-3xl" />
                            </div>
                            <h3 className="text-white text-xl font-semibold mb-2">
                                Chọn người dùng hoặc nhóm để bắt đầu chat
                            </h3>
                            <p className="text-[#b3b3b3]">Tìm kiếm từ danh sách bên trái</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Chat;
