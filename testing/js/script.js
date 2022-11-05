$('document').ready(function (){
    $("#search-btn").click(function(){
        $("#search-form").toggle()
    });

    $("#dark-btn").click(function(){
        $(this).hide();
        $("#ligth-btn").show()
        $("body").attr("data-theme","dark")
    });

    $("#ligth-btn").click(function(){
        $(this).hide();
        $("#dark-btn").show()
        $("body").attr("data-theme","light")
    });

    $("#menu-btn").click(() =>{
        $("#navigation").toggle()
    })

    //weather()
    
});


let city_tags = document.getElementById("weather-carousel").getElementsByClassName("city-name")
let cities = [];
Array.from(city_tags).forEach(e => {
    cities.push(e.innerHTML)
});

//console.log(cities);

//getW(cities);

function getW(cities){
    let apikey = "860343fcf564f99b3fb00f9536403ad7";
    //let query = "https://api.openweathermap.org/data/2.5/weather?lat=35&lon=139&appid=";
    cities.forEach(async function(city){
        let query = "https://api.openweathermap.org/data/2.5/weather?q="+city+",ITA&units=metric&appid=";
        var reply = await
         fetch(query+apikey,{method:"GET"});
        var jsonObj = await reply.json();
        console.log(jsonObj)
        
        var temp = document.getElementById("weather-carousel").getElementsByClassName("weather-data")
        //console.log(temp)
        for (let iterator of temp) {
            
            if(iterator.getElementsByTagName("h3")[0].innerText==city){
                var temp_node = document.createElement("li").appendChild(document.createTextNode(jsonObj.main.temp))
                
                iterator.getElementsByTagName("ul")[0].append(temp_node)
            }
                
        }

        
    });
    
}

function weather(){
    let node = $('#weather-carousel .weather-data');
    let cities = [];
    let apikey = "860343fcf564f99b3fb00f9536403ad7";
    node.each(function(i,e){
        let city = $(e).find(".city-name").html();
        console.log(e)
        let query = "https://api.openweathermap.org/data/2.5/weather?q="+city+",ITA&units=metric&appid=";
        $.get(query+apikey,function(data){
            //console.log($(e).find(".weather-data-ul"))

            
            $(e).find(".weather-data-ul").append(
                '<li>'
                +data.main.temp+
                '°</li><li><img src="http://openweathermap.org/img/wn/'+data.weather[0].icon+'@2x.png"/></li>'
            )
        })

    });
}
geo()
function geo(){
    document.addEventListener('DOMContentLoaded',() =>{
        navigator.geolocation.getCurrentPosition(pos => {
            const {latitude,longitude} = pos.coords;

            console.log(latitude,longitude)
        })
    })
}
