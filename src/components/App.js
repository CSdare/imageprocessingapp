import React from 'react';
import URLForm from './URLForm';
import FileUpload from './FileUpload';
import Process from './Process';
import ImagesContainer from './ImagesContainer';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      images: []
    };
    this.getImagesFromDB = this.getImagesFromDB.bind(this);
    this.addImageToDB = this.addImageToDB.bind(this);
    this.processImages = this.processImages.bind(this);
    this.processImagesWorker = this.processImagesWorker.bind(this);
    this.setImageState = this.setImageState.bind(this);
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

  setImageState(svg) {
    this.setState((prevState) => {
      const index = prevState.images.findIndex(image => image._id === svg._id);
      const images = prevState.images.slice();
      images.splice(index, 1, { _id: svg.id, url: svg.url })
      return { images };
    })
  }

  processImages() {
    this.state.images.forEach(image => {
      fetch(`/process/${image._id}`)
      .then(res => res.json())
      .then(svg => this.setImageState(svg))
      .catch(err => console.error('Error convering image:', err));
    });
  }

  processImagesWorker() {
    const worker = new svgWorker;
    const images = this.state.images.slice();
    images.forEach(image => {
      worker.postMessage(image);
    });
    worker.onmessage = e => this.setImageState({ _id: e.data._id, url: e.data.url });
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
        <Process processImages={this.processImages} processImagesWorker={this.processImagesWorker} />
        <ImagesContainer images={this.state.images} />
      </div>
    );
  }
}

export default App;