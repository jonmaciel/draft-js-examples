// @flow
import React, { Component } from 'react'
import logo from './logo.svg'
import { Editor, EditorState, CompositeDecorator, Entity, Modifier, ContentState } from 'draft-js'
import './App.css'

const styles = {
  handle: {
    color: 'rgba(98, 177, 254, 1.0)',
    direction: 'ltr',
    unicodeBidi: 'bidi-override',
  }
}

class App extends Component {
  constructor(props) {
    super(props)
    const compositeDecorator = new CompositeDecorator([{ strategy: this.fieldVarStrategy, component: this.decoratorComponent }])

    this.state = {
      editorState: EditorState.createWithContent(
        ContentState.createFromText('Hello World! 🍺🍺🍺'),
        compositeDecorator
      )
    }
  }

  decoratorComponent = (props) => {
    // props.children
    return (
      <span style={styles.handle} data-offset-key={props.offsetKey} contentEditable={false}>
        <a>Variable <span onClick={() => this.removeVarByEntity(props.entityKey)}>X</span></a>
      </span>
    )
  }

  onChange = editorState => this.setState({editorState})

  fieldVarStrategy = (contentBlock, callback, contentState) => {
    contentBlock.findEntityRanges((character) => {
      let entityKey = character.getEntity();
      return entityKey !== null && contentState.getEntity(entityKey).getType() === 'FIELDVAR';
    }, callback)
  }

  addVar = () => {
    let label = '%{VALUE}'
    const editorState = this.state.editorState;
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const entityKey = Entity.create('FIELDVAR', 'IMMUTABLE', {});

    this.setState({
        editorState: EditorState.push(
          editorState,
          Modifier.replaceText(contentState, selection, label, null, entityKey),
          'replace-text'
        )
    });
  }

  removeVarByEntity = (entityKey) => {
    let editorState = this.state.editorState
    let contentState = editorState.getCurrentContent()

    contentState.getBlockMap().forEach((block) => {
      block.findEntityRanges((character) => (entityKey === character.getEntity()), this.removeVar)
    })
  }

  removeVar = (start, end) => {
    let editorState = this.state.editorState
    let contentState = editorState.getCurrentContent()
    let selectionState = editorState.getSelection().merge({anchorOffset: start, focusOffset: end})

    this.setState({
      editorState: EditorState.push(
        editorState,
        Modifier.removeRange(
          contentState,
          selectionState,
          'forward'
        ),
        'remove-text'
      )
    })
  }

  render() {
    return (
      <div className="App">
        <div className="App-header"><img src={logo} className="App-logo" alt="logo" /></div>
        <br />
        <div style={{'backgroundColor': '#00ff00'}}>
          <Editor editorState={this.state.editorState} onChange={this.onChange}/>
        </div>
        <br/>
        <div>{this.state.editorState.getCurrentContent().getPlainText()}</div>
        <br/>
        <div>
          <a href="#AddVar" onClick={this.addVar}>ADD VAR</a>
        </div>
      </div>
    )
  }
}

export default App
