import React from 'react';
import URLForm from './URLForm';
import FileUpload from './FileUpload';
import Process from './Process';
import ImagesContainer from './ImagesContainer';

const svgData = [];

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
    this.state.images.forEach(image => {
      fetch(`/process/${image._id}`)
      .then(res => res.json())
      .then(svg => {
        const base64 = 'data:image/svg+xml;base64,' + window.btoa(svg.data);
        this.setState((prevState) => {
          const index = prevState.images.findIndex(image => image._id === svg.id);
          const images = prevState.images.slice();
          images.splice(index, 1, { _id: svg.id, url: base64 })
          return { images };
        });
      })
      .catch(err => console.error('Error convering image:', err));
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
        <URLForm addImage={this.addImageToDB} />
        <FileUpload addImage={this.addImageToDB} />
        <Process processImages={this.processImages} />
        <ImagesContainer images={this.state.images} />
      </div>
    );
  }
}

export default App;