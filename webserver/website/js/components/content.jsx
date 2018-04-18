import React from 'react'
import axios from 'axios'

import logo from '../../assets/logo.png'

//Globals
const url = 'http://159.89.127.197:3000/openrct2/start';


export class Title extends React.Component {
	render(){
		return (
			<div>
				<img id="logo" src={"build/"+logo}/>
				<h1>Let's Play OpenRCT2!</h1>
			</div>
		);
	}
}

export class Submission extends React.Component {
	constructor(props){
		super(props);

		this.state = { 
			showForm: false,
			port: 0,
			file: null
		};

		this.onClick = this.onClick.bind(this);
		this.handleChangePort = this.handleChangePort.bind(this);
		this.handleChangeFile = this.handleChangeFile.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	onClick(){
		this.setState({ showForm: true });
	}

	handleChangePort(event){
		this.setState({port: event.target.port});
	}

	handleChangeFile(event){
		this.setState({file: event.target.files[0]});
	}

	handleSubmit(event){
		event.preventDefault();
		const formData = new FormData();
		formData.append('port', this.state.port);
		formData.append('save', this.state.file);
		axios.post(url, formData, 
		{
			headers: {
				'content-type':'multipart/form-data'
			}
		}).then((response)=>{
			alert(response.data);
		}).catch((err)=>{
			console.log(err);
		});

		this.setState({ showForm: false });	
	}

	render(){
		if(!this.state.showForm){
			return (
				<ul id="buttons">
					<li name="toggle" id="toggle" onClick={this.onClick}>
						<div>Start Your Own Experience!</div>
					</li>
				</ul>
			);
		}
		else{
			return (
				<form id="submission" onSubmit={this.handleSubmit}>
						<label>
							Port:
						</label>
						<input type="number" value={this.state.port} onChange={this.handleChangePort} />
						<label>
							Save:
						</label>
						<input type="file" onChange={this.handleChangeFile} />
					<input type="submit" value="Submit"/>
				</form>
			);
		}
	}
}

export class Content extends React.Component {
	render(){
		return (
			<div>
				<Title/>
				<Submission/>
			</div>
		);
	}
}
