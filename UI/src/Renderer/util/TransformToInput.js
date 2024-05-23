import { Input, withStyles } from "@material-ui/core";
import React from "react";
import { WithStyles } from "@material-ui/core";

const style = () => ({
    inputBox: {

    }
});

const TransformToInput = (props) => {
    // based on prop, return input box or text

    if (props.editMode) {
        return (
            <Input fullWidth value={props.value} onChange={props.setValue} multiline={props.multiline} rows={props.rows} />
        );
    } else {
        return props.children
    }
}

export default TransformToInput;