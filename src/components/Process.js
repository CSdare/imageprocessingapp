const React = require('react');

const Process = (props) => {
  return (
    <div className="process">
      <button onClick={props.processImages}>Process Images</button>
      <button onClick={props.processImagesWorker}>Worker Process Images</button>
      <button onClick={props.processImagesSingle}>Single Thread Process Images</button>
      <button onClick={props.getImagesFromDB}>Reload Images</button>
    </div>
  );
};

export default Process;