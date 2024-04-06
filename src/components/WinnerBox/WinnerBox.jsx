import { Box } from '@mui/material';
import './WinnerBox.css';
import { useRef } from 'react';
import { useEffect } from 'react';

export const WinnerBox = () => {

    const boxRef=useRef(null);

    const addFirework = () => {
        const colors = ['color1', 'color2', 'color3', 'color4', 'color5'];
        for (let i = 0; i < 30; i++) { 
            let firework = document.createElement('div');
            firework.className = 'firework ' + colors[Math.floor(Math.random() * colors.length)];
            boxRef.current.appendChild(firework);
            firework.style.display = 'block';
            firework.style.animationDelay = `${i * 0.5}s`; 
            firework.style.top = `${Math.random() * 100}%`; 
            firework.style.left = `${Math.random() * 100}%`;
            firework.addEventListener('animationend', () => {
                firework.remove();
            });
        }
    }

    useEffect(()=>{
        addFirework();
    },[])

    return <Box sx={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, zIndex: 3,textAlign:'center'}} ref={boxRef}>
        <span className='winner-show'>Winner</span>
    </Box>
}