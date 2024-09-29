import { useCallback, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useStores } from '../../hooks/useStores';

export const useSocketHandlers = (instanceId: string, slotId: string) => {
  const socket = useSocket();
  const { socketStore, gameStore } = useStores();

  const handleConnected = useCallback(() => {
    console.log('socket::connected');
    socketStore.updateConnectionState({
      clientId: socket.id,
      connected: true,
      connecting: false,
      failed: false,
      failReason: '',
    });
  }, [socketStore]);

  const handleDisconnected = useCallback((data: any) => {
    console.log('socket::disconnected', data);
    socketStore.resetConnectionState();
    window.location.href = '/';
  }, [socketStore]);

  const handleJoinAccepted = useCallback((data: any) => {
    console.log('socket::USER_JOIN_ACCEPTED', data);
    socketStore.updateConnectionState({
      clientId: socket.id,
      joining: false,
      joined: true,
      rejected: false,
      rejectReason: '',
    });
    socketStore.updateRoomState({
      currentSlot: data.userSlot,
    });
  }, [socketStore]);

  const handleJoinRejected = useCallback((data: any) => {
    console.log('socket::USER_JOIN_REJECTED', data);
    socketStore.updateConnectionState({
      joining: false,
      rejected: true,
      rejectReason: data.reason,
    });
  }, [socketStore]);

  const handleUserJoined = useCallback((data: any) => {
    console.log('socket::USER_JOINED', data);
    socketStore.updateRoomState({
      currentSlot: data.client_index,
      numMaxUsers: data.maxSlots,
      users: data.users,
    });
  }, [socketStore]);

  const handleUserLeft = useCallback((data: any) => {
    console.log('socket::USER_LEFT', data);
    socketStore.updateRoomState({
      currentSlot: data.client_index,
      numMaxUsers: data.maxSlots,
      users: data.users,
    });
  }, [socketStore]);

  const handleUserUpdate = useCallback((data: any) => {
    console.log('socket::USER_UPDATE', data);
    socketStore.updateRoomState({
      users: socketStore.roomState.users?.map((user: Player) => {
        if (user.id !== data.id) {
          return user;
        }
        return { ...user, name: data.name };
      }),
    });
  }, [socketStore]);

  const handleHostMessage = useCallback((data: any) => {
    console.log('socket::HOST_MESSAGE', data);
    gameStore.handleUpdate(data);
  }, [gameStore]);

  useEffect(() => {
    socket.on('connect', handleConnected);
    socket.on('disconnect', handleDisconnected);
    socket.on('USER_JOIN_ACCEPTED', handleJoinAccepted);
    socket.on('USER_JOIN_REJECTED', handleJoinRejected);
    socket.on('USER_JOINED', handleUserJoined);
    socket.on('USER_UPDATE', handleUserUpdate);
    socket.on('USER_LEFT', handleUserLeft);
    socket.on('OSC_HOST_MESSAGE', handleHostMessage);

    return () => {
      socket.off('connect', handleConnected);
      socket.off('disconnect', handleDisconnected);
      socket.off('USER_JOIN_ACCEPTED', handleJoinAccepted);
      socket.off('USER_JOIN_REJECTED', handleJoinRejected);
      socket.off('USER_JOINED', handleUserJoined);
      socket.off('USER_UPDATE', handleUserUpdate);
      socket.off('USER_LEFT', handleUserLeft);
      socket.off('OSC_HOST_MESSAGE', handleHostMessage);
    };
  }, [
    socket,
    handleConnected,
    handleDisconnected,
    handleJoinAccepted,
    handleJoinRejected,
    handleUserJoined,
    handleUserUpdate,
    handleUserLeft,
    handleHostMessage,
  ]);
};