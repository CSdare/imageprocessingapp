import React from 'react';
import ImageForm from './ImageForm'
import ImagesContainer from './ImagesContainer';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      images: []
    };
    this.getImagesFromDB = this.getImagesFromDB.bind(this);
    this.addImageToDB = this.addImageToDB.bind(this);
  }

  getImagesFromDB() {
    fetch('/read')
     .then(res => res.json())
     .then(data => this.setState({ images: data }))
     .catch(err => console.error('Error fetching images:', err));
  }

  addImageToDB(url) {
    const imageToAdd = { url: url };
    fetch('/create', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(imageToAdd)
    }).then(res => res.json())
      .then((data) => {
        console.log(data);
        this.setState({ images: [...this.state.images, data] });
      });
  }


  componentDidMount() {
    this.getImagesFromDB();
    console.log(navigator.userAgent); 
   }

  render() {
    return (
      <div className="container">
        <h1>D.A.R.E. Images</h1>
        <ImageForm addImage={this.addImageToDB} />
        <ImagesContainer images={this.state.images} />
      </div>
    );
  }
}

export default App;