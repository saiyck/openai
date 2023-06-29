import * as React from 'react';
import VoiceCreate from './VoiceCreate';
import Grid from '@mui/material/Grid';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {createTheme,ThemeProvider} from '@mui/material/styles';
import NotFound from './components/NotFound';

const defaultTheme = createTheme();

export default function App() {
  return (
     <ThemeProvider theme={defaultTheme}>
      <BrowserRouter>
    <Routes>
      <Route path='/' element={<NotFound/>}/>
      <Route path='/:id' element={<VoiceCreate/>}/>
    </Routes>
    </BrowserRouter>
     </ThemeProvider>
  );
}