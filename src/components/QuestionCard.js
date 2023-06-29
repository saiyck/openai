import React from 'react'
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import MicIcon from '@mui/icons-material/Mic';
import Lottie from 'react-lottie';
import * as animationData from '../loitte/type.json'

export default function QuestionCard(props) {
  const {title,onMicPress,onSubmit,isRecording,text,onChangeValue,isLoading} = props;

  const defaultOptions = {
    loop: true,
    autoplay: true, 
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };
  
  return (
   <Card sx={{textAlign:'center',maxWidth:'60vh'}}>
     <CardContent>
      {isLoading ? 
      <Lottie options={defaultOptions}
      height={60}
      width={120}
      isStopped={false}
      isPaused={false}/> : 
      <Typography sx={{ fontSize: 18, fontWeight:'bold',color:'#000' }} color="text.secondary" gutterBottom>
      {title}
     </Typography>
    }
        <Box sx={{borderWidth:1,borderColor:'gray'}}>
        <InputBase
          sx={{ ml: 1,width:'30vh',borderWidth:  1,  borderStyle:  'dashed',padding:2 }}
          placeholder="User Answer"
          multiline
          maxRows={4}
          value={text}
          inputProps={{ 'aria-label': 'search google maps' }}
          onChange={(v) => onChangeValue(v)}
        />
        </Box>
        <IconButton onClick={()=> onMicPress()} type="button" sx={{ p: '10px' }} aria-label="search">
          <MicIcon sx={{color: isRecording ? 'gray' : 'blue',width:40,height:40}}/>
        </IconButton>
     </CardContent>
     <Button disabled={!isRecording} onClick={()=> onSubmit()} sx={{width:'50vh',marginBottom:'10px'}}  variant="contained">Submit</Button>
   </Card>
  )
}
