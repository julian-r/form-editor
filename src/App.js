import React from "react";
import FormEditor from "./FormEditor";

import { Grid, Card } from "@material-ui/core";

class App extends React.Component {
  state = { editor: {
    displayOrder: [], 
    required: []
  } };

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
