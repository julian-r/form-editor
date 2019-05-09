import React from "react";
import FormEditor from "./FormEditor";

import { Grid, Card } from "@material-ui/core";

class App extends React.Component {
  state = { editor: null };

  onEditorChange = value => {
    this.setState({ editor: value });
  };

  render() {
    return (
      <Grid container>
        <Grid item>
          <FormEditor
            value={this.state.editor}
            onChange={this.onEditorChange}
          />
        </Grid>
        <Grid item>
          <Card>{JSON.stringify(this.state.editor)}</Card>
        </Grid>
      </Grid>
    );
  }
}

export default App;
