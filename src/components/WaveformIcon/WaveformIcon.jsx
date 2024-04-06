import { Box } from '@mui/material';
import './WaveformIcon.css';


export const WaveformIcon = ({sx,hasSound}) => {
    return <Box className={["boxContainer", ...hasSound ? ["hasSound"]:[]]} sx={sx}>
        <div className="box box1"></div>
        <div className="box box2"></div>
        <div className="box box3"></div>
        <div className="box box4"></div>
        <div className="box box5"></div>
        <Box></Box>
    </Box>
}