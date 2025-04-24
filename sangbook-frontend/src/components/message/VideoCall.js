import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const VideoCall = ({ 
  isOpen, 
  onClose, 
  selectedUser, 
  currentUser,
  API_BASE_URL 
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [peerConnection, setPeerConnection] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('checking');
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [caller, setCaller] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Kết nối WebSocket
    socketRef.current = io('http://localhost:4000');
    
    // Đăng ký user với socket
    socketRef.current.emit('registerUser', currentUser.id);

    // Lắng nghe cuộc gọi đến
    socketRef.current.on('incomingCall', (data) => {
      if (!isOpen) {
        setCaller(data.from);
        setIsIncomingCall(true);
      }
    });

    // Lắng nghe ICE candidate từ người gọi
    socketRef.current.on('iceCandidate', (candidate) => {
      if (peerConnection) {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    // Lắng nghe offer từ người gọi
    socketRef.current.on('callOffer', async (offer) => {
      if (!isOpen) {
        setCaller(offer.from);
        setIsIncomingCall(true);
        // Lưu offer để sử dụng khi chấp nhận cuộc gọi
        localStorage.setItem('pendingOffer', JSON.stringify(offer));
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      checkPermissions();
    } else {
      endCall();
    }
  }, [isOpen]);

  const checkPermissions = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Trình duyệt của bạn không hỗ trợ video call');
      }

      const cameraPermission = await navigator.permissions.query({ name: 'camera' });
      const microphonePermission = await navigator.permissions.query({ name: 'microphone' });

      if (cameraPermission.state === 'denied' || microphonePermission.state === 'denied') {
        setPermissionStatus('denied');
        setError('Vui lòng cho phép sử dụng camera và microphone trong cài đặt trình duyệt');
        return;
      }

      setPermissionStatus('granted');
      startCall();
    } catch (error) {
      console.error('Error checking permissions:', error);
      setError(error.message);
      setPermissionStatus('error');
    }
  };

  const startCall = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }, 
        audio: true 
      });

      setLocalStream(stream);
      localVideoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' }
        ]
      });

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      pc.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
        setIsConnected(true);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit('iceCandidate', {
            to: selectedUser.id,
            candidate: event.candidate
          });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Gửi offer qua WebSocket
      socketRef.current.emit('callOffer', {
        from: currentUser.id,
        to: selectedUser.id,
        offer: offer
      });

      setPeerConnection(pc);
      setIsCalling(true);
    } catch (error) {
      console.error('Error starting call:', error);
      if (error.name === 'NotAllowedError') {
        setError('Vui lòng cho phép sử dụng camera và microphone');
      } else if (error.name === 'NotFoundError') {
        setError('Không tìm thấy camera hoặc microphone');
      } else if (error.name === 'NotReadableError') {
        setError('Camera hoặc microphone đang được sử dụng bởi ứng dụng khác');
      } else {
        setError('Không thể bắt đầu cuộc gọi. Vui lòng thử lại sau');
      }
    }
  };

  const acceptCall = async () => {
    try {
      const pendingOffer = JSON.parse(localStorage.getItem('pendingOffer'));
      if (!pendingOffer) {
        throw new Error('Không tìm thấy thông tin cuộc gọi');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });

      setLocalStream(stream);
      localVideoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      pc.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
        setIsConnected(true);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit('iceCandidate', {
            to: pendingOffer.from,
            candidate: event.candidate
          });
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(pendingOffer.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketRef.current.emit('callAnswer', {
        to: pendingOffer.from,
        answer: answer
      });

      setPeerConnection(pc);
      setIsCalling(true);
      setIsIncomingCall(false);
      localStorage.removeItem('pendingOffer');
    } catch (error) {
      console.error('Error accepting call:', error);
      setError('Không thể chấp nhận cuộc gọi. Vui lòng thử lại sau');
    }
  };

  const rejectCall = () => {
    socketRef.current.emit('rejectCall', {
      to: caller
    });
    setIsIncomingCall(false);
    setCaller(null);
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
      peerConnection.close();
    }
    setIsCalling(false);
    setIsConnected(false);
    setPeerConnection(null);
    setLocalStream(null);
    setError(null);
    setPermissionStatus('checking');
    setIsIncomingCall(false);
    setCaller(null);
  };

  if (!isOpen && !isIncomingCall) return null;

  return (
    <div className="video-call-modal">
      <div className="video-call-container">
        <div className="video-call-header">
          <h3>
            {isIncomingCall 
              ? `Cuộc gọi đến từ ${caller?.username || 'Người dùng'}`
              : `Video Call với ${selectedUser.username}`
            }
          </h3>
          <button onClick={onClose} className="close-button">X</button>
        </div>
        
        <div className="video-call-content">
          {error ? (
            <div className="video-call-error">
              <i className="fa-solid fa-video-slash"></i>
              <p>{error}</p>
              {permissionStatus === 'denied' && (
                <button 
                  className="permission-button"
                  onClick={() => {
                    window.open('chrome://settings/content/camera', '_blank');
                  }}
                >
                  Mở cài đặt quyền truy cập
                </button>
              )}
            </div>
          ) : isIncomingCall ? (
            <div className="incoming-call">
              <div className="call-actions">
                <button className="accept-call-button" onClick={acceptCall}>
                  <i className="fa-solid fa-phone"></i>
                </button>
                <button className="reject-call-button" onClick={rejectCall}>
                  <i className="fa-solid fa-phone-slash"></i>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="video-container">
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  muted 
                  playsInline
                  className="local-video"
                />
                <video 
                  ref={remoteVideoRef} 
                  autoPlay 
                  playsInline
                  className="remote-video"
                />
              </div>
              
              <div className="call-controls">
                <button 
                  onClick={endCall} 
                  className="end-call-button"
                >
                  <i className="fa-solid fa-phone-slash"></i>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCall;