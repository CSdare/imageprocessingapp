import React from 'react';
import URLForm from './URLForm';
import FileUpload from './FileUpload';
import Process from './Process';
import ImagesContainer from './ImagesContainer';
import SepiaWorker from 'worker-loader!../../workers/sepiaWorker.js';
import { Pool, WorkerThread, WorkerTask } from '../../pool/pool';
import { processSepia } from '../../functions/tools';

let threads = 4; // this variable will be manipulated by optimization calculation
const pool = new Pool(threads);

const convertImageToCanvas = (uri) => {
  const canvas = document.createElement('canvas');
  const image = document.createElement('img');
  image.src = uri;
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const imageDataObj = context.getImageData(0, 0, Math.floor(canvas.width), Math.floor(canvas.height));
  const length = imageDataObj.width * imageDataObj.height * 4;
  return { canvas, context, imageDataObj, length };
};

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      images: []
    };
    this.getImagesFromDB = this.getImagesFromDB.bind(this);
    this.addImageToDB = this.addImageToDB.bind(this);
    this.processImagesServer = this.processImagesServer.bind(this);
    this.processImagesWorker = this.processImagesWorker.bind(this);
    this.processImagesSingle = this.processImagesSingle.bind(this);
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

  setImageState(newImages) {
    this.setState((prevState) => {
      return { images: newImages };
    })
  }
  
  // old POTRACE code - will delete
  //
  processImagesServer() {
    this.state.images.forEach(image => {
      fetch(`/process/${image._id}`)
      .then(res => res.json())
      .then(svg => this.setImageState(svg))
      .catch(err => console.error('Error convering image:', err));
    });
  }

  processImagesSingle() {
    const imagesToProcess = this.state.images.slice();
    const newImages = [];
    imagesToProcess.forEach(image => {
      const canvasObj = convertImageToCanvas(image.url);
      processSepia(canvasObj.imageDataObj.data, canvasObj.length);
      canvasObj.context.putImageData(canvasObj.imageDataObj, 0, 0);
      const newURL = canvasObj.canvas.toDataURL('image/png');
      newImages.push({ _id: image._id, url: newURL });
      this.setImageState(newImages);
    });
  }

  processImagesWorker() {
    pool.init(); // if we put this at the top of the page, process only works once
    const images = this.state.images.slice();
    images.forEach(image => {
      const canvasObj = convertImageToCanvas(image.url);

      // need to put the workerSepiaCallback here so that is has access to the tempCanvas/context
      const workerSepiaCallback = (event) =>  {
        canvasObj.context.putImageData(event.data.canvasData, 0, 0);
        const newURL = canvasObj.canvas.toDataURL('image/png');
        this.setState((prevState) => {
          const index = prevState.images.findIndex(image => image._id === event.data._id);
          const images = prevState.images.slice();
          images.splice(index, 1, { _id: event.data._id, url: newURL });
          return { images };
        })
      }

      // creating a task and sending it to the pool
      const task = new WorkerTask(SepiaWorker, workerSepiaCallback, { canvasData: canvasObj.imageDataObj, _id: image._id });
      pool.addWorkerTask(task);
      console.log('# of tasks in queue: ', pool.taskQueue.length);
      console.log('# of workers in queue: ', pool.workerQueue.length);
    });
  }

  componentDidMount() {
    this.getImagesFromDB(); 
   }

  render() {
    return (
      <div className="container">
        <h1>D.A.R.E. Images</h1>
        <URLForm addImage={this.addImageToDB} />
        <FileUpload addImage={this.addImageToDB} />
        <Process processImages={this.processImages} processImagesWorker={this.processImagesWorker} processImagesSingle={this.processImagesSingle} />
        <ImagesContainer images={this.state.images} />
      </div>
    );
  }
}

export default App;