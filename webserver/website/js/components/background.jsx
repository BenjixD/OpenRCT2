import React from 'react'


//Required image
import poster from '../../assets/poster.jpg'
import video from '../../assets/video.mp4'

export default class Background extends React.Component {
	render(){
		return (
			<video loop autoPlay poster={"build/"+poster}>
				<source src={"build/"+video} type="video/mp4"></source>
			</video>
		);
	}
}