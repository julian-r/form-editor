import React from "react";
import FormEditor from "./FormEditor";

import { Grid, Card } from "@material-ui/core";

const DEMO_STATE = {
  "displayOrder": [
    "field-1",
    "field-2",
    "field-3",
    "field-4",
    "field-5",
    "field-6",
    "field-7"
  ],
  "required": [
    "field-4",
    "field-5",
    "field-6"
  ],
  "field-1": {
    "type": "string",
    "title": "Label 1",
    "description": "**Hello World**",
    "format": "telephone-number"
  },
  "field-2": {
    "type": "number",
    "title": "Label 2",
    "description": "**Hello World**",
    "format": "number"
  },
  "field-3": {
    "type": "string",
    "title": "Label 3",
    "description": "**Hello World**",
    "format": "url"
  },
  "field-4": {
    "type": "text",
    "title": "Label 4",
    "description": "**Hello World**",
    "format": "description"
  },
  "field-5": {
    "type": "string",
    "title": "Label 5",
    "enum": [
      "value Adsds",
      "value B",
      "value C",
      "dsdsd"
    ],
    "descriptions": [
      "Rich text for A",
      "Rich text for B",
      "Rich text for C",
      ""
    ],
    "format": "radio"
  },
  "field-6": {
    "type": "boolean",
    "title": ""
  },
  "field-7": {
    "type": "string",
    "title": "",
    "enum": [
      "value A",
      "value B"
    ],
    "descriptions": [
      "Rich text for A",
      "Rich text for B"
    ],
    "format": "dropdown"
  }
}

class App extends React.Component {
  state = { editor: {
    displayOrder: [], 
    required: []
  } };
  // state = { editor: DEMO_STATE };

  onEditorChange = value => {
    console.log(value)
    this.setState({ editor: value });
  };

  render() {
    return (
      <Grid container spacing={16}>
        <Grid item style={{width: 400}}>
          <FormEditor
            value={this.state.editor}
            onChange={this.onEditorChange}
          />
        </Grid>
        <Grid item xs={6}>
          <Card style={{padding: 24}}>
            <code>
              <pre>{JSON.stringify(this.state.editor, null, 2)}</pre>
            </code>
          </Card>
        </Grid>
      </Grid>
    );
  }
}

export default App;
