$('document').ready(function (){
    $("#search-btn").click(function(){        
        $("#search-form").toggle()
    });

    $("#dark-btn").click(function(){
        $(this).hide();
        $("#ligth-btn").show()
    });

    $("#ligth-btn").click(function(){
        $(this).hide();
        $("#dark-btn").show()
    });
});