import React from 'react'
import {Typography, Grid} from '@material-ui/core'


const ItemPanel = (props) => {

    let titleSize = props.small ? undefined : "h4";
    let svgHeight = props.small ? "18" : "25";
    let titleBarPadding = props.small ? "4px" : "8px";

    const MinimizeIcon = () => {
        let minimizeBackgroundColor = props.color === "secondary" ? "white" : "#E2D9CE";



        return (
            
            <svg style={{verticalAlign: 'middle'}} width={svgHeight} height={svgHeight} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="path-1-inside-1_558_49" fill="white">
                    <rect width="28" height="28" rx="1"/>
                </mask>
                <rect width="28" height="28" rx="1" fill={minimizeBackgroundColor} />
                <rect x="5" y="22" width="18" height="2" rx="1" fill="black"/>
                <rect width="28" height="28" rx="1" stroke="black" strokeWidth="4" mask="url(#path-1-inside-1_558_49)"/>
            </svg>

        );
    }

    let titleBarColor = "#3EC6CB";

    if (props.color === "secondary") {
        titleBarColor = "#E2D9CE";
    }
    
    let style = {border: '2px solid black',
            borderRadius: '4px',
            boxShadow: "-3px 3px 0px 0px #4A4A4A"
            }

  return (
    <Grid container direction="column" style={{...style, ...props.style}}>
        <Grid item>
            <Grid container justify="space-between" alignItems="center" style={{
                    backgroundColor: titleBarColor,
                    padding: titleBarPadding,
                    borderBottom: '2px solid black',
                    borderRadius: '4px',

                    }}>
                <Grid item>
                {/* , "Agency FB" */}
                    <Typography component="span" variant={titleSize} style={{fontFamily: ["Public Sans", "sans-serif"], fontWeight: 'bold'}}>{props.title}</Typography>
                </Grid>
                <Grid item>
                    <MinimizeIcon />
                </Grid>
            </Grid>
        </Grid>
        <Grid item style={props.contentStyle}>
            {props.children}
        </Grid>
    </Grid>
  )
}

export default ItemPanel