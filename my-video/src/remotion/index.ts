import React from 'react';
import { registerRoot } from 'remotion';
import { VideoRoot } from './VideoRoot';

const Root = () => {
    return React.createElement(VideoRoot);
};

registerRoot(Root); 