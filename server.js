'use strict'

require('dotenv').config();

const cors = require('cors');
const express = require('express');
const superagent = require('superagent');
const yelp = require('yelp-fusion');

const app = express();

const PORT = process.env.PORT||3000;

app.use(cors())

//********* ROUTES ********
app.get('/location',(request, response) => {
    getLocation(request.query.data)
        .then(res => response.send(res))
        .catch(err => response.send(err))
})
app.get('/weather', getWeather)
app.get('/yelp', getYelp)
app.get('/movies', getMovies)

// ***** Routes with full API list *****
app.get('/yelpAPI', (request, response) => {
    const url = `https://api.yelp.com/v3/businesses/search?term=food&latitude=37.8267&longitude=-122.4233`
    superagent.get(url).set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
        .then(res => response.send(res.body))
        .catch(err => response.send(HandleError(err)))
})
app.get('/moviesAPI',(request, response)=>{
    const url = `https://api.themoviedb.org/3/movie/now_playing?page=1&language=en-US&api_key=${process.env.MOVIES_API_KEY}`
    superagent.get(url)
        .then(res => response.send(res.body))
        .catch(err => response.send(HandleError(err)))
})
app.get('/weatherAPI',(request, response) => {
    const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/37.8267,-122.4233`
    superagent.get(url)
        .then(res => response.send(res.body))
        .catch(err => response.send(HandleError(err)))
})

//  ******** Old Codes *******
//
// app.get('/location',(request, response) => {
//     const url = `https://maps.googleapis.com/maps/api/geocode/json?key=${process.env.GOOGLEGEOCODE_API_KEY}&address=7600+wisconsin+ave+Bethesda+MD`
//     superagent.get(url)
//         .then(res => response.send({
//             latitude: res.body.results[0].geometry.location.lat,
//             longitude: res.body.results[0].geometry.location.lng
//         }))
//     .catch(err => response.send('<img src="http://http.cat/404" />'))
    
// })



// app.get('/weather',(request, response) => {
//     const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_CODE}/37.8267,-122.4233`
//     superagent.get(url)
//         .then(res => response.send({
//              Weekforcast: res.body.daily.summary,
//              temperature: res.body.currently.temperature,
//              forcast: res.body.hourly.summary

//         }))
// })

//****** Reporting *******
app.get(`*`, (request,response) => {
    response.send(`<img src="http://http.cat/500" />`);
})

app.listen(PORT, () => {
    console.log(`Yo the server jawnt is now running on port: ${PORT}`)
})

function HandleError(err){
    return({error: err, message:`Someting is broken dude!!!`})
}

//****** LOCATION *******
function getLocation(query){
    const url = `https://maps.googleapis.com/maps/api/geocode/json?key=${process.env.GOOGLEGEOCODE_API_KEY}&address=${query}`
    return superagent.get(url)
        .then(res => {
            return new Location(res.body.results[0].geometry.location.lat, res.body.results[0].geometry.location.lng)
        })
}
function Location(lat,lng){
    this.latitude = lat;
    this.longitude = lng;
}


//****** WEATHER ******
function getWeather(request, response){
    const url= `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${request.query.data}`
    superagent.get(url)
        .then(res => response.send(new Weather(res.body)))
        .catch(err => response.send(HandleError(err)))
}

function Weather(weatherObj){[
    this.location = weatherObj.timezone,
    this.time = new Date(weatherObj.currently.time * 1000).toString().slice(0,15),
    this.Week_Forcast = weatherObj.daily.summary,
    this.temperature = weatherObj.currently.temperature,
    this.forcast = weatherObj.hourly.summary
]}

//*********** Yelp ******
function getYelp(request, response){
    const url = `https://api.yelp.com/v3/businesses/search?term=food&latitude=37.8267&longitude=-122.4233`
    superagent.get(url).set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
        .then(res => response.send(new Yelp(res.body)))
        .catch(err => response.send(HandleError(err)))    
}
function Yelp(yelpObj){
    this.Restaurant_1 = yelpObj.businesses[0].name,
    this.yelp_rating = yelpObj.businesses[0].rating,
    this.Info_1 = yelpObj.businesses[0].categories[0].title,
    this.Info_2 = yelpObj.businesses[0].categories[1].title,
    this.Address = yelpObj.businesses[0].location.display_address,
    this.Phone = yelpObj.businesses[0].display_phone,
    this.Yelp_url = yelpObj.businesses[0].url
}
//*********** Movie DB ********
function getMovies(request, response){
    const url = `https://api.themoviedb.org/3/movie/now_playing?page=1&language=en-US&api_key=${process.env.MOVIES_API_KEY}`
    superagent.get(url)
        .then(res => response.send(new Movies(res.body)))
        .catch(err => response.send(HandleError(err)))
}
function Movies(moviesObj){
    this.Title = moviesObj.results[0].title,
    this.Overview = moviesObj.results[0].overview,
    this.Release_date = moviesObj.results[0].release_date,
    this.Vote_count = moviesObj.results[0].vote_count,
    this.Vote_average = moviesObj.results[0].vote_average
}