// @flow
import React, { Component } from 'react'
import { List } from 'immutable'
import logo from './logo.svg'
import {Editor, EditorState, KeyBindingUtil, CompositeDecorator, ContentState, Entity, SelectionState, Modifier, ContentBlock, genKey} from 'draft-js'
import './App.css'
const {hasCommandModifier} = KeyBindingUtil
const HANDLE_REGEX = /\%\{[^{]+\}/g
const INVALID_REGEX = /\%\{[\w]+ /g
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
    this.handleStrategy = this.handleStrategy.bind(this)
    this.handleSpan = this.handleSpan.bind(this)
    this.onChange = this.onChange.bind(this)
    this.addVar = this.addVar.bind(this)

    const compositeDecorator = new CompositeDecorator([{strategy: this.handleStrategy, component: this.handleSpan}])
    this.state = {editorState: EditorState.createEmpty(compositeDecorator)}
  }

  handleSpan(props) {
    const componentStartIndex = props.contentState.selectionBefore.anchorOffset
    const componentEndIndex = props.contentState.selectionAfter.anchorOffset

    return (
      <span style={styles.handle} data-offset-key={props.offsetKey} contentEditable={false}>
        <a>
          Field
          <span onClick={() => this.removeVar(componentStartIndex, componentEndIndex)}>X</span>
        </a>
        <span style={{display: 'none'}}>{props.children}</span>
      </span>
    )
  }

  onChange(editorState) { this.setState({editorState}) }

  handleStrategy(contentBlock, callback, contentState) {
    this.findWithRegex(HANDLE_REGEX, contentBlock, callback)
  }

  findWithRegex(regex, contentBlock, callback) {
    const text = contentBlock.getText()
    let varOfSet = []
    let matchArr, start, end


    contentBlock.findEntityRanges((character) => {
      var entityKey = character.getEntity();
      return entityKey !== null && Entity.get(entityKey).getType() === 'FIELDVAR';
    }, callback)
  }

  addVar() {
    var label = '%{teste vizu}'
    const editorState = this.state.editorState;
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const entityKey = Entity.create('FIELDVAR', 'IMMUTABLE', {});

    this.setState({
        editorState: EditorState.push(
          editorState,
          Modifier.replaceText(currentContent, selection, label, null, entityKey),
          'replace-text'
        )
    });

  }

  removeVar(start, end) {
    // var currentContentState = currentEditorState.getCurrentContent();

    // var newContentState = Modifier.applyEntity(currentContentState, currentEditorState.getSelection(), null);
    // var newEditorState = EditorState.push(currentEditorState, newContentState, 'apply-entity')

    let editorState = this.state.editorState
    let selectionState = editorState.getSelection()

    selectionState = selectionState.merge({anchorOffset: start, focusOffset: end})

    this.setState({
      editorState: EditorState.push(
        editorState,
        Modifier.removeRange(
          editorState.getCurrentContent(),
          selectionState,
          'forward'
        ),
        'remove-text'
      )
    })
  }

  render() {
    var editorState = this.state.editorState
    var selectionState = editorState.getSelection()
    return (
      <div className="App">
        <div className="App-header"><img src={logo} className="App-logo" alt="logo" /></div>
        <br />
        <div style={{'background-color': '#00ff00'}}>
          <Editor editorState={this.state.editorState} onChange={this.onChange}/>
        </div>
        <br/>
        <div>{this.state.editorState.getCurrentContent().getPlainText()}</div>
        <br/>
        <div><a href="#" onClick={this.addVar}>ADD VAR</a></div>
      </div>
    )
  }
}

export default App


/*
  var editorState = this.state.editorState
  var selectionState = editorState.getSelection()
  var anchorKey = selectionState.getAnchorKey()
  var currentContent = editorState.getCurrentContent()
  var currentContentBlock = currentContent.getBlockForKey(anchorKey)
  var start = selectionState.getStartOffset()
  var end = selectionState.getEndOffset()
  var selectedText = currentContentBlock.getText().slice(start, end)
*/