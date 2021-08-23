import React from 'react';
import ${LibraryName} from './components/${LibraryName}.jsx';

export default class App extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="${LibraryNameDashed}-demo-container">
				<${LibraryName} 
					
				/>
			</div>
		);
	}
}