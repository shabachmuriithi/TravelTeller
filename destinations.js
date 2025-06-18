        const weatherApiKey = "0c5f3a6ae8154af1aa1130939251606";
        const attractionsApiKey = "7597e1dd35db4f91a5f050fc9ef65090";
        const imagesApiKey = "G409R17qpiTzPqJ9gkgadcJBakecVDdaE4RdDjXIMA1PQvbK06ZUHNHS";

        
        const countrySelect = document.getElementById('countrySelect');
        const cityList = document.getElementById('cityList');
        const weatherInfo = document.getElementById('weatherInfo');
        const itineraryList = document.getElementById('itineraryList');
        const errorMessage = document.getElementById('error-message');

        
        let itinerary = JSON.parse(localStorage.getItem('itinerary') || '[]');

       
        function displayError(message) {
            errorMessage.textContent = message;
            setTimeout(clearError, 5000);
        }

        function clearError() {
            errorMessage.textContent = '';
        }

        
        async function fetchCountries() {
            try {
                const response = await fetch('https://restcountries.com/v3.1/all?fields=name,capital');
                if (!response.ok) throw new Error('Failed to fetch countries');
                const countries = await response.json();
                countries
                    .sort((a, b) => a.name.common.localeCompare(b.name.common))
                    .forEach(country => {
                        const option = document.createElement('option');
                        option.value = country.name.common;
                        option.textContent = country.name.common;
                        countrySelect.appendChild(option);
                    });
            } catch (error) {
                displayError(`Error loading countries: ${error.message}`);
            }
        }

        
        async function fetchCities(country) {
            try {
                const response = await fetch(`https://restcountries.com/v3.1/name/${country}?fields=capital,latlng`);
                if (!response.ok) throw new Error('Failed to fetch cities');
                const data = await response.json();
                const cities = data[0].capital || [];
                const latlng = data[0].latlng || [0, 0];
                return cities.map(city => ({ name: city, lat: latlng[0], lon: latlng[1] }));
            } catch (error) {
                displayError(`Error loading cities for ${country}: ${error.message}`);
                return [];
            }
        }

        
        async function getAttractions(city, lat, lon) {
            try {
                const url = `https://api.geoapify.com/v2/places?categories=tourism.sights&filter=circle:${lon},${lat},10000&limit=3&apiKey=${attractionsApiKey}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                const attractions = await Promise.all(
                    data.features.map(async feature => {
                        const name = feature.properties.name || 'Unnamed Attraction';
                        const image = await fetchPexelsImage(name, city);
                        return { name, image };
                    })
                );
                return attractions.filter(attr => attr.name);
            } catch (error) {
                displayError(`Error fetching attractions for ${city}: ${error.message}`);
                return [];
            }
        }

        
        async function fetchPexelsImage(attractionName, cityName) {
            try {
               
                let response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(attractionName)}&per_page=1`, {
                    headers: { Authorization: imagesApiKey }
                });
                let data = await response.json();
                if (data.photos.length) {
                    return data.photos[0].src.medium;
                }

               
                response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(cityName)}&per_page=1`, {
                    headers: { Authorization: imagesApiKey }
                });
                data = await response.json();
                return data.photos.length ? data.photos[0].src.medium : null;
            } catch (error) {
                console.error(`Error fetching Pexels image for ${attractionName}:`, error);
                return null;
            }
        }

        async function fetchWeather(city) {
            try {
                const url = `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${city}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to fetch weather');
                const weather = await response.json();
                return {
                    description: weather.current.condition.text,
                    temperature: weather.current.temp_c
                };
            } catch (error) {
                displayError(`Error fetching weather for ${city}: ${error.message}`);
                return null;
            }
        }

        
        async function displayCities(cities) {
            cityList.innerHTML = '';
            weatherInfo.innerHTML = '';
            if (!cities.length) {
                cityList.innerHTML = '<p>No cities found.</p>';
                return;
            }

            for (const { name: city, lat, lon } of cities) {
                const cityDiv = document.createElement('div');
                cityDiv.className = 'city-item';
                cityDiv.innerHTML = `<h4>${city}</h4>`;

             
                const attractions = await getAttractions(city, lat, lon);
                const attractionsList = document.createElement('ul');
                if (attractions.length) {
                    attractions.forEach(attraction => {
                        const li = document.createElement('li');
                        li.innerHTML = attraction.name;
                        if (attraction.image) {
                            li.innerHTML += `<br><img src="${attraction.image}" alt="${attraction.name}" class="attraction-img">`;
                        }
                        attractionsList.appendChild(li);
                    });
                } else {
                    attractionsList.innerHTML = '<li>No attractions found.</li>';
                }
                cityDiv.appendChild(attractionsList);

              
                const weather = await fetchWeather(city);
                const weatherP = document.createElement('p');
                if (weather) {
                    weatherP.innerHTML = `Weather: ${weather.temperature}°C, ${weather.description}`;
                } else {
                    weatherP.textContent = 'Weather data unavailable.';
                }
                cityDiv.appendChild(weatherP);

             
                const addButton = document.createElement('button');
                addButton.textContent = 'Add to Trip';
                addButton.className = 'add-button';
                addButton.onclick = () => addToItinerary(city, attractions, weather);
                cityDiv.appendChild(addButton);

                cityList.appendChild(cityDiv);
            }
        }

       
        function addToItinerary(city, attractions, weather) {
            itinerary.push({ city, attractions, weather });
            localStorage.setItem('itinerary', JSON.stringify(itinerary));
            updateItinerary();
            displayError(`${city} added to itinerary!`);
        }

        
        function updateItinerary() {
            itineraryList.innerHTML = '';
            if (!itinerary.length) {
                itineraryList.innerHTML = '<li>Itinerary is empty.</li>';
                return;
            }
            itinerary.forEach((item, index) => {
                const li = document.createElement('li');
                let attractionsHtml = item.attractions.length
                    ? item.attractions.map(a => `
                        ${a.name}${a.image ? `<br><img src="${a.image}" alt="${a.name}" class="attraction-img">` : ''}
                    `).join('')
                    : 'None';
                li.innerHTML = `
                    <strong>${item.city}</strong><br>
                    Attractions: ${attractionsHtml}<br>
                    Weather: ${item.weather ? `${item.weather.temperature}°C, ${item.weather.description}` : 'N/A'}
                    <br><button class="add-button" onclick="removeFromItinerary(${index})">Remove</button>
                `;
                itineraryList.appendChild(li);
            });
        }

   
        function removeFromItinerary(index) {
            itinerary.splice(index, 1);
            localStorage.setItem('itinerary', JSON.stringify(itinerary));
            updateItinerary();
            displayError('Item removed from itinerary!');
        }

   
        countrySelect.addEventListener('change', async () => {
            const selectedCountry = countrySelect.value;
            clearError();
            weatherInfo.innerHTML = '';
            if (selectedCountry) {
                const cities = await fetchCities(selectedCountry);
                await displayCities(cities);
            } else {
                cityList.innerHTML = '';
            }
        });

       
        fetchCountries();
        updateItinerary();