import React, { useRef,useState,useEffect, useMemo } from "react";
import ReactDOM from "react-dom/client";
import MicRecorder from 'mic-recorder-to-mp3';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { useParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import { checkTheStatus, handleUpload, handleUploadAnswers, retrivePromptMessage, updateEmailId } from "./Common";
import { Alert, Box, Typography } from "@mui/material";
import QuestionCard from "./components/QuestionCard";


const Mp3Recorder = new MicRecorder({ bitRate: 128 });

  // const queryParameters = new URLSearchParams(window.location.search)
 


const VoiceCreate = (props) => {
    const [state, setState] = useState(
        {
            isRecording: false,
            blobURL: '',
            isBlocked: false,
            value : '',
        }
    );
    const [promptInfo,setPromptInfo] = useState('');
    const [loading,setLoading] = useState(false);
    const [emailPopup,setEmailPopup] = useState(false);
    const [data,setData] = useState([]);
    const [open, setOpen] = React.useState(false);
    const [openM, setOpenM] = React.useState(false);
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [streame,setStreame]=useState(null);
    const [screenshot, setScreenshot] = useState([]);
    const [interival,setInterival] = useState(0);
    const [email,setEmail] = useState('');
    const [question,setQuestion] = useState("Hello Whats your name?");
    var temp = [];
    var messages = [];
    const params = useParams();
    const id = params.id;


    const style = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 400,
      bgcolor: 'background.paper',
      border: '2px solid #000',
      boxShadow: 24,
      p: 4,
    };
    

  

   useEffect(()=>{
     checkPermissions()
   },[]);


   useEffect(()=> {
     handleOpen()
      retrivePromptMessage(id).then((res)=>{
        if(!res.userId){
          setOpenM(true);
        }
        setPromptInfo(res.promptMessage);
       handleClose()
      }).catch((err)=>{
        console.log('error:',err);
        handleClose()
      })
   },[])


   const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
  };



   const checkPermissions = () => {
    navigator.getUserMedia({ audio: true },
      () => {
        console.log('Permission Granted');
        setState({ ...state ,isBlocked: false });
      },
      () => {
        console.log('Permission Denied');
        this.setState({ ...state,isBlocked: true })
      },
    );
    //handleStartCamera()
   }

   const handleSubmitEmailId = () => {
       handleOpen()
       updateEmailId(id,email).then((res)=>{
         if(res.userId){
           setOpenM(false);
         }
         handleClose()
       }).catch((err)=>{
        console.log('errorUpdateEmail:',err)
        handleClose()
       })
   }


   const handleStartCamera = async () => {
    try {
      const constraints = { video: { facingMode: 'user' } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.start()
      setStreame(stream)
      captureScreeShotEvery5Seconds()
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };


  const captureScreeShotEvery5Seconds = () => {
   let intervel = setInterval(()=>{
    handleCaptureScreenshot();
    setInterival(intervel)
    },5000)
  }


  const stopSubmit = async () => {
    streame.getVideoTracks()[0].stop();
    console.log('media',interival);
    clearInterval(interival);
  }


  const handleCaptureScreenshot = () => {
    let extension="jpg"
    let name="screenshot"
    const videoElement = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    canvas.getContext('2d').drawImage(videoElement, 0, 0);
    const screenshotDataUrl = canvas.toDataURL('image/png');
    temp.push(screenshotDataUrl);
    setScreenshot([...temp]);
  };


  const start = () => {
    if(promptInfo == ''){
      window.alert("please add promptInfo")
      return
    }
    // handleStartCamera()
    if (state.isBlocked) {
      console.log('Permission Denied');
    } else {
      Mp3Recorder
        .start()
        .then(() => {
         setState({ ...state ,isRecording: true });
        }).catch((e) => console.error(e));
    }
  };

  React.useEffect(()=>{
    if(state.value != ''){
      handleUploadAnswers(data,promptInfo,id).then((res)=>{
        let ms  = {role: "assistant", content: res?.data.choices[0]?.message?.content}
        let temp = [...data];
       temp.push(ms);
       setData(temp);
       setQuestion(res?.data.choices[0]?.message?.content);
       checkTheStatus(ms.content).then((res)=>{
          console.log('resss',res);
       }).catch((err)=> {
        console.log('errr',err);
       })
       setTimeout(()=>{
        setLoading(false)
      },1000);
    }).catch((err)=> {
      console.log('errroorr',err);
    })
    }
  },[state.value])

 const stop = () => {
    Mp3Recorder
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const blobURL = URL.createObjectURL(blob)
        const wavefile = new File([blob],'inhand.wav');
        setLoading(true)
        handleUpload(wavefile).then((res)=>{
          let m  = {role: "user", content: res.data.text}
          let temp = [...data];
          temp.push(m);
          setData(temp);
          setState({...state,value:res.data.text,isRecording: false, blobURL});
      }).catch((e) => console.log(e));
      // stopSubmit()
    })    
  };


    return (
      <>
       <Box sx={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',paddingTop:10}}>
        <Paper
        sx={{ p: '10px 10px',marginBottom:5,maxWidth:'60vh'}}
      >
        <InputBase
          sx={{ ml: 1,width:'60vh'}}
          placeholder="Add prompt Message here"
          multiline
          maxRows={4}
          value={promptInfo}
          inputProps={{ 'aria-label': 'search google maps' }}
          onChange={(v) => setPromptInfo(v.target.value)}
        />
      </Paper>
      {/* {state.blobURL ?  <audio style={{marginTop:20}} src={state.blobURL} controls></audio> : null} */}
      {/* <video style={{display:'none'}} ref={videoRef} autoPlay /> */}
      {/* {screenshot.length > 0 && !state.isRecording ? 
      <div style={{display:'flex',marginTop:20}}> */}
      {/* {
        screenshot.map((item)=> {
          return(
            <img src={item} style={{width:100,height:100,marginLeft:20}} alt="Screenshot" />
          )
        })
      } */}
    {/* </div> : null
    } */}
     <QuestionCard isLoading={loading} onChangeValue={(v)=> setState({...state, value : v.target.value})} text={state.value} onSubmit={()=> stop()} onMicPress={()=> start()} title={question} isRecording={state.isRecording}/>
      
      <Box sx={{textAlign:'center',marginTop:'20px'}}>
        <Typography color={'gray'}>
          Timer: 00:00
        </Typography>
      </Box>
      </Box>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
        onClick={handleClose}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Modal
        open={openM}
        onClose={()=>{}}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Please enter your email id
          </Typography>
          <TextField onChange={(e)=> setEmail(e.target.value)} sx={{width:'100%',mt:3}} id="outlined-basic" label="Email" variant="outlined" />
          <Button onClick={handleSubmitEmailId} sx={{mt:2}} variant="contained">
            {open ? <CircularProgress color="inherit" /> : 'Submit'}
            </Button>
        </Box>
      </Modal>
      </>
    )
}

export default React.memo(VoiceCreate);




