import processSepia from '../functions/tools';

onmessage = (e) => {
  const len = e.data.canvasData.height * e.data.canvasData.width * 4;
  processSepia(e.data.canvasData.data, len);
  const canvasData = e.data.canvasData;
  postMessage({ canvasData, _id: e.data._id });
}



