import React from 'react'
import ItemPanel from '../../../components/ItemPanel/ItemPanel'
import TransformToInput from '../../../util/TransformToInput'
import { Typography } from '@material-ui/core'

const InstructionsPanel = (props) => {
  return (
    <ItemPanel
    title="Step Description"
    small
    contentStyle={{ padding: "8px" }}
>
    <div>
        <TransformToInput
            editMode={
                props.editMode
            }
            value={
                props.editTitleValue
            }
            setValue={
                props.setEditTitleValue
            }
        >
            <Typography
                color="textPrimary"
                variant="subtitle1"
                style={{
                    textTransform:
                        "uppercase",
                }}
            >
                <b className="show-line-breaks">
                    {" "}
                    {
                        props
                            .selectedStep
                            .Title
                    }{" "}
                </b>
            </Typography>
        </TransformToInput>
        {props.getEditButton()}
        <br />
        <TransformToInput
            editMode={
                props.editMode
            }
            value={
                props
                    .editJobTextValue
            }
            setValue={
                props.onEditJobTextChange
            }
            multiline={true}
            rows={10}
        >
            <Typography
                className="show-line-breaks"
                color="textPrimary"
            >
                {props.getJobText(
                    props
                        .selectedStep
                )}
            </Typography>
        </TransformToInput>
    </div>
</ItemPanel>
  )
}

export default InstructionsPanel