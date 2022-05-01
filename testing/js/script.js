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