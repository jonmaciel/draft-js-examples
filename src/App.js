// @flow
import React, { Component } from 'react'
import logo from './logo.svg'
import {Editor, EditorState, getDefaultKeyBinding, KeyBindingUtil, CompositeDecorator, SelectionState, Modifier} from 'draft-js'
import './App.css'
const {hasCommandModifier} = KeyBindingUtil
const HANDLE_REGEX = /\%\{[\w\?]+/g
const styles = {
  handle: {
    color: 'rgba(98, 177, 254, 1.0)',
    direction: 'ltr',
    unicodeBidi: 'bidi-override',
  }
}

const HandleSpan = (props) => (
  <span style={styles.handle} data-offset-key={props.offsetKey} contentEditable={false}>
    <a> Title X </a>
    <span style={{display: 'none'}}>
      {props.children}
    </span>
  </span>
)

class App extends Component {
  constructor(props) {
    super(props)
    this.myKeyBindingFn = this.myKeyBindingFn.bind(this)
    this.handleStrategy = this.handleStrategy.bind(this)
    this.onChange = this.onChange.bind(this)

    const compositeDecorator = new CompositeDecorator([{strategy: this.handleStrategy, component: HandleSpan}])
    this.state = {editorState: EditorState.createEmpty(compositeDecorator)}
  }

  onChange(editorState) {
    // let currentContent = editorState.getCurrentContent()
    // const selection = editorState.getSelection();
    // let blockMap = currentContent.getBlockMap()

    // const block = editorState.getCurrentContent().getBlockForKey(selection.getAnchorKey());
    // var selectionState = editorState.getSelection()
    // if (block.getText().indexOf("--") !== -1) {
    //       // Replace '--' with '*'
    //   const contentWithoutDash = Modifier.replaceText(
    //       editorState.getCurrentContent(),
    //       new SelectionState({
    //         anchorKey: block.getKey(),
    //         anchorOffset: 0,
    //         focusKey: block.getKey(),
    //         focusOffset: 2
    //       }),
    //       "*");
    //   editorState = EditorState.push(
    //       editorState,
    //       contentWithoutDash,
    //       'replace-text'
    //   );
    // }
    this.setState({editorState});



/*
    var newBlockMap = blockMap.map((contentBlock) => contentBlock.set('text', contentBlock.getText().replace('aa', '')))

    currentContent = currentContent.set('blockMap', newBlockMap)

    this.setState({
      editorState: EditorState.push(editorState, currentContent, 'remove-text')
    })
*/
    // this.setState({editorState})
  }

 handleBeforeInput(e) {
    if(e === ' ') {
      const { editorState } = this.state;
      const content = editorState.getCurrentContent();
      const selection = editorState.getSelection();
      const end = selection.getEndOffset();

      const block = content.getBlockForKey(selection.getAnchorKey());
      const word = block.getText();
      const result = word.slice(this.state.lastOffset, selection.getEndOffset());
      const newSelection = new SelectionState({
          anchorKey: block.getKey(),
          anchorOffset: 0,
          focusKey: block.getKey(),
          focusOffset: 0
      })
      const contentReplaced = Modifier.removeRange(
                content,
                newSelection)
      const editorStateModified = EditorState.push(
         editorState,
         contentReplaced,
         'replace-text'
      );

      this.setState({lastOffset: selection.getEndOffset(), editorState:  editorStateModified})
      return true;
    } else {
      return false;
    }
  }

  myKeyBindingFn(e: SyntheticKeyboardEvent): string {
    console.log(e.keyCode)
    if ([13, 219, 221].includes(e.keyCode)) { return false }
  }

  handleStrategy(contentBlock, callback, contentState) {
    this.findWithRegex(HANDLE_REGEX, contentBlock, callback, contentState)
  }


  findWithRegex(regex, contentBlock, callback, contentState) {
    const text = contentBlock.getText()
    let matchArr, start, newText, newContentState, newBlockMap
    const blockMap = contentState.getBlockMap()


    while ((matchArr = regex.exec(text)) !== null) {
      start = matchArr.index
      newBlockMap = blockMap.map((contentBlock) => {
        newText = contentBlock.getText().replace(contentBlock.getText().slice(start, start + matchArr[0].length), '')
        return contentBlock.set('text', newText)
      })


      // newContentState = contentState.set('blockMap', newBlockMap)
      // const newEditorState = this.state.editorState

      // this.setState({
      //   editorState: EditorState.push(newEditorState, newContentState, 'change-block-data')
      // })

      // console.log(contentState.toJSON())
      // callback(start, start + matchArr[0].length)
    }

  }

  render() {
    var editorState = this.state.editorState
    var selectionState = editorState.getSelection()
    var anchorKey = selectionState.getAnchorKey()
    var currentContent = editorState.getCurrentContent()
    var currentContentBlock = currentContent.getBlockForKey(anchorKey)
    var start = selectionState.getStartOffset()
    var end = selectionState.getEndOffset()
    var selectedText = currentContentBlock.getText().slice(start, end)

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </div>
        <br />
        <div style={{'background-color': '#00ff00'}}>
          <Editor editorState={this.state.editorState} onChange={this.onChange} keyBindingFn={this.myKeyBindingFn} />
        </div>
        <br/>
        <div>
          {this.state.editorState.getCurrentContent().getPlainText()}
        </div>
      </div>
    )
  }
}

export default App
