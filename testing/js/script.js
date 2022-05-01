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
});

getW();

async function getW(){
    let apikey = "860343fcf564f99b3fb00f9536403ad7";
    //let query = "https://api.openweathermap.org/data/2.5/weather?lat=35&lon=139&appid=";
    let query = "https://api.openweathermap.org/data/2.5/weather?q=Milan,ITA&units=metric&appid=";
    var reply = await
        fetch(query+apikey,{method:"GET"});
    var jsonObj = await reply.json();
    console.log(jsonObj);
}