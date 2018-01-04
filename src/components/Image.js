import React from 'react';

const Image = (props) => {
  return (
    <div id={props.id} className="image">
      <img src={props.url} />
    </div>
  );
}

export default Image;