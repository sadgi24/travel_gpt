import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Sound from "react-native-sound";
import { Waveform } from '@simform_solutions/react-native-audio-waveform'; // Correct import for the waveform

const AudioMessage = ({ filePath,type }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0); // Dynamic audio duration
  const [sound, setSound] = useState(null); // Store Sound instance
  const waveformRef = useRef(null);

  useEffect(() => {
    const audio = new Sound(filePath, null, (error) => {
      if (error) {
        console.log("Failed to load the sound", error);
        return;
      }
      console.log(audio.getDuration(), 'kkk')
      // Get audio duration dynamically
      let duration = audio.getDuration();
      setAudioDuration(duration);
    });

    setSound(audio);

    return () => {
      // Release the sound instance when the component unmounts
      if (sound) {
        sound.release();
      }
    };
  }, [filePath]); // Reinitialize if filePath changes

  const playAudio = () => {
    if (isPlaying) {
      sound.pause(); // Pause the audio if it's playing
    } else {
      sound.play((success) => {
        if (success) {
          setIsPlaying(false)
          console.log("Finished playing");
        } else {
          console.log("Playback failed due to audio decoding errors");
        }
      });
    }
    setIsPlaying(!isPlaying);
  };

  // Update the playback time
  useEffect(() => {
    if (sound && isPlaying) {
      const interval = setInterval(() => {
        sound.getCurrentTime((seconds) => {
          setCurrentTime(seconds); // Update current time
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPlaying, sound]);

  // Calculate remaining time for countdown (from max duration)
  const remainingTime = audioDuration - currentTime;

  // Format the time to mm:ss
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <View style={[styles.container,{  width: type=='recording'?Dimensions.get("screen").width * 0.65:Dimensions.get("screen").width * 0.6,}]}>
      {/* Play Button */}
      <TouchableOpacity style={styles.playButton} onPress={playAudio}>
        <Icon style={{alignSelf:'center'}} name={isPlaying ? "pause" : "play"}onPress={playAudio} size={18} color="black" />
      </TouchableOpacity>

      {/* Waveform */}
      <View style={styles.waveformContainer}>
        <Waveform
          mode="static"
          ref={waveformRef} // Correct ref
          path={filePath} // Path to the audio file
          candleSpace={2}
          candleWidth={4}
          scrubColor="white"
        />
      </View>

      {/* Timer */}
      <Text style={styles.timer}>
        {formatTime(remainingTime)} 
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    // padding: 5,
    paddingHorizontal:10,
    borderRadius: 25,
    backgroundColor: 'rgba(235,248,247,1)',
    margin: 10,
    width: Dimensions.get("screen").width * 0.6,
    alignSelf: "center",
  },
  playButton: {
   marginHorizontal:5,
   justifyContent:'center',
   height:26,
   width:26,
paddingHorizontal:5,
   borderRadius:50,
   alignContent:'center',
//    borderRadius:100,
   backgroundColor:'rgba(228,190,79,1)'
  },
  waveformContainer: {
    flex: 1,
    marginRight: 10,
  },
  timer: {
    fontSize: 14,
    color: "#555",
  },
});

export default AudioMessage;
