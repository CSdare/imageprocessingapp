import React from 'react';
import URLForm from './URLForm';
import FileUpload from './FileUpload';
import Process from './Process';
import ImagesContainer from './ImagesContainer';
import SepiaWorker from 'worker-loader!../../workers/sepiaWorker.js';
import { Pool, WorkerThread, WorkerTask } from '../../pool/pool';

let threads = 4; // this variable will be manipulated by optimization calculation
const pool = new Pool(threads);

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      images: []
    };
    this.getImagesFromDB = this.getImagesFromDB.bind(this);
    this.addImageToDB = this.addImageToDB.bind(this);
    // this.processImages = this.processImages.bind(this);
    this.processImagesWorker = this.processImagesWorker.bind(this);
    this.setImageState = this.setImageState.bind(this);
  }

  getImagesFromDB() {
    fetch('/read', {
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
     .then(res => res.json())
     .then(data => this.setState({ images: data }))
     .catch(err => console.error('Error fetching images:', err));
  }

  addImageToDB(url) {
    const imageToAdd = { url };
    fetch('/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
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
  
  // old POTRACE code - will delete
  //
  // processImages() {
  //   this.state.images.forEach(image => {
  //     fetch(`/process/${image._id}`)
  //     .then(res => res.json())
  //     .then(svg => this.setImageState(svg))
  //     .catch(err => console.error('Error convering image:', err));
  //   });
  // }

  processImagesWorker() {
    pool.init(); // if we put this at the top of the page, process only works once
    const images = this.state.images.slice();
    images.forEach(image => {
      const tempCanvas = document.createElement('canvas');
      const tempImage = document.createElement('IMG');
      tempImage.src = image.url;
      tempCanvas.width = tempImage.width;
      tempCanvas.height = tempImage.height;
      const context = tempCanvas.getContext('2d');
      context.drawImage(tempImage, 0, 0, tempCanvas.width, tempCanvas.height);
      const canvasData = context.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

// need to put the workerSepiaCallback here so that is has access to the tempCanvas/context
      const workerSepiaCallback = (event) =>  {
        context.putImageData(event.data.canvasData, 0, 0);
        const newURL = tempCanvas.toDataURL('image/png');
        this.setState((prevState) => {
          const index = prevState.images.findIndex(image => image._id === event.data._id);
          const images = prevState.images.slice();
          images.splice(index, 1, { _id: event.data._id, url: newURL });
          return { images };
        })
      }

// creating a task and sending it to the pool
      const task = new WorkerTask(SepiaWorker, workerSepiaCallback, { canvasData, _id: image._id });
      pool.addWorkerTask(task);
      console.log('# of tasks in queue: ', pool.taskQueue.length);
      console.log('# of workers in queue: ', pool.workerQueue.length);
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
        <Process processImages={this.processImages} processImagesWorker={this.processImagesWorker} />
        <ImagesContainer images={this.state.images} />
      </div>
    );
  }
}

export default App;