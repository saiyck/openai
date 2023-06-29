import React, { useRef, useState } from 'react';
import {createFileName} from 'use-react-screenshot';

const CameraComponent = () => {
  const videoRef = useRef(null);
  const [screenshot, setScreenshot] = useState('');

  const handleStartCamera = async () => {
    try {
      const constraints = { video: { facingMode: 'user' } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const handleCaptureScreenshot = () => {
    let extension="jpg"
    let name="screenshot"
    const videoElement = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    canvas.getContext('2d').drawImage(videoElement, 0, 0);
    const screenshotDataUrl = canvas.toDataURL('image/png');
    console.log('screenshotDataUrl',screenshotDataUrl)
    const a = document.createElement("a");
    a.href = screenshotDataUrl;
    a.download = createFileName(extension, name);
    a.click();
    //setScreenshot(screenshotDataUrl);
  };

  return (
    <div>
      <button onClick={handleStartCamera}>Start Camera</button>
      <video style={{display:'none'}} ref={videoRef} autoPlay />
      <button onClick={handleCaptureScreenshot}>Capture Screenshot</button>
      {screenshot && <img src={screenshot} alt="Screenshot" />}
    </div>
  );
};

export default CameraComponent;
