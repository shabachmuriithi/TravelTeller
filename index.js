const header =document.getElementById('header')
header.style.display = "flex";
header.style.justifyContent = "space-between";
header.style.backgroundColor= "#001f3f";
header.style.color = "white";
header.style.textShadow = "4px 2px 4px red"

const headerTitle = document.createElement('h2');
headerTitle.textContent = "Enjoy your trip";
header.appendChild(headerTitle);    

const intro = document.getElementById('intro')
const introGreeting = document.createElement('h3');
introGreeting.textContent = "Welcome to your virtual trip planner";
intro.appendChild(introGreeting);
const introLine = document.createElement('p')
introLine.textContent = "Experience the world from the comfort of your home "
intro.appendChild(introLine);


intro.style.backgroundColor= "#001f3f"
intro.style.color= "#ffff"
intro.style.textAlign= "center"
intro.style.margin = "10px"
intro.style.height = "100px"


const imgContainer = document.createElement('div');
imgContainer.style.display = 'flex';
// imgContainer.style.flexWrap = 'wrap';
imgContainer.style.gap = '12px';
imgContainer.style.justifyContent = 'center';


const images = [
  'https://media.cntraveller.com/photos/64e31fff3c56448b259aacdb/1:1/w_2644,h_2644,c_limit/santoriniGettyImages-528893342.jpeg',
  'https://planetrail.co.uk/wp-content/uploads/Eiffel-Tower-Paris-resized.jpg',
  'https://s3.amazonaws.com/cdn.micato.com/wp-content/uploads/2018/09/07232001/cape-town-1-2-1110x700.jpg',
  'https://media.istockphoto.com/id/515161366/photo/sunrise-behind-mt-kenya.jpg?s=612x612&w=0&k=20&c=HholJet9EY-s9c4Fst7iF8TetXVvuUNHoUp5DnHZV_M='
];


images.forEach(src => {
  const img = document.createElement('img');
  img.src = src;
  img.alt = 'cities';
  img.style.width = '300px';
  img.style.height = '200px';
  img.style.objectFit = 'fit';
  imgContainer.appendChild(img);
});


document.body.appendChild(imgContainer);
