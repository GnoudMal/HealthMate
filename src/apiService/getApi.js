import axios from 'axios';

const API_KEY = 'AIzaSyBMgB9yIj2AFPtzI-scJ8RR03bjo6NLLPA';

export const fetchVideoTitle = async (videoId) => {
    try {
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${API_KEY}&part=snippet`);
        const videoTitle = response.data.items[0].snippet.title;
        return videoTitle;
    } catch (error) {
        console.error('Error fetching video title:', error);
        return null;
    }
};
