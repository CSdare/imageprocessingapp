import { noise, colorDistance, processSepia } from '../functions/tools.js';

onmessage = (e) => {
  const len = e.data.canvasData.height * e.data.canvasData.width * 4;
  processSepia(e.data.canvasData.data, len);
  const canvasData = e.data.canvasData;
  postMessage({ canvasData, id: e.data.id });
}



