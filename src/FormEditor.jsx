import React from 'react';
import update from 'immutability-helper';
import produce from 'immer';
import RichTextEditor from 'react-rte';
import { isEqual, zip } from 'lodash';

import {
  Collapse,
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

import {
  Delete,
  Add,
  Clear,
  ArrowUpward,
  ArrowDownward,
  KeyboardArrowRight,
  KeyboardArrowDown
} from '@material-ui/icons';

import { withStyles, withTheme } from '@material-ui/core/styles';

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// update.extend('$unset', function(keysToRemove, original) {
//   var copy = Object.assign({}, original);
//   for (const key of keysToRemove) delete copy[key];
//   return copy;
// });

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

const DEFAULT_STATE = { type: 'object', properties: {}, displayOrder: [], required: [] };

const FIELDS = {
  default: {
    title: 'Text',
    schema: { type: 'string', title: '', name: '' }
  },
  email: {
    title: 'Email',
    schema: {
      type: 'string',
      title: '',
      format: 'email'
    }
  },
  date: {
    title: 'Date',
    schema: {
      type: 'string',
      title: '',
      format: 'date'
    }
  },
  number: {
    title: 'Number',
    schema: { type: 'number', title: '' }
  },
  url: {
    title: 'URL',
    schema: {
      type: 'string',
      title: '',
      format: 'url'
    }
  },
  description: {
    title: 'Description Text',
    schema: {
      displayAs: 'description',
      description: ''
    }
  },
  radio: {
    title: 'Radio',
    schema: {
      displayAs: 'radio',
      type: 'string',
      enum: ['value A', 'value B', 'value C'],
      descriptions: ['Rich text for A', 'Rich text for B', 'Rich text for C']
    }
  },
  dropdown: {
    title: 'Dropdown',
    schema: {
      displayAs: 'dropdown',
      type: 'string',
      title: '',
      enum: ['value A', 'value B'],
      titles: ['Text for A', 'Text for B']
    }
  },
  boolean: {
    title: 'Checkbox',
    schema: { type: 'boolean', description: '', name: '' }
  }
};

function addField(formObject, schema, onChange) {
  const fieldName = `field-${new Date().getTime()}`;

  const newFormObject = produce(formObject, draft => {
    draft.displayOrder.push(fieldName);
    if (formObject.properties == null) draft.properties = {};
    draft.properties[fieldName] = schema;
    draft.properties[fieldName]._id = fieldName;
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

class EnumField extends React.Component {
  render() {
    const {
      options,
      descriptions,
      titles,
      classes,
      onNameChange,
      onDescriptionChange,
      onTitleChange,
      onAddOption,
      onDeleteOption,
      onChangePosition
    } = this.props;
    return (
      <React.Fragment>
        <div className={classes.fieldItem}>
          <Typography className={classes.optionsTitle} variant="h6">
            Options
          </Typography>
          {options.map((option, index) => {
            const isUp = index === 0;
            const isDown = index >= options.length - 1;

            let description, title;
            if (descriptions != null) {
              description = descriptions[index];
            }
            if (titles != null) {
              title = titles[index];
            }

            return (
              <div className={classes.options} key={index}>
                <TextField
                  label="Name"
                  value={option}
                  fullWidth
                  margin="normal"
                  onChange={evt => onNameChange(index, evt.target.value)}
                />
                {description && (
                  <RichField
                    label={`Description`}
                    value={description}
                    onChange={val => onDescriptionChange(index, val)}
                  />
                )}
                {title && (
                  <TextField
                    label={`Description`}
                    value={title}
                    fullWidth
                    margin="normal"
                    onChange={evt => onTitleChange(index, evt.target.value)}
                  />
                )}
                <div className={classes.optionsActions}>
                  <IconButton disabled={isUp} onClick={() => onChangePosition(index, index - 1)}>
                    <ArrowUpward />
                  </IconButton>
                  <IconButton disabled={isDown} onClick={() => onChangePosition(index, index + 1)}>
                    <ArrowDownward />
                  </IconButton>
                  <DeleteConfirmDialog fieldName={option} onChange={() => onDeleteOption(index)}>
                    <IconButton>
                      <Clear />
                    </IconButton>
                  </DeleteConfirmDialog>
                </div>
              </div>
            );
          })}
          <div style={{ textAlign: 'center' }}>
            <IconButton onClick={onAddOption}>
              <Add />
            </IconButton>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const DeleteConfirmDialog = withStyles(styles)(
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

class AddFieldMenu extends React.Component {
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
      { label: 'Italic', style: 'ITALIC' },
      { label: 'Underline', style: 'UNDERLINE' }
    ]
  };

  componentDidMount() {
    const { value } = this.props;
    if (value != null) {
      this.setState({
        editorState: RichTextEditor.createValueFromString(value, 'markdown')
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.changeTo) {
      this.setState({
        editorState: RichTextEditor.createValueFromString(nextProps.value, 'markdown')
      });
      this.changeTo = null;
    }
  }

  changeTo = null;

  onChange = editorState => {
    this.setState({ editorState });
    if (this.props.onChange) {
      this.changeTo = editorState.toString('markdown');
      this.props.onChange(this.changeTo);
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

class FieldEditor extends React.Component {
  state = { expanded: false };

  handleChangeTitle = evt => {
    const newFormObject = produce(this.props.formObject, draft => {
      draft.properties[this.props.itemName].title = evt.target.value;
    });
    this.props.onChange(newFormObject);
  };

  handleChangeDescription = value => {
    const newFormObject = produce(this.props.formObject, draft => {
      draft.properties[this.props.itemName].description = value;
    });
    this.props.onChange(newFormObject);
  };

  handleChangeName = evt => {
    const newItemName = evt.target.value;
    const { itemName, formObject, onChange } = this.props;

    const newFormObject = produce(formObject, draft => {
      draft.properties[newItemName] = draft.properties[itemName];
      delete draft.properties[itemName];
      draft.displayOrder.splice(formObject.displayOrder.indexOf(itemName), 1, newItemName);
      if (formObject.required.indexOf(itemName) !== -1) {
        draft.required.splice(formObject.required.indexOf(itemName), 1, newItemName);
      }
    });
    onChange(newFormObject);
  };

  componentDidMount() {
    console.log('mounted new comp');
  }

  handleExpandClick = () => {
    this.setState({ expanded: !this.state.expanded });
  };

  handleEnumNameChange = (index, value) => {
    const { itemName, formObject, onChange } = this.props;

    const newFormObject = produce(formObject, draft => {
      draft.properties[itemName].enum[index] = value;
    });
    onChange(newFormObject);
  };

  handleEnumDescriptionChange = (index, value) => {
    const { itemName, formObject, onChange } = this.props;

    const newFormObject = produce(formObject, draft => {
      draft.properties[itemName].descriptions[index] = value;
    });
    onChange(newFormObject);
  };

  handleEnumTitleChange = (index, value) => {
    const { itemName, formObject, onChange } = this.props;

    const newFormObject = produce(formObject, draft => {
      draft.properties[itemName].titles[index] = value;
    });
    onChange(newFormObject);
  };

  handleEnumAddOption = () => {
    const { itemName, formObject, onChange } = this.props;

    const newFormObject = produce(formObject, draft => {
      draft.properties[itemName].enum.push('');
      if (formObject.properties[itemName].displayAs === 'radio')
        draft.properties[itemName].descriptions.push('');
      else if (formObject.properties[itemName].displayAs === 'dropdown')
        draft.properties[itemName].titles.push('');
    });
    onChange(newFormObject);
  };

  handleEnumDeleteOption = index => {
    const { itemName, formObject, onChange } = this.props;

    const newFormObject = produce(formObject, draft => {
      draft.properties[itemName].enum.splice(index, 1);

      draft.properties[itemName].descriptions != null &&
        draft.properties[itemName].descriptions.splice(index, 1);
      draft.properties[itemName].titles != null &&
        draft.properties[itemName].titles.splice(index, 1);
    });
    onChange(newFormObject);
  };

  handleEnumChangePosition = (oldPos, newPos) => {
    const { itemName, formObject, onChange } = this.props;

    const newFormObject = produce(formObject, draft => {
      const enumVal = draft.properties[itemName].enum[oldPos];
      draft.properties[itemName].enum.splice(oldPos, 1);
      draft.properties[itemName].enum.splice(newPos, 0, enumVal);

      if (draft.properties[itemName].descriptions != null) {
        const description = draft.properties[itemName].descriptions[oldPos];
        draft.properties[itemName].descriptions.splice(oldPos, 1);
        draft.properties[itemName].descriptions.splice(newPos, 0, description);
      }
      if (draft.properties[itemName].titles != null) {
        const name = draft.properties[itemName].titles[oldPos];
        draft.properties[itemName].titles.splice(oldPos, 1);
        draft.properties[itemName].titles.splice(newPos, 0, name);
      }
    });
    onChange(newFormObject);
  };

  // shouldComponentUpdate(nextProps, nextState) {
  //   const { itemName, formObject, onChange, classes } = this.props;
  //   if (itemName !== nextProps.itemName) return true;
  //   if (this.state.expanded !== nextState.expanded) return true;
  //   if (formObject.required.length !== nextProps.formObject.required.length) return true;
  //   if (!isEqual(formObject[itemName], nextProps.formObject[itemName])) return true;
  //   return false;
  // }

  render() {
    const { expanded } = this.state;
    const { itemName, formObject, onChange, classes, item } = this.props;
    const fieldType = FIELDS[item.displayAs] || FIELDS[item.type] || FIELDS.default;

    const title = item.title;
    return (
      <Card>
        <CardHeader
          className={classes.fieldHeader}
          subheader={fieldType.title}
          title={itemName}
          action={
            <IconButton onClick={this.handleExpandClick}>
              {expanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
            </IconButton>
          }
        />
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent className={classes.fieldContent}>
            <TextField
              label="Name"
              value={itemName}
              onChange={this.handleChangeName}
              fullWidth
              margin="normal"
            />
            {item.title != null && (
              <TextField
                label="Title"
                value={title}
                onChange={this.handleChangeTitle}
                fullWidth
                margin="normal"
              />
            )}
            {item.enum != null && (
              <EnumField
                options={item.enum}
                descriptions={item.descriptions}
                titles={item.titles}
                classes={classes}
                onNameChange={this.handleEnumNameChange}
                onDescriptionChange={this.handleEnumDescriptionChange}
                onTitleChange={this.handleEnumTitleChange}
                onAddOption={this.handleEnumAddOption}
                onDeleteOption={this.handleEnumDeleteOption}
                onChangePosition={this.handleEnumChangePosition}
              />
            )}
            {item.description != null && (
              <RichField value={item.description} onChange={this.handleChangeDescription} />
            )}
          </CardContent>
        </Collapse>
        <CardActions className={classes.fieldActions}>
          {item.displayAs != 'description' && (
            <FormControlLabel
              control={
                <Checkbox
                  onChange={evt => setRequired(formObject, itemName, onChange, evt.target.checked)}
                  checked={formObject.required.indexOf(itemName) !== -1}
                />
              }
              label={'required'}
            />
          )}
          <DeleteConfirmDialog
            fieldName={itemName}
            onChange={() => removeField(formObject, itemName, onChange)}
          >
            <IconButton>
              <Delete />
            </IconButton>
          </DeleteConfirmDialog>
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
                  {(displayOrder || []).map((itemName, index) => {
                    const item = formObject.properties[itemName];
                    const key = item._id;
                    return (
                      <Draggable key={key} draggableId={key} index={index}>
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
                              item={item}
                            />
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Grid>

        <Grid item xs={12}>
          <AddFieldMenu fields={FIELDS} onClick={schema => addField(formObject, schema, onChange)}>
            Add field
          </AddFieldMenu>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(withTheme()(FormEditor));
