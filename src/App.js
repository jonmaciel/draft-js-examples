import React, { Component } from 'react'
import logo from './logo.svg'
import { Editor, EditorState, CompositeDecorator, Entity, Modifier, ContentState } from 'draft-js'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      editorState: EditorState.createWithContent(
        ContentState.createFromText('')
      )
    }
  }

  onChange = (editorState) => { this.setState({editorState}) }

  render() {
    return (
      <div className="App">
        <div className="App-header"><img src={logo} className="App-logo" alt="logo" /></div>
        <br />
        <div>
          <Editor editorState={this.state.editorState} onChange={this.onChange}/>
        </div>
      </div>
    )
  }
}
// <div>{this.state.editorState.getCurrentContent().getPlainText()}</div>
// style={{'backgroundColor': '#00ff00'}}
export default App
