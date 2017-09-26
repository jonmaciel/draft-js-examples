// @flow
import React, { Component } from 'react'
import logo from './logo.svg'
import { Editor, EditorState, CompositeDecorator, Entity, Modifier, ContentState } from 'draft-js'
import './App.css'

const styles = {
  hashTag: {
    color: 'rgba(98, 177, 254, 1.0)',
    direction: 'ltr',
    unicodeBidi: 'bidi-override',
  }
}

const HASHTAG_REGEX = /\#[\w]+/g;

class App extends Component {
  constructor(props) {
    super(props)
    const compositeDecorator = new CompositeDecorator([
      { strategy: this.hashTagStrategy, component: this.renderhashTagSpan }
    ])

    this.state = {
      editorState: EditorState.createWithContent(
        ContentState.createFromText('Hello World! 🍺🍺🍺'),
        compositeDecorator
      )
    }
  }

  renderhashTagSpan = (props) =>
    <span {...props} style={styles.hashTag}>{props.children}</span>;

  onChange = (editorState) => { this.setState({editorState}) }

  hashTagStrategy = (contentBlock, callback) => {
    this.findWithRegex(HASHTAG_REGEX, contentBlock, callback);
  }

  findWithRegex = (regex, contentBlock, callback) => {
    const text = contentBlock.getText();
    let matchArr, start;
    while ((matchArr = regex.exec(text)) !== null) {
      start = matchArr.index;
      callback(start, start + matchArr[0].length);
    }
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
      </div>
    )
  }
}

export default App
