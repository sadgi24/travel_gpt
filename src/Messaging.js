import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import AudioMessage from './AudioComponent';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';

const audioRecorderPlayer = new AudioRecorderPlayer();

const Messaging = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [recording, setRecording] = useState(false);
  const [recordedFile, setRecordedFile] = useState('');
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const oldChats = [
    //   { text: 'Hi there!', sender: 'receiver', type: 'text' },
    //   { text: 'Hello! How can I help you?', sender: 'sender', type: 'text' },
    ];
    setChat(oldChats);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const sendMessage = () => {
    if (message.trim()) {
      setChat((prevChat) => [...prevChat, { text: message, sender: 'sender', type: 'text' }]);
      setMessage('');
    }
    if (recordedFile) {
      setChat((prevChat) => [...prevChat, { text: recordedFile, sender: 'sender', type: 'audio' }]);
      setRecordedFile('');
    }
  };

  const startRecording = async () => {
    try {
      await audioRecorderPlayer.startRecorder();
      setRecording(true);
      setTimer(0);
      timerRef.current = setInterval(() => setTimer((prev) => prev + 1), 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      setRecording(false);
      setRecordedFile(result);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } catch (err) {
      console.error('Error stopping recording:', err);
    }
  };
  const generateUniqueId = () => {
    return Math.random().toString(36).substr(2, 9) + 
           Math.random().toString(36).substr(2, 9);
  };
  const renderAudioMessage = (message, type) => (
    <View
      key={generateUniqueId}
      style={{ flexDirection: message.sender === 'sender' ? 'row-reverse' : 'row', marginBottom: 8 }}
    >
      <AudioMessage type={type} filePath={message.text} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Icon name="menu" size={24} color="#000" />
        <Text style={styles.title}>Travel GPT</Text>
        <View style={{ width: 24 }} />
      </View>

     {chat.length==0&& <View style={styles.chatContainer}>
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>Hi there! 👋 My name is Tratoli. How can I assist you today?</Text>
          <View style={styles.buttonsRow}>
            {['Holiday', 'Flight', 'Transfer', 'Activity', 'Hotel'].map((label, index) => (
              <TouchableOpacity key={index} style={styles.button}>
                <Text style={styles.buttonText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>}

      <ScrollView style={{ padding: 10 }}>
        {chat.map((message, index) =>
          message.type === 'audio' ? (
            renderAudioMessage(message, index,'recorded')
          ) : (
            <View
              key={index}
              style={{
                flexDirection: message.sender === 'sender' ? 'row-reverse' : 'row',
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  backgroundColor: message.sender === 'sender' ? 'green' : 'blue',
                  padding: 10,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: 'white' }}>{message.text}</Text>
              </View>
            </View>
          )
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        {recordedFile ? (
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <Octicons
              name="trash"
              size={24}
              color="black"
              style={{ marginLeft: 5 }}
              onPress={() => setRecordedFile('')}
            />
            {renderAudioMessage({ text: recordedFile },'recording')}
          </View>
        ) : (
          <TextInput
            style={styles.input}
            onSubmitEditing={sendMessage}
            onChangeText={(text) => setMessage(text)}
            value={message}
            placeholder="Ask Anything..."
          />
        )}

       

        <View style={styles.controls}>
        {recording && !recordedFile && (
          <Text style={styles.timer}>{formatTime(timer)}</Text>
        )}
          {!recording && !recordedFile && (
            <TouchableOpacity   onPress={startRecording}>
              <Ionicons name="mic" size={28} color="black" />
            </TouchableOpacity>
          )}
          {recording && (
            <TouchableOpacity   onPress={stopRecording}>
              <Icon name="stop-circle" size={30} color="black" />
            </TouchableOpacity>
          )}
          <TouchableOpacity disabled={!recordedFile&& recording} style={styles.sendButton} onPress={sendMessage}>
            <AntDesign name="arrowup" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal:20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  chatContainer: {},
  messageBox: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 16,
    marginHorizontal:20,
    textAlign:'center'
  },
  buttonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f1f1f1',
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 14,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 16,
   
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 10,
    borderRadius: 10,
  },
  timer: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
    
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingTop:0
  },
  sendButton: {
    backgroundColor: 'rgba(118,175,187,1)',
    padding: 6,
    borderRadius: 10,
    marginLeft:5
  },
});

export default Messaging;
