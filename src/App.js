// @flow
import React, { Component } from 'react'
import logo from './logo.svg'
import {Editor, EditorState, getDefaultKeyBinding, KeyBindingUtil, CompositeDecorator, SelectionState, Modifier} from 'draft-js'
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
    this.myKeyBindingFn = this.myKeyBindingFn.bind(this)
    this.handleStrategy = this.handleStrategy.bind(this)
    this.handleSpan = this.handleSpan.bind(this)
    this.onChange = this.onChange.bind(this)
    this.addVar = this.addVar.bind(this)

    const compositeDecorator = new CompositeDecorator([{strategy: this.handleStrategy, component: this.handleSpan}])
    this.state = {
      editorState: EditorState.createEmpty(compositeDecorator),
      varOfSet: [],
    }
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

  myKeyBindingFn(e): string {
    // if(e.keyCode === 13) { return false }
    if(e.keyCode == 8) {
      var editorState = this.state.editorState
      var selectionState = editorState.getSelection()
      var start = selectionState.getStartOffset()
      var end = selectionState.getEndOffset()
      let varIndex = this.findVarOfset(start - 1)

      if(varIndex < 0 && start != end) {
        varIndex = this.findVarOfset(end)
      }

      if(varIndex >= 0) {
        this.removeVar(this.state.varOfSet[varIndex].start, this.state.varOfSet[varIndex].end + 1)
      }
    }

    if(e.keyCode == 46) {

    }
    return false
  }

  handleStrategy(contentBlock, callback, contentState) {
    this.findWithRegex(HANDLE_REGEX, contentBlock, callback)
  }

  findWithRegex(regex, contentBlock, callback) {
    const text = contentBlock.getText()
    let varOfSet = []
    let matchArr, start, end

    while ((matchArr = regex.exec(text)) !== null) {
      start = matchArr.index
      end = start + matchArr[0].length
      varOfSet.push({start, end})
      callback(start, end)
    }
    this.setState({varOfSet})
  }

  findVarOfset(index) {
    const varOfSet = this.state.varOfSet
    for (let i = 0; i < varOfSet.length; i++) {
      if(varOfSet[i].start <= index && index <= varOfSet[i].end) { return i }
    }
    return -1
  }

  addVar() {
    let editorState = this.state.editorState
    let selectionState = editorState.getSelection()

    this.setState({
      editorState: EditorState.push(
        editorState,
        Modifier.replaceText(
          editorState.getCurrentContent(),
          selectionState,
          '%{title}'
        ),
        'replace-text'
      )
    })
  }

  removeVar(start, end) {
    let editorState = this.state.editorState
    let varOfSet = [...this.state.varOfSet]
    let selectionState = editorState.getSelection()

    selectionState = selectionState.merge({anchorOffset: start, focusOffset: end})
    varOfSet.splice(this.findVarOfset(start), 1)

    this.setState({
      varOfSet,
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
    console.log(selectionState.getEndOffset())
    console.log(this.state.varOfSet)
    return (
      <div className="App">
        <div className="App-header"><img src={logo} className="App-logo" alt="logo" /></div>
        <br />
        <div style={{'background-color': '#00ff00'}}>
          <Editor editorState={this.state.editorState} onChange={this.onChange} keyBindingFn={this.myKeyBindingFn} />
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