import React from 'react';
import update from 'immutability-helper';
import RichTextEditor from 'react-rte';
import slugify from 'slugify';

import {
  Card,
  CardHeader,
  TextField,
  Grid,
  Button,
  CardContent,
  CardActions,
  Checkbox,
  FormControlLabel,
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogActions,
  Typography,
  FormControl,
  InputLabel
} from '@material-ui/core';

import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import { withStyles, withTheme } from '@material-ui/core/styles';

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

update.extend('$unset', function(keysToRemove, original) {
  var copy = Object.assign({}, original);
  for (const key of keysToRemove) delete copy[key];
  return copy;
});

const styles = theme => ({
  field: {
    overflow: 'visible'
  },
  fieldWrapper: {
    marginBottom: theme.spacing.unit * 2
  },
  fieldHeader: {
    backgroundColor: theme.palette.grey['100']
  },
  fieldContent: {
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`
  },
  fieldActions: {
    padding: `0 ${theme.spacing.unit * 2}px ${theme.spacing.unit}px`,
    justifyContent: 'space-between'
  },
  fieldItem: {
    marginTop: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit
  },
  remove: {
    marginRight: -(theme.spacing.unit * 2)
  },
  optionsTitle: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit
  },
  options: {
    boxShadow: theme.shadows[1],
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
    '&:not(:last-child)': {
      marginBottom: theme.spacing.unit * 2
    }
  },
  optionsActions: {
    display: 'flex',
    justifyContent: 'space-between'
  }
});

const DEFAULT_STATE = { displayOrder: [], required: [] };

const FIELDS = {
  default: {
    title: 'Text',
    schema: { type: 'string', title: '', name: '' }
  }
  // email: {
  //   title: 'Email',
  //   schema: {
  //     _type: 'email',
  //     type: 'string',
  //     title: '',
  //     description: '**Hello World**',
  //     format: 'email'
  //   }
  // },
  // date: {
  //   title: 'Date',
  //   schema: {
  //     _type: 'date',
  //     type: 'string',
  //     title: '',
  //     description: '**Hello World**',
  //     format: 'date'
  //   }
  // },
  // 'telephone-number': {
  //   title: 'Telephone number',
  //   schema: {
  //     _type: 'telephone-number',
  //     type: 'string',
  //     title: '',
  //     description: '**Hello World**',
  //     format: 'telephone-number'
  //   }
  // },
  // number: {
  //   title: 'Number',
  //   schema: { _type: 'number', type: 'number', title: '', name: '', description: '**Hello World**' }
  // },
  // url: {
  //   title: 'URL',
  //   schema: {
  //     _type: 'url',
  //     type: 'string',
  //     title: '',
  //     format: 'url'
  //   }
  // },
  // description: {
  //   title: 'Description Text',
  //   schema: {
  //     _type: 'description',
  //     type: 'text',
  //     description: '**Hello World**'
  //   }
  // },
  // radio: {
  //   title: 'Radio',
  //   schema: {
  //     _type: 'radio',
  //     type: 'string',
  //     enum: ['value A', 'value B', 'value C'],
  //     descriptions: ['Rich text for A', 'Rich text for B', 'Rich text for C']
  //   }
  // },
  // checkbox: {
  //   title: 'Checkbox',
  //   schema: { _type: 'checkbox', type: 'boolean', title: '', name: '' }
  // },
  // dropdown: {
  //   title: 'Dropdown',
  //   schema: {
  //     _type: 'dropdown',
  //     type: 'string',
  //     title: '',
  //     enum: ['value A', 'value B'],
  //     descriptions: ['Text for A', 'Text for B']
  //   }
  // }
};

function addField(formObject, schema, onChange) {
  const fieldName = `field-${new Date().getTime()}`;

  const newItem = update(schema, { _id: { $set: fieldName } });

  const newFormObject = update(formObject, {
    [fieldName]: { $set: newItem },
    displayOrder: { $push: [fieldName] }
  });

  onChange(newFormObject);
}

function removeField(formObject, fieldName, onChange) {
  const newFormObject = update(formObject, {
    $unset: [fieldName],
    displayOrder: { $splice: [[formObject.displayOrder.indexOf(fieldName), 1]] },
    required: { $splice: [[formObject.required.indexOf(fieldName), 1]] }
  });

  onChange(newFormObject);
}

function orderField(formObject, result, onChange) {
  const { destination, source } = result;

  if (!destination) {
    return;
  }

  if (destination.droppableId === source.droppableId && destination.index === source.index) {
    return;
  }

  const order = order => {
    const newOrder = [...order];

    newOrder[source.index] = order[destination.index];
    newOrder[destination.index] = order[source.index];

    return newOrder;
  };

  const newFormObject = update(formObject, {
    displayOrder: {
      $set: order(formObject.displayOrder)
    }
  });

  onChange(newFormObject);
}

function setRequired(formObject, itemName, onChange, value) {
  if (value) {
    const newFormObject = update(formObject, {
      required: { $push: [itemName] }
    });
    onChange(newFormObject);
  } else {
    const newFormObject = update(formObject, {
      required: { $splice: [[formObject.required.indexOf(itemName), 1]] }
    });
    onChange(newFormObject);
  }
}


const OptionsField = ({ formObject, itemName, onChange, classes }) => {
  const options = formObject[itemName].enum || [];
  const descriptions = formObject[itemName].descriptions || [];
  const isEnum = formObject[itemName].hasOwnProperty('enum');
  const isDesciptions = formObject[itemName].hasOwnProperty('descriptions');
  const isRich = formObject[itemName]._type !== 'dropdown';

  function addOption(formObject, itemName, onChange) {
    const newFormObject = update(formObject, {
      [itemName]: {
        enum: {
          $push: ['']
        },
        descriptions: {
          $push: ['']
        }
      }
    });

    onChange(newFormObject);
  }

  function updateOption(formObject, itemName, onChange, fieldName, value) {
    const newFormObject = update(formObject, {
      [itemName]: { [fieldName]: { $set: value } }
    });

    onChange(newFormObject);
  }

  function orderOption(formObject, itemName, onChange, sourceIndex, direction) {
    const destinationIndex =
      direction === 'down' ? sourceIndex + 1 : direction === 'up' ? sourceIndex - 1 : sourceIndex;

    const orderEnum = formObject => {
      const newEnum = [...formObject[itemName].enum];

      newEnum[sourceIndex] = formObject[itemName].enum[destinationIndex];
      newEnum[destinationIndex] = formObject[itemName].enum[sourceIndex];

      return newEnum;
    };

    const orderDescriptions = formObject => {
      const newDescriptions = [...formObject[itemName].descriptions];

      newDescriptions[sourceIndex] = formObject[itemName].descriptions[destinationIndex];
      newDescriptions[destinationIndex] = formObject[itemName].descriptions[sourceIndex];

      return newDescriptions;
    };

    const newFormObject = update(formObject, {
      [itemName]: {
        enum: {
          $set: orderEnum(formObject)
        },
        descriptions: {
          $set: orderDescriptions(formObject)
        }
      }
    });

    onChange(newFormObject);
  }

  function removeOption(formObject, itemName, onChange, index) {
    const newFormObject = update(formObject, {
      [itemName]: {
        enum: {
          $splice: [[index, 1]]
        },
        descriptions: {
          $splice: [[index, 1]]
        }
      }
    });

    onChange(newFormObject);
  }

  return (
    <React.Fragment>
      {(isEnum || isDesciptions) && (
        <div className={classes.fieldItem}>
          <Typography className={classes.optionsTitle} variant="h6">
            Options
          </Typography>
          {options.map((option, index) => {
            const isUp = index === 0;
            const isDown = index >= options.length - 1;

            return (
              <div className={classes.options} key={index}>
                {isEnum && (
                  <TextField
                    label={`Label`}
                    value={option}
                    onChange={evt =>
                      updateOption(
                        formObject,
                        itemName,
                        onChange,
                        'enum',
                        update(options, {
                          $splice: [[index, 1, evt.target.value]]
                        })
                      )
                    }
                    fullWidth
                    margin="normal"
                  />
                )}
                {isRich ? (
                  isDesciptions && (
                    <RichField
                      key={option}
                      label={`Description`}
                      value={descriptions[index]}
                      onChange={val =>
                        updateOption(
                          formObject,
                          itemName,
                          onChange,
                          'descriptions',
                          update(descriptions, {
                            $splice: [[index, 1, val]]
                          })
                        )
                      }
                    />
                  )
                ) : (
                  <TextField
                    label={`Description`}
                    multiline
                    value={descriptions[index]}
                    onChange={evt =>
                      updateOption(
                        formObject,
                        itemName,
                        onChange,
                        'descriptions',
                        update(descriptions, {
                          $splice: [[index, 1, evt.target.value]]
                        })
                      )
                    }
                    fullWidth
                    margin="normal"
                  />
                )}
                <div className={classes.optionsActions}>
                  <IconButton
                    disabled={isUp}
                    onClick={() => orderOption(formObject, itemName, onChange, index, 'up')}
                  >
                    <ArrowUpwardIcon />
                  </IconButton>
                  <IconButton
                    disabled={isDown}
                    onClick={() => orderOption(formObject, itemName, onChange, index, 'down')}
                  >
                    <ArrowDownwardIcon />
                  </IconButton>
                  <DialogField
                    fieldName={option}
                    onChange={() => removeOption(formObject, itemName, onChange, index)}
                  >
                    <IconButton>
                      <ClearIcon />
                    </IconButton>
                  </DialogField>
                </div>
              </div>
            );
          })}
          <div style={{ textAlign: 'center' }}>
            <IconButton onClick={() => addOption(formObject, itemName, onChange)}>
              <AddIcon />
            </IconButton>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

const DialogField = withStyles(styles)(
  withTheme()(
    class extends React.Component {
      state = {
        open: false
      };

      handleClickOpen = () => {
        this.setState({ open: true });
      };

      handleClose = () => {
        this.setState({ open: false });
      };

      handleDelete = () => {
        this.setState({ open: false });

        this.props.onChange();
      };

      render() {
        const { classes, children } = this.props;

        return (
          <div className={classes.remove}>
            <span onClick={this.handleClickOpen}>{children}</span>
            <Dialog
              open={this.state.open}
              onClose={this.handleClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">
                Are you sure you want to delete <b>{this.props.fieldName}</b>?
              </DialogTitle>
              <DialogActions>
                <Button onClick={this.handleClose} color="primary">
                  Cancel
                </Button>
                <Button onClick={this.handleDelete} color="primary" autoFocus>
                  OK
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        );
      }
    }
  )
);

class ListFields extends React.Component {
  state = {
    anchorEl: null
  };

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const { anchorEl } = this.state;
    const { fields, onClick, children } = this.props;

    return (
      <div>
        <Button
          color="primary"
          variant="contained"
          aria-owns={anchorEl ? 'fields-menu' : undefined}
          aria-haspopup="true"
          onClick={this.handleClick}
        >
          {children}
        </Button>
        <Menu
          id="fields-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          {Object.keys(fields).map((fieldName, index) => {
            const field = fields[fieldName];

            return (
              <MenuItem
                key={index}
                onClick={e => {
                  this.handleClose();
                  onClick(field.schema);
                }}
              >
                {field.title}
              </MenuItem>
            );
          })}
        </Menu>
      </div>
    );
  }
}

class RichField extends React.Component {
  // by default create a empty value of the editor state
  state = { editorState: RichTextEditor.createEmptyValue() };

  toolbarConfig = {
    // Optionally specify the groups to display (displayed in the order listed).
    display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS', 'LINK_BUTTONS'],
    INLINE_STYLE_BUTTONS: [
      { label: 'Bold', style: 'BOLD', className: 'custom-css-class' },
      // {label: 'Italic', style: 'ITALIC'},
      { label: 'Underline', style: 'UNDERLINE' }
    ]
    // BLOCK_TYPE_DROPDOWN: [
    //   {label: 'Normal', style: 'unstyled'},
    //   {label: 'Heading Large', style: 'header-one'},
    //   {label: 'Heading Medium', style: 'header-two'},
    //   {label: 'Heading Small', style: 'header-three'}
    // ],
    // BLOCK_TYPE_BUTTONS: [
    //   {label: 'UL', style: 'unordered-list-item'},
    //   {label: 'OL', style: 'ordered-list-item'}
    // ]
  };

  componentDidMount() {
    const { value } = this.props;

    if (value != null) {
      console.log('taking editor state from prop');
      this.setState({
        editorState: RichTextEditor.createValueFromString(value, 'markdown')
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
      this.props.onChange(editorState.toString('markdown'));
    }
  };

  render() {
    return (
      <FormControl fullWidth style={{ marginTop: 16 }}>
        <InputLabel shrink htmlFor="rich-area">
          {this.props.label}
        </InputLabel>
        <div style={{ marginTop: 24, marginBottom: 8 }}>
          <RichTextEditor
            value={this.state.editorState}
            toolbarConfig={this.toolbarConfig}
            onChange={this.onChange}
          />
        </div>
      </FormControl>
    );
  }
}

function updateField(formObject, itemName, onChange, fieldName, value) {
  const newFormObject = update(formObject, {
    [itemName]: { [fieldName]: { $set: value } }
  });

  onChange(newFormObject);

  // const newItemName = slugify(value);
  // if(itemName !== newItemName) {

  //     const newFormObject = update(formObject, {
  //       [newItemName]: { $set: formObject[itemName] },
  //       $unset: [itemName],
  //       displayOrder: {
  //         $splice: [[formObject.required.indexOf(itemName), 1, newItemName]],
  //       }
  //     });

  //     onChange(newFormObject);

  // }
}

class FieldEditor extends React.Component {
  handleTitleChange = evt => {
    const newFormObject = update(this.props.formObject, {
      [this.props.itemName]: { title: { $set: evt.target.value } }
    });

    this.props.onChange(newFormObject);
  };

  handleChangName = evt => {
    const newItemName = evt.target.value;
    const { itemName, formObject, onChange } = this.props;

    const newFormObject = update(formObject, {
      [newItemName]: { $set: formObject[itemName] },
      $unset: [itemName],
      displayOrder: {
        $splice: [[formObject.displayOrder.indexOf(itemName), 1, newItemName]]
      },
      required: {
        $splice: [[formObject.required.indexOf(itemName), 1, newItemName]]
      }
    });

    onChange(newFormObject);

    // const newFormObject = update(this.props.formObject, {
    //   [this.props.itemName]: { title: { $set: evt.target.value } }
    // });
    // this.props.onChange(newFormObject);
  };

  componentDidMount() {
    console.log('mounted new comp');
  }

  render() {
    const { itemName, formObject, onChange, classes } = this.props;
    const getSchema = FIELDS[formObject[itemName]._type] || FIELDS.default;

    const title = formObject[itemName].title;
    const name = itemName;
    return (
      <Card>
        <CardHeader className={classes.fieldHeader} subheader={`${getSchema.title}: ${itemName}`} />
        <CardContent className={classes.fieldContent}>
          {/* {isRichTitle ? (
            <RichField
              label={'Label'}
              value={formObject[itemName].title}
              onChange={val => updateField(formObject, itemName, onChange, 'title', val)}
            />
          ) : (
            <TitleField
              formObject={formObject}
              itemName={itemName}
              onChange={val => updateField(formObject, itemName, onChange, 'title', val)}
              classes={classes}
            />
          )} */}

          <TextField
            label="Title"
            value={title}
            onChange={this.handleTitleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Name"
            value={itemName}
            onChange={this.handleChangName}
            fullWidth
            margin="normal"
          />

          {/* <NameField
            formObject={formObject}
            itemName={itemName}
            onChange={val => updateField(formObject, itemName, onChange, 'name', val)}
            classes={classes}
            margin="normal"
          /> */}

          {/* {isDesciption && (
            <RichField
              value={formObject[itemName].description}
              onChange={val => updateField(formObject, itemName, onChange, 'description', val)}
            />
          )}

          <OptionsField
            formObject={formObject}
            itemName={itemName}
            onChange={onChange}
            classes={classes}
          /> */}
        </CardContent>
        <CardActions className={classes.fieldActions}>
          <FormControlLabel
            control={
              <Checkbox
                onChange={evt => setRequired(formObject, itemName, onChange, evt.target.checked)}
                checked={formObject.required.indexOf(itemName) !== -1}
              />
            }
            label={'required'}
          />
          <DialogField
            fieldName={itemName}
            onChange={() => removeField(formObject, itemName, onChange)}
          >
            <IconButton>
              <DeleteIcon />
            </IconButton>
          </DialogField>
        </CardActions>
      </Card>
    );
  }
}

class FormEditor extends React.Component {
  render() {
    const { onChange, value, classes } = this.props;
    const formObject = value || DEFAULT_STATE;
    const { displayOrder } = formObject;

    return (
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <DragDropContext onDragEnd={result => orderField(formObject, result, onChange)}>
            <Droppable droppableId={'fields'}>
              {provided => (
                <div {...provided.draggableProps} ref={provided.innerRef}>
                  {(displayOrder || []).map((itemName, index) => (
                    <Draggable
                      key={formObject[itemName]._id}
                      draggableId={formObject[itemName]._id}
                      index={index}
                    >
                      {provided => (
                        <div
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          className={classes.fieldWrapper}
                        >
                          <FieldEditor
                            formObject={formObject}
                            itemName={itemName}
                            onChange={onChange}
                            classes={classes}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Grid>

        <Grid item xs={12}>
          <ListFields fields={FIELDS} onClick={schema => addField(formObject, schema, onChange)}>
            Add field
          </ListFields>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(withTheme()(FormEditor));
