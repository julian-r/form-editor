import React from "react";
import update from "immutability-helper";

import {
  Card,
  CardHeader,
  TextField,
  Grid,
  Button,
  CardContent
} from "@material-ui/core";

const DEFAULT_STATE = { displayOrder: [] };
const DEFAULT_FIELD = { label: "" };

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
