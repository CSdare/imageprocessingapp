const React = require('react');

const Process = (props) => {
  return (
    <div className="process">
      <button onClick={props.processImages}>Process Images</button>
    </div>
  );
};

export default Process;