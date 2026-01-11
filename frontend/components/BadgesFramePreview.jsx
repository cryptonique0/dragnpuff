import React from 'react';

export default function BadgesFramePreview() {
  const frameUrl = 'https://api.dragnpuff.xyz/api/frames/badges';
  return (
    <div className="badges-frame-preview">
      <h3>Badges Frame</h3>
      <p>Preview or share the badges frame URL:</p>
      <code>{frameUrl}</code>
      <div style={{ marginTop: '8px' }}>
        <a href={frameUrl} target="_blank" rel="noreferrer">Open Frame</a>
      </div>
    </div>
  );
}
