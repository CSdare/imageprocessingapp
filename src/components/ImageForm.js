import React from 'react';

class ImageForm extends React.Component {
  constructor() {
    super();
    this.state = {
      value: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({ value: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.addImage(this.state.value);
    this.setState({ value: '' });
    this.input.value = '';
  }

  render() {
    return (
      <form className="image-form" onSubmit={this.handleSubmit}>
        <label htmlFor="image-url">Image URL</label>
        <input  
          name="image-url" 
          type="text"
          onChange={this.handleChange}
          ref={(input) => {this.input = input}}
        />
        <button type="submit">Add Image</button>
      </form>
    );
  }
}

export default ImageForm;