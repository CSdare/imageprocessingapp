import React from 'react';
import URLForm from './URLForm';
import FileUpload from './FileUpload';
import Process from './Process';
import ImagesContainer from './ImagesContainer';

const imageUrls = [];

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      images: []
    };
    this.getImagesFromDB = this.getImagesFromDB.bind(this);
    this.addImageToDB = this.addImageToDB.bind(this);
    this.processImages = this.processImages.bind(this);
  }

  getImagesFromDB() {
    fetch('/read')
     .then(res => res.json())
     .then(data => this.setState({ images: data }))
     .catch(err => console.error('Error fetching images:', err));
  }

  addImageToDB(url) {
    const imageToAdd = { url };
    fetch('/create', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(imageToAdd)
    }).then(res => res.json())
      .then((data) => {
        this.setState({ images: [...this.state.images, data] });
      });
  }

  processImages() {
    const promises = this.state.images.map(image => {
      fetch(`/process/${image._id}`)
      .then(res => res.json())
      .then(data => imageUrls.push(data))
    })
    Promise.all(promises).then(() => console.log(imageUrls)); 
  }

  componentDidMount() {
    this.getImagesFromDB();
    console.log(navigator.userAgent); 
   }

  render() {
    return (
      <div className="container">
        <h1>D.A.R.E. Images</h1>
        <URLForm addImage={this.addImageToDB} />
        <FileUpload addImage={this.addImageToDB} />
        <Process processImages={this.processImages} />
        <ImagesContainer images={this.state.images} />
      </div>
    );
  }
}

export default App;