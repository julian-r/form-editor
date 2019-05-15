import React from "react";
import FormEditor from "./FormEditor";

import { Grid, Card } from "@material-ui/core";

const DEMO_STATE = {"displayOrder":["Vorname","Nachname","Straße","tos","Hausnummer","Lieferbedinungen","Telefonnummer","E-Mail Adresse"],"properties":{"E-Mail Adresse":{"_id":"field-1557908960867","format":"email","title":"E-Mail Adresse","type":"string"},"Hausnummer":{"_id":"field-1557908924685","name":"","title":"Hausnummer","type":"string"},"Lieferbedinungen":{"_id":"field-1557909114310","description":"Nur gültig bei Lieferadresse in Österreich wenn in den letzten 6 Monaten kein Abo bezogen wurde.\n","displayAs":"description"},"Nachname":{"_id":"field-15579081866098","name":"","title":"Nachname","type":"string"},"Straße":{"_id":"field-1557908892764","name":"","title":"Straße","type":"string"},"Telefonnummer":{"_id":"field-1557908979313","name":"","title":"Telefonnummer","type":"string"},"Vorname":{"_id":"field-1557908866098","name":"","title":"Vorname","type":"string"},"field-1557908913643":{"_id":"field-1557908913643","title":"","type":"number"},"tos":{"_id":"field-1557908999017","description":"Mit der Anmeldung stimme ich den [Allgemeinen Geschäftsbedingungen](${tos_url}) zu.\n  Hier gehts zur [Datenschutzinfo](${pp_url}). \n","name":"","type":"boolean"}},"required":["Vorname","Nachname","Straße","Hausnummer","E-Mail Adresse","Telefonnummer","tos"],"type":"object"}

class App extends React.Component {
  state = { editor: {
    displayOrder: [], 
    required: []
  } };
  state = { editor: DEMO_STATE };

  onEditorChange = value => {
    // console.log(value)
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
