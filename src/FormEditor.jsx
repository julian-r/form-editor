import React from "react";
import update from "immutability-helper";
import RichTextEditor from "react-rte";

import {
  Card,
  CardHeader,
  TextField,
  Grid,
  Button,
  CardContent,
  Checkbox
} from "@material-ui/core";

const DEFAULT_STATE = { displayOrder: [], required: [] };
const DEFAULT_FIELD = { label: "", description: "**Hello World**" };

function addField(formObject, onChange) {
  const fieldName = `field-${formObject.displayOrder.length}`;
  const newFormObject = update(formObject, {
    [fieldName]: { $set: DEFAULT_FIELD },
    displayOrder: { $push: [fieldName] }
  });

  onChange(newFormObject);
}

function updateField(formObject, itemName, onChange, fieldName, value) {
  const newFormObject = update(formObject, {
    [itemName]: { [fieldName]: { $set: value } }
  });
  onChange(newFormObject);
}

class LifecycleEditor extends React.Component {
  // by default create a empty value of the editor state
  state = { editorState: RichTextEditor.createEmptyValue() };

  componentDidMount() {
    const { value } = this.props;
    if (value != null) {
      console.log("taking editor state from prop");
      this.setState({
        editorState: RichTextEditor.createValueFromString(value, "markdown")
      });
    }
  }

  // THIS component will not be able to handle a change of the value prop!!!
  // can be implemented with
  /// componentWillReceiveProps()
  // or with a key in the pparent

  onChange = editorState => {
    this.setState({ editorState });
    if (this.props.onChange) {
      this.props.onChange(editorState.toString("markdown"));
    }
  };

  render() {
    return (
      <RichTextEditor value={this.state.editorState} onChange={this.onChange} />
    );
  }
}

function setRequired(formObject, itemName, onChange, value) {
  if (value) {
    const newFormObject = update(formObject, {
      required: { $push: [itemName] }
    });
    onChange(newFormObject);
  } else {
    const newFormObject = update(formObject, {
      required: { $splice: [[formObject.required.indexOf(itemName), 1, 0]] }
    });
    onChange(newFormObject);
  }
}

function FieldEditor({ itemName, formObject, onChange }) {
  return (
    <Card>
      <CardHeader title={itemName} />
      <CardContent>
        <TextField
          label="Label"
          value={formObject[itemName].label}
          onChange={evt =>
            updateField(
              formObject,
              itemName,
              onChange,
              "label",
              evt.target.value
            )
          }
          margin="normal"
        />
        <LifecycleEditor
          value={formObject[itemName].description}
          onChange={val =>
            updateField(formObject, itemName, onChange, "description", val)
          }
        />
        <Checkbox
          label="required"
          onChange={evt =>
            setRequired(formObject, itemName, onChange, evt.target.checked)
          }
          checked={formObject.required.indexOf(itemName) !== -1}
        />
      </CardContent>
    </Card>
  );
}

export default function FormEditor({ onChange, value }) {
  const formObject = value || DEFAULT_STATE;
  const { displayOrder } = formObject;
  return (
    <Grid container>
      {(displayOrder || []).map(itemName => (
        <Grid item key={itemName}>
          <FieldEditor
            formObject={formObject}
            itemName={itemName}
            onChange={onChange}
          />
        </Grid>
      ))}
      <Button onClick={() => addField(formObject, onChange)}>Add Field</Button>
    </Grid>
  );
}
