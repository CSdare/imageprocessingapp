import React from 'react';
import Header from './Header';
import SpecDisplay from './SpecDisplay';
import FileUpload from './FileUpload';
import Process from './Process';
import ImagesContainer from './ImagesContainer';
import SepiaWorker from 'worker-loader!../../workers/sepiaWorker.js';
import { Pool, WorkerTask } from '../../pool/pool';
import convertImageToCanvas from '../../functions/convertImageToCanvas';
import processSepia from '../../functions/tools';

let threads = navigator.hardwareConcurrency || 4; // this variable will be manipulated by optimization calculation
let pool = new Pool(threads);

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      images: []
    };
    this.getImagesFromDB = this.getImagesFromDB.bind(this);
    this.addImageToDB = this.addImageToDB.bind(this);
    this.setImageState = this.setImageState.bind(this);
    this.processImagesServer = this.processImagesServer.bind(this);
    this.processImagesWorker = this.processImagesWorker.bind(this);
    this.processImagesSingle = this.processImagesSingle.bind(this);
    this.pathOfLeastResistance = this.pathOfLeastResistance.bind(this);
    //optimization + path of least resistance...
    this.runOptimization = this.runOptimization.bind(this);
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
  
  processImagesServer() {
    const imagesToProcess = this.state.images.slice();
    imagesToProcess.forEach(image => {
      fetch(`/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ _id: image._id, url: image.url })
      }).then(res => res.json())
        .then(data => {
          this.setState((prevState) => {
            const index = prevState.images.findIndex(image => image._id === data._id);
            const images = prevState.images.slice();
            images.splice(index, 1, { _id: data._id, url: data.url });
            return { images };
          })
        })
        .catch(err => console.error('Error convering image:', err));
    });
  }

  setImageState(newImage) {
    this.setState((prevState) => {
      const index = prevState.images.findIndex(image => image._id === newImage._id);
      const images = prevState.images.slice();
      images.splice(index, 1, { _id: newImage._id, url: newImage.url });
      return { images };
    });
  }

  processImagesSingle() {
    const imagesToProcess = this.state.images.slice();
    const newImages = [];
    imagesToProcess.forEach(image => {
      convertImageToCanvas(image.url, (err, canvasObj) => {
        processSepia(canvasObj.imageDataObj.data, canvasObj.length);
        canvasObj.context.putImageData(canvasObj.imageDataObj, 0, 0);
        const newURL = canvasObj.canvas.toDataURL('image/png');
        this.setImageState({ url: newURL, _id: image._id });
      });
    });
  }

  processImagesWorker() {
    pool.init(); // Initialize the pool every time we batch process images
    const time = Date.now();
    const images = this.state.images.slice();
    let counter = 0;
    images.forEach(image => {
      convertImageToCanvas(image.url, (err, canvasObj) => {
        if (err) return console.error(err);

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
        };


        // creating a task and sending it to the pool
        const task = new WorkerTask(SepiaWorker, workerSepiaCallback, { canvasData: canvasObj.imageDataObj, _id: image._id });
        pool.addWorkerTask(task);
        console.log('# of tasks in queue: ', pool.taskQueue.length);
        console.log('# of workers in queue: ', pool.workerQueue.length);
      }); 
    });
  }

  //function to execute most performant process based on the results of 
  //the runOptimization() metric...
  pathOfLeastResistance(optimalProcess) {
    //path for when server processing is most efficient method
    if (optimalProcess.processLocation === "server") this.processImagesServer();
    //path for when client processing is most efficient method
    else if (optimalProcess.processLocation === "client") {
      pool = new Pool(optimalProcess.optimalThreads);
      this.processImagesWorker();
    } else return alert("Not enough client information to optimize!");
  }

  //placeholder function to simulate calculation of most performant 
  //process based on client hardware and network information
  runOptimization() {
    let userAgent = navigator.userAgent;
    let operatingSystem = navigator.oscpu;

    let optimalProcess = {
      processLocation: null,
      optimalThreads: null,
      dynamicPing: 150,
      browser: null,
      operatingSystem: operatingSystem,
      missingDeviceInfo: null
    };

    function browserCheck(userAgent) {
      let browserOptions = ['Chrome', 'Firefox', 'Safari', 'Opera', 'IE'];
      let firstIndex = Infinity;
      let browser = null;

      for (let i = 0; i < browserOptions.length; i++) {
        if (userAgent.includes(browserOptions[i])) {
          let index = userAgent.indexOf(browserOptions[i]);

          if (index >= 0 && index < firstIndex) {
            firstIndex = index;
            browser = browserOptions[i];
          }
        }
      }
      optimalProcess.browser = browser;
    }
    
    browserCheck(userAgent);

    function threadCheck(threads, browser) {
      if (browser === 'Chrome') {
        if (threads > 14) optimalProcess.optimalThreads = 14;
        else optimalProcess.optimalThreads = threads;
      }
      else if (browser === 'Firefox' || browser === 'Safari') {
        if (threads > 12) optimalProcess.optimalThreads = 12;
        else optimalProcess.optimalThreads = threads;
      }
      else if (browser === 'Opera') {
        if (threads > 10) optimalProcess.optimalThreads = 10;
        else optimalProcess.optimalThreads = threads
      }
      else optimalProcess.optimalThreads = 4;
    }

    function applymetric(optimalProcess) {
      if (optimalProcess.dynamicPing > 100) {
        optimalProcess.processLocation = 'client';
        if (optimalProcess.browser !== 'Chrome' && optimalProcess.browser !== 'Firefox' && optimalProcess.browser !== 'Safari') {
          optimalProcess.processLocation = 'server';
        }
      }
      else optimalProcess.processLocation = 'server';
    }

    threadCheck(threads, optimalProcess.browser);
    // dynamicPing(pingsize);
    applymetric(optimalProcess);
    this.pathOfLeastResistance(optimalProcess);
    console.log('will be processed here: ', optimalProcess.processLocation);
    return optimalProcess;
  }

  componentDidMount() {
    this.getImagesFromDB(); 
  }

  render() {
    return (
      <div className="container">
        <Header />
        <Process 
          runOptimization={this.runOptimization}
          processImagesServer={this.processImagesServer} 
          processImagesWorker={this.processImagesWorker} 
          processImagesSingle={this.processImagesSingle}
          getImagesFromDB={this.getImagesFromDB}
        />
        <FileUpload addImage={this.addImageToDB} />
        <ImagesContainer images={this.state.images} />
        <SpecDisplay />
      </div>
    );
  }
}

export default App;