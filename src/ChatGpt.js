import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { makeStyles } from "@material-ui/core";
import Collapse from "@material-ui/core/Collapse";
import MicRecorder from 'mic-recorder-to-mp3';
import IconButton from "@material-ui/core/IconButton";
import Drawer from "@material-ui/core/Drawer";
import { useParams } from 'react-router-dom';
import CircularProgress from "@material-ui/core/CircularProgress";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import Button from "@material-ui/core/Button";
import ArrowBackOutlinedIcon from "@material-ui/icons/ArrowBackOutlined";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import SendOutlinedIcon from "@material-ui/icons/SendOutlined";
import MicIcon from '@mui/icons-material/Mic';
import StopCircle from '@mui/icons-material/StopCircle';
import CreateOutlinedIcon from "@material-ui/icons/CreateOutlined";
import CloseOutlinedIcon from "@material-ui/icons/CloseOutlined";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import InputBase from '@mui/material/InputBase';
import { handleUpload, handleUploadAnswers } from "./Common";
import mic from '../src/assets/mic.json';
import Lottie from "react-lottie";

const useStyles = makeStyles({
  paper: {
    position: "absolute",
    right: 0,
    bottom: 0,
  },
});

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

const ChatDialog = (props) => {
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const [text, setText] = useState("");
  const [showContent, setShowContent] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const styles = useStyles();
  const [promptInfo, setPromptInfo] = useState("imagine you're a nurse at a hospital. you are responsible to screen the initial symptoms, suggest him the right specialist (gynac, pediatrics, dentist, oncologist, dermatologist, etc). ask one question at a time. based on the user response, ask a follow-up question. at the end summarise your observations");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingInProgress, setRecordingInProgress] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [errorPrompt, setErrorPrompt] = useState("");
  const [scrollBottom, setBottom] = useState(false);
  const params = useParams();
  const id = params.id;
  const [windowSize, setWindowSize] = useState(getWindowSize());
  // useEffect(()=>{
  //  retrivePromptMessage(id).then((res)=>{
  //   setPromptInfo(res.promptMessage)
  //   setMessages([])
  //  }).catch((err)=>{
  //   console.log('error',err)
  //  })
  // },[])

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
    console.log('caalinggg')
  }, [messages, scrollBottom]);


  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: mic,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

  function getWindowSize() {
    const { innerWidth, innerHeight } = window;
    return { innerWidth, innerHeight };
  }

  useEffect(() => {
    function handleWindowResize() {
      setWindowSize(getWindowSize());
    }

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  useEffect(() => {
    checkPermissions()
  }, []);

  const checkPermissions = () => {
    navigator.getUserMedia({ audio: true },
      () => {
        console.log('Permission Granted');
        setIsBlocked(false)
      },
      () => {
        console.log('Permission Denied');
        setIsBlocked(true)
      },
    );
    //handleStartCamera()
  }

  const handleTextChange = (e) => {
    setText(e.target.value)
  }

  const handlePromptChange = (e) => {
    setPromptInfo(e.target.value)
  }

  const handleSubmitEditing = () => {
    if (promptInfo.length > 30) {
      setIsEditingSettings(false)
      setErrorPrompt("")
    } else {
      setErrorPrompt("Please enter proper prompt info")
    }
  }

  const handleOpenEditing = () => {
    setIsEditingSettings(true)
  }

  const handleDeletePrompt = () => {
    setPromptInfo("");
    setIsEditingSettings(false)
  }

  const handleSend = () => {
    setLoading(true);
    let m = { role: "user", content: text }
    let temp = [...messages];
    temp.push(m);
    setMessages(temp);
    handleUploadAnswers(temp, promptInfo, id).then((res) => {
      let ms = { role: "assistant", content: res.data.choices[0].message.content }
      temp.push(ms)
      setMessages(temp);
      setText("")
      setIsRecording(false)
      setLoading(false)
    }).catch((err) => {
      console.log('Error:', err)
    })
  }


  const start = () => {
    if (promptInfo == '') {
      window.alert("please add promptInfo")
      return
    }
    // handleStartCamera()
    if (isBlocked) {
      window.alert("permission denied")
    } else {
      Mp3Recorder
        .start()
        .then(() => {
          setRecordingInProgress(true)
          setIsRecording(true)
        }).catch((e) => console.error(e));
    }
  };


  const stop = () => {
    setLoading(true)
    setRecordingInProgress(false)
    Mp3Recorder
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const wavefile = new File([blob], 'inhand.wav');
        setLoading(true)
        handleUpload(wavefile).then((res) => {
          console.log('ress>>>', res)
          let m = { role: "user", content: res.data.text }
          let temp = [...messages];
          temp.push(m);
          setMessages(temp);
          handleUploadAnswers(temp, promptInfo, id).then((res) => {
            let ms = { role: "assistant", content: res.data.choices[0].message.content }
            temp.push(ms)
            setMessages(temp);
            setBottom(!scrollBottom);
            setIsRecording(false)
            setLoading(false)
          })
        }).catch((e) => console.log(e));
      })
  };


  const renderChatInputPrompter = () => {
    return (
      <div style={{ padding: "1rem" }}>

        <div style={{ position: "relative", display: 'flex', alignItems: 'center' }}>
          {
            recordingInProgress ?
              <RecordingActionContainer style={{}}>
                <StyledIconButton
                  type="submit"
                  color="primary"
                  disabled={true}
                >
                  <Lottie options={defaultOptions} height={22} width={22} />
                </StyledIconButton>
              </RecordingActionContainer>
              : null
          }
          <ChatInput
            rowsMin={1}
            rowsMax={4}
            autoFocus
            ref={inputRef}
            isRecording={recordingInProgress}
            placeholder="e.g. Tap to speak or write message"
            value={text}
            disabled={loading || isRecording}
            onChange={handleTextChange}
          />

          <ActionContainer style={{}}>
            {
              loading ?
                <LoadingDots />
                :
                text.length > 0 ?
                  <StyledIconButton
                    type="submit"
                    color="primary"
                    onClick={handleSend}
                  >
                    <SendOutlinedIcon
                      style={{
                        color: "rgb(35, 127, 244)",
                      }}
                      fontSize="medium"
                    />
                  </StyledIconButton> :
                  isRecording ?
                    <StyledIconButton
                      type="submit"
                      color="primary"
                      onClick={stop}
                      className='pulsate'
                    >
                      <StopCircle
                        style={{ color: "rgb(255, 0, 0)" }}
                        fontSize="medium"
                      />
                    </StyledIconButton> :
                    <StyledIconButton
                      type="submit"
                      color="primary"
                      onClick={start}
                    >
                      <MicIcon
                        style={{ color: "rgb(35, 127, 244)" }}
                        fontSize="medium"
                      />
                    </StyledIconButton>
            }
          </ActionContainer>
        </div>
      </div>
    );
  };




  const _chatResponseHelper = (messageContent, { ref, loading } = {}) => {
    return (
      <ChatMessageContainer>
        <DropBoxContainer ref={ref}>
          {messageContent}
          {loading && <BlinkingContainer />}
        </DropBoxContainer>
      </ChatMessageContainer>
    );
  };




  const toggleContent = () => {
    setShowContent(!showContent);
  };



  const renderAssistantChatMessage = (messageContent, { loading }) => {
    return (
      <ChatMessageContainer>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex" }}>
              <Button
                startIcon={loading ? <CircularProgress size={12} /> : null}
                onClick={toggleContent}
              >
                {showContent ? (
                  <span>
                    Hide Content <ExpandLessIcon />
                  </span>
                ) : (
                  <span>
                    Show Content <ExpandMoreIcon />
                  </span>
                )}
              </Button>
            </div>
          </div>
          <br />
          <Collapse in={showContent}>
            <DropBoxContainer
              style={{
                height: "10rem", // Set the desired height
                overflow: "auto", // Enable scrolling when content exceeds the height
                padding: "10px",
              }}
            >
              {messageContent}
              {loading && <BlinkingContainer />}
            </DropBoxContainer>
          </Collapse>
        </div>
      </ChatMessageContainer>
    );
  };



  const renderChatMessageContainer = (message, { isAssistant, role, index }) => {
    if (isAssistant) {
      return _chatResponseHelper(message.content);
    }
    return <ChatMessageContainer>{message.content}</ChatMessageContainer>;
  };

  const renderChatBox = (children, { role, isAssistant }) => {
    return (
      <ChatBox>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            paddingBottom: "0.5rem",
          }}
        >
          <div
            style={{
              backgroundColor: isAssistant ? "#237ff4" : "grey",
              height: 28,
              width: 28,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* {isAssistant ? assistantLogo : null} */}
          </div>

          <div
            style={{
              color: isAssistant ? "#237ff4" : "grey",
              fontSize: 11,
              textTransform: "uppercase",
            }}
          >
            {isAssistant ? "Assistant" : "USER"}
          </div>
        </div>
        {children}
      </ChatBox>
    );
  };

  const renderChatMessage = (message, { role, isAssistant, index }) => {
    return (
      <ChatContainer role={role} key={index}>
        {renderChatBox(
          renderChatMessageContainer(message, { isAssistant, role, index }),
          { role, isAssistant }
        )}
      </ChatContainer>
    );
  };

  const renderChatStreamResponse = () => {
    if (true) {
      return (
        <ChatContainer role="ASSISTANT">
          {renderChatBox(
            renderAssistantChatMessage("hhhgggfff", {}),
            {
              isAssistant: true,
              role: "ASSISTANT",
            }
          )}
        </ChatContainer>
      );
    }

    return (
      <ChatContainer role="ASSISTANT">
        {renderChatBox(_chatResponseHelper("hellleelelel", {}), {
          isAssistant: true,
          role: "ASSISTANT",
        })}
      </ChatContainer>
    );
  };

  const renderChatMessages = () => {
    //ChatsContainer -> ChatContainer -> ChatBox -> ChatMessageContainer
    return (
      <ChatsContainer>
        {messages.map((message, index) => {
          const role = message.role.toUpperCase();
          const isAssistant = role === "ASSISTANT" || role === "FUNCTION";
          return renderChatMessage(message, { role, isAssistant, index });
        })}
        {/* {renderChatStreamResponse()} */}
        {console.log('hello')}
        <div ref={messagesEndRef} />
      </ChatsContainer>
    );
  };

  const renderChatTitle = () => {
    return (
      <div
        style={{
          display: "flex",
          gap: "1rem",
          padding: "1rem",
          alignItems: 'center'
        }}
      >
        <div style={{ position: "relative" }}>
          <IconButton color="inherit" onClick={() => { }} aria-label="close">
            <ArrowBackOutlinedIcon />
          </IconButton>
        </div>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: ".25rem",
            }}
          >
            <h2 style={{ fontSize: 16, margin: 0 }}>AI assistant</h2>
            {isEditingSettings ? null : (
              <div>
                <IconButton
                  style={{ padding: "0.5rem" }}
                  onClick={handleOpenEditing}
                >
                  <CreateOutlinedIcon fontSize="small" />
                </IconButton>
              </div>
            )}
          </div>
          {isEditingSettings ? (
            <div>
              <form
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: ".25rem",
                }}
                onSubmit={handleSubmitEditing}
              >
                <div>
                  <InputBase
                    sx={{
                      mt: 1,
                      border: "1px solid gray",
                      padding: '10px',
                      borderRadius: '10px',
                      width: windowSize.innerWidth > 780 ? '30vw' : '70vw'
                    }}
                    placeholder="Add prompt Message here"
                    multiline
                    maxRows={4}
                    value={promptInfo}
                    inputProps={{ 'aria-label': 'add prompt info' }}
                    onChange={handlePromptChange}
                    fullWidth
                  />
                  <p style={{ color: 'red', fontSize: 12 }}>{errorPrompt}</p>
                </div>
                <IconButton
                  style={{ padding: "0.5rem" }}
                  onClick={handleSubmitEditing}
                >
                  <CloseOutlinedIcon fontSize="small" />
                </IconButton>
              </form>
            </div>
          ) : promptInfo ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".25rem",
              }}
            >
              <div>{promptInfo.substring(0, 50) + "********"}</div>
              <div>
                <IconButton
                  style={{ padding: "0.5rem" }}
                  onClick={handleDeletePrompt}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const renderDrawerContainer = () => {
    if (messages.length < 0) {
      return (
        <div style={{ padding: "1rem" }}>
          <h3>Hi, welcome to Recruitment Chat!</h3>
          <p>
            I am an AI Assistant, I am here to take interview to you
          </p>
        </div>
      );
    }

    return renderChatMessages();
  };

  useEffect(() => {
    if (true) {
      //   resetResponse();
      inputRef.current?.focus();
    }
  }, []);

  return (
    <Drawer
      anchor={"right"}
      PaperProps={{
        style: {
          width: windowSize.innerWidth > 780 ? '40%' : '100%',
        },
      }}
      containerClassName="drawer"
      open={true}
      onClose={() => { }}
    >
      {renderChatTitle()}
      <DrawerContainer ref={chatContainerRef}>
        {renderDrawerContainer()}
      </DrawerContainer>
      {renderChatInputPrompter()}
    </Drawer>
  );
};

export default ChatDialog;

const dotsAnimation = keyframes`
  0%,
  20% {
    color: #0000;
    text-shadow: 0.25em 0 0 #0000, 0.5em 0 0 #0000;
  }

  40% {
    color: black;
    text-shadow: 0.25em 0 0 #0000, 0.5em 0 0 #0000;
  }

  60% {
    text-shadow: 0.25em 0 0 black, 0.5em 0 0 #0000;
  }

  80%,
  100% {
    text-shadow: 0.25em 0 0 black, 0.5em 0 0 black;
  }

  80%,
  100% {
    text-shadow: 0.25em 0 0 black, 0.5em 0 0 black;
  }
`;

const blinking = keyframes`
  0% {
    opacity: 0;
  }
`;
const BlinkingContainer = styled.div`
  & {
    &::after {
      font-size: 16px;
      animation: ${blinking} 1s steps(2) infinite;
      content: "▋";
      vertical-align: baseline;
    }
  }
`;

const LoadingDots = styled.div`
  && {
    width: 2rem;
    height: 2rem;

    &::after {
      content: " •";
      animation: ${dotsAnimation} 1s steps(5, end) infinite;
    }
  }
`;

const DrawerContainer = styled.div`
  && {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
      height:0px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: gray;
      border-radius: 4px;
    }
  }
`;

const DropBoxContainer = styled.div`
  && {
    &::-webkit-scrollbar {
      width: 4px;
      height:0px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: gray;
      border-radius: 4px;
    }
  }
`;

const StyledIconButton = styled(IconButton)`
  && {
  }
`;

const ActionContainer = styled.div`
  && {
    position: absolute;
    right: 0;
    bottom 0.5rem;
    padding: 0.25rem;
  }
`;

const RecordingActionContainer = styled.div`
  && {
    position: absolute;
    left: 0;
    bottom 0.5rem;
    padding: 0.25rem;
  }
`;

const ChatInput = styled(TextareaAutosize)`
  && {
    width: 100%;
    padding: ${(props) => props.isRecording ? '1rem 4rem 1rem 3rem' : '1rem 4rem 1rem 1.5rem'};
    font-size: 16px !important;
    border-radius: 12px;
    border: 1px solid lightgray;
    outline: none;

    @media (max-width: 800px) {
      && {
        margin: 10px 0;
      }
    }

    &::-webkit-scrollbar {
      width: 4px;
      height:0px;
      cursor: pointer;
    }

    &::-webkit-scrollbar-thumb {
      background-color: lightgray;
      border-radius: 4px;
      cursor: pointer;
    }

    &:disabled {
      color: gray;
    }
  }
`;

const ChatsContainer = styled.div`
  & {
    display: flex;
    flex-direction: column;
  }
`;

// const ChatContainer = styled.div`
//   & {
//     padding-left: ${(prop) => (prop.role === "user" ? "50%" : 0)};
//     padding-right: ${(prop) => (prop.role === "assistant" ? "50%" : 0)};
//   }
// `;

const ChatContainer = styled.div`
  & {
    display: flex;
    background-color: ${(props) =>
    props.role === "ASSISTANT" ? "#f7f7f8" : "none"};
    width: 100%;
    border-bottom: 1px solid #dbdbdb;
    padding: 0.5rem;
  }
`;

const ChatBox = styled.div`
  & {
    padding: 1rem;
    width: 100%;
  }
`;

const ChatMessageContainer = styled.div`
  & {
    width: 100%;
    white-space: pre-wrap;
    font-size: 1rem;
  }
`;
