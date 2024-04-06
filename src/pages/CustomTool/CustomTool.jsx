import { Alert, Button, Box, CircularProgress, Container, Grid, Select, Link, Typography, Dialog, DialogContent, Avatar, DialogActions, MenuItem } from "@mui/material";
import { useWss } from "blustai-react-core";
import { useEffect, useState, useRef, useCallback } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Webcam from "react-webcam";
import { styled } from '@mui/material/styles';
import { WaveformIcon } from "../../components/WaveformIcon/WaveformIcon";
import MainLayout from '../../layouts/MainLayout'
import { WinnerBox } from "../../components/WinnerBox/WinnerBox";


const service_id = import.meta.env.VITE_TOOL_ID;

const RoundButton = styled(Button)({
    borderRadius: '50%',
    minWidth: '120px',
    height: '120px',
    position: 'absolute',
    marginTop: '-60px',
    marginLeft: '-60px',
    zIndex: 1,
    textTransform: 'none',
    top: '50%',
    left: "100%",
    '@media (max-width:600px)': {
        top: '100%',
        left: '50%'
    },
});

const Counter = styled(Avatar)({
    borderRadius: '50%',
    position: 'absolute',
    top: '1em',
    zIndex: 2
});

const BigLoadingProgress = ({ children }) => <Box sx={{
    fontSize: '40px',
    position: 'absolute',
    marginTop: '-40px',
    marginLeft: '-40px',
    zIndex: 1,
    top: '50%',
    left: "100%",
    '@media (max-width:600px)': {
        top: '100%',
        left: '50%'
    },
}}>
    <CircularProgress size="80px" color="info" />
    <Typography variant="h5" color="#fff" sx={{ position: 'absolute', top: '25px', left: '23px' }}>{children}</Typography>
</Box>




const CustomTool = () => {
    const { client } = useWss();
    const [started, setStarted] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [response, setResponse] = useState();
    const [error, setError] = useState();
    const [submitting, setSubmitting] = useState();
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [cIndex, setCIndex] = useState(0);
    const [closeTimer, setCloseTimer] = useState();
    const [deviceId, setDeviceId] = useState({});
    const [devices, setDevices] = useState([]);
    const [authDialogOpen, setAuthDialogOpen] = useState(false);

    const [gameResult, setGameResult] = useState([parseInt(localStorage.getItem("user_score") || 0), parseInt(localStorage.getItem("assistant_score") || 0)]);
    const [winner, setWinner] = useState(null);




    let choices = ["rock", "paper", "scissors"];
    const [randomChoice, setRandomChoice] = useState(null);

    const capture = useCallback((e) => {
        if (e?.target?.tagName && ['LI', 'li', 'BUTTON', 'button'].includes(e.target.tagName)) return;
        if (submitting && !started) return;
        console.log("capturing...", e?.target?.tagName || e);
        if (webcamRef?.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            setImgSrc(imageSrc);
            let _choice = Math.floor(Math.random() * 3);
            setRandomChoice(_choice);
            setDialogOpen(true);
            console.log("Assistant chose " + choices[_choice] + ". Determining the winner...")
            sendMessage("Your choice is  " + choices[_choice] + " Detect my choice from image", imageSrc);
        }

    }, [webcamRef, setImgSrc]);

    const start = (e) => {
        console.log("starting")
        if (e) e.preventDefault();
        setStarted(true);
    }

    const stop = (e) => {
        if (e) e.preventDefault();
        setStarted(false);
        setDialogOpen(false);
        SpeechRecognition.stopListening();
    }

    const playAgain = () => {
        setWinner(null);
        setDialogOpen(false);
        setRandomChoice(null);
        setImgSrc(null);
    }

    const commands = [
        {
            command: ["* 1 2 3", "* One two three", "* una dos cuatro", "* раз два три", "* rock paper scissors shoe", "* rock paper scissors show", "* rock paper scissors shoot"],
            callback: capture,
            isFuzzyMatch: true,
            bestMatchOnly: true,
            fuzzyMatchingThreshold: 0.2
        },
        {
            command: ["* stop",],
            callback: () => stop(),
            isFuzzyMatch: true,
            fuzzyMatchingThreshold: 0.5
        },
        {
            command: ["* play (again)",],
            callback: () => playAgain(),
            isFuzzyMatch: true,
            fuzzyMatchingThreshold: 0.5
        },
    ];

    const {
        listening,
        interimTranscript,
        isMicrophoneAvailable,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition({ commands });

    const handleDevices = useCallback(
        mediaDevices => {
            let _devices = mediaDevices.filter(({ kind }) => kind === "videoinput");
            if (!_devices?.length) setError("Webcamera is required to play this game");
            else {
                setDevices(_devices);
                setDeviceId(_devices[0]?.deviceId);
            }
        }, [setDevices]);

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then(handleDevices);
    }, [handleDevices]);



    useEffect(() => {
        if (!browserSupportsSpeechRecognition) setError("Your browser doesn't support speech recognition.");
        else client.init({
            onReady: () => {
                console.log("Blust AI Client ready");
            },
            onError: (error) => setError(error?.error || error?.message || "Blust AI Client init error")
        });
    }, [])





    const increaseCIndex = () => {
        setCIndex(Math.floor(Math.random() * 3));
        setTimeout(() => {
            increaseCIndex();
        }, 200)
    }

    const onDeviceChange = (e) => {
        e.preventDefault();
        setDeviceId(e.target.value);
    }


    const sendMessage = async (message, img) => {
        setSubmitting(true);
        try {
            setError(null);
            setResponse(null);
            let _response = await client.sendMessage({
                service: service_id,
                message,
                attachments: [{ type: "image", url: img }]
            });
            if (_response.role === 'error') {
                setSubmitting(false);
                resetTranscript();
                switch (_response.status) {
                    case 'guest_low_funds':
                        setResponse(<>
                            We're sorry, but you have reached a guest limit for requests. Please <Link onClick={() => setAuthDialogOpen(true)}>sign up</Link>.
                        </>)
                        return
                    case 'user_low_funds':
                        setResponse(<>
                            We're sorry, but you have reached your monthly limit for requests. Please try again next month or consider <Link href="https://blust.ai/dashboard/changeplan">upgrading your plan</Link> for more requests.
                        </>)
                        return
                    default:
                        setResponse("Error: " + _response.body);
                }
                return
            }
            let json = {};
            try {
                json = JSON.parse(_response.body)
            } catch {
                json = { winner: 0, comment: _response.body }
            }
            if (json.winner === 1) {
                setWinner(1);
                localStorage.setItem("user_score", gameResult[0] + 1)
                setGameResult([gameResult[0] + 1, gameResult[1]]);
            } else if (json.winner === 2) {
                setWinner(2);
                localStorage.setItem("assistant_score", gameResult[1] + 1);
                setGameResult([gameResult[0], gameResult[1] + 1]);
            }
            setResponse(json.comment);
        } catch (error) {
            setError(error?.error || error?.message || "Sending message error")
        }
        setSubmitting(false);
        resetTranscript();
        decreaseCloseTimer(5);
    }

    const decreaseCloseTimer = (sec) => {
        setCloseTimer(sec);
        if (sec === 0) playAgain();
        else setTimeout(() => decreaseCloseTimer(sec - 1), 1000);
    }


    const resetGameScore = ()=>{
        localStorage.setItem("user_score", 0);
        localStorage.setItem("assistant_score", 0);
        setGameResult([0,0]);
    }

    const onUserMedia = () => {
        SpeechRecognition.startListening({ continuous: true })
        if (!isMicrophoneAvailable) setError("Please enable mic access");
        console.log("camera ready")
        increaseCIndex();
    }

    const onUserMediaError = (error) => {
        console.error("Webcam capture error", error);
        setError("Webcam capture error: " + (error?.error || error?.message || " device error"))
    }

    return <MainLayout authDialogOpen={authDialogOpen}>
        <Container maxWidth="lg" sx={{ textAlign: 'center', mt: 2, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Typography variant="h3">Rock, Paper, Scissors</Typography>

            <Typography variant="h6">{started ? <>Say <b>rock, paper, scissors, shoot</b> and show your choice</> : 'Please allow camera & mic access to play the game.'}</Typography>

            {error &&
                <Alert severity="error">{error}</Alert>
            }
            <Box sx={{ flex: 1 }}>
                <Grid container sx={{ p: 2 }} onClick={capture}>
                    <Grid item xs={12} sm={6} sx={{ position: 'relative', maxHeight: '100%', border: '1px solid red' }}>
                        <img src={`/images/scissors.jpg`} width="100%" style={{ display: "block" }} />
                        {started &&
                            <div style={{ height: '100%', width: '100%', overflow: "hidden", position: 'absolute', top: 0, left: 0 }} >
                                <div style={{ height: '100%', width: '100%', position: "absolute", zIndex: 1, top: 0, left: '50%', transform: 'translateX(-50%)', minHeight: '100px' }}>
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        mirrored={true}
                                        onUserMedia={onUserMedia}
                                        onUserMediaError={onUserMediaError}
                                        style={{ objectFit: 'cover', minHeight: '100%' }}
                                        videoConstraints={{ deviceId }}
                                        forceScreenshotSourceSize={true}
                                    />
                                </div>
                                {devices?.length > 1 &&
                                    <Select value={deviceId} id="device_select" sx={{ position: 'absolute', zIndex: 2, bottom: '2em', right: '2em', maxWidth: "50%", overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} size="small" onChange={onDeviceChange} onClick={(e) => e.preventDefault()} color="info">
                                        {devices?.map((_device, key) => <MenuItem key={key} value={_device.deviceId} onClick={(e) => e.preventDefault()}> {_device.label}</MenuItem>
                                        )}
                                    </Select>
                                }
                            </div>
                        }
                        {started ?
                            <>
                            </>
                            :
                            <RoundButton
                                variant="contained"
                                color="error"
                                onClick={start}
                                disabled={!!error}
                            >
                                START
                            </RoundButton>
                        }
                        <Counter sx={{ left: '1em' }}>{gameResult[0]}</Counter>
                        {listening &&
                            <WaveformIcon sx={{ position: 'absolute', bottom: "1em", left: "1em", zIndex: 2 }} hasSound={!!interimTranscript} />
                        }
                    </Grid>

                    <Grid item xs={12} sm={6} sx={{ border: '1px solid red', position: 'relative' }}>
                        {randomChoice !== null ?
                            <img src={`/images/${choices[randomChoice]}.jpg`} width="100%" style={{ display: "block" }} />
                            :
                            <img src={`/images/${started ? choices[cIndex] : 'rock'}.jpg`} width="100%" style={{ display: "block" }} />
                        }
                        <Counter sx={{ right: '1em' }}>{gameResult[1]}</Counter>
                    </Grid>
                </Grid>
            </Box>
            {started &&
                <Box>
                    <Button onClick={stop}>Stop the game</Button>
                </Box>
            }
            <footer>
                <Link sx={{mx:2}} href="#" onClick={resetGameScore}>Reset score</Link>
                <Link sx={{mx:2}} href="https://github.com/blustAI/rock-paper-scissors" target="_blank">GitHub</Link>
                <Link sx={{mx:2}} href="https://discord.gg/4FDAufQ4nT" target="_blank">Discord</Link>
            </footer>
            <Dialog open={dialogOpen} maxWidth={'lg'}>
                <DialogContent>
                    <Grid container>
                        <Grid item xs={6} sx={{ position: 'relative' }}>
                            {imgSrc &&
                                <div style={{ height: '100%', width: '100%', overflow: "hidden", position: 'absolute', top: 0, left: 0 }} >
                                    <img src={imgSrc} height="100%" style={{ display: "block" }} />
                                </div>
                            }
                            {submitting &&
                                <BigLoadingProgress >VS</BigLoadingProgress>
                            }
                            {winner === 1 &&
                                <WinnerBox />
                            }
                        </Grid>
                        <Grid item xs={6} sx={{ position: 'relative' }}>
                            {randomChoice !== null &&
                                <img src={`/images/${choices[randomChoice]}.jpg`} width="100%" style={{ display: "block" }} />
                            }
                            {winner === 2 &&
                                <WinnerBox />
                            }
                        </Grid>
                    </Grid>
                    {submitting &&
                        <Alert severity="info" icon={false} > <CircularProgress color="info" size={"0.8em"} /> Determining the winner...</Alert>
                    }
                    {response &&
                        <Alert severity="success" icon={false} > {response} </Alert>
                    }
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center" }}>
                    {!submitting &&
                        <>
                            <Button size="large" onClick={stop} sx={{ px: 1 }}>Stop the game</Button>
                            <Button size="large" color="error" variant="contained" onClick={playAgain}>Play again {closeTimer}</Button>
                        </>

                    }
                </DialogActions>
            </Dialog>
        </Container>
    </MainLayout>
}

export default CustomTool;