import React from 'react';
import ReactDOM from 'react-dom';

//Components
import Background from './components/background.jsx';
import {Content} from './components/content.jsx';

//Rendering
ReactDOM.render(
	<Background />,
	document.getElementById('background')
);

ReactDOM.render(
	<Content />,
	document.getElementById('content')
);
