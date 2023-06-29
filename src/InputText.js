import * as React from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export default function InputText() {
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
      } = useSpeechRecognition();

      const speectListning = () => SpeechRecognition.startListening({continuous:true,language:'en-IN'})

      console.log(transcript);

      if (!browserSupportsSpeechRecognition) {
        return <span>Browser doesn't support speech recognition.</span>;
      }
    
  return (
    <Paper
      component="form"
      sx={{ p: '4px 4px', display: 'flex', alignItems: 'center', width: 400 }}
    >
      <IconButton sx={{ p: '10px' }} aria-label="menu">
      </IconButton>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search Google Maps"
        value={transcript}
        inputProps={{ 'aria-label': 'search google maps' }}
      />
      <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={speectListning}>
        <MicIcon sx={{color: listening ? 'blue' : 'gray'}}/>
      </IconButton>
      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
      <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={SpeechRecognition.stopListening}>
        <StopIcon sx={{color: listening ? 'red' : 'gray'}}/>
      </IconButton>
    </Paper>
  );
}