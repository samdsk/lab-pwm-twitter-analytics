//TODO -
(function () {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
      .forEach(function (form) {
        form.addEventListener('submit', function (event) {
          if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
          }
  
          form.classList.add('was-validated')
        }, false)
      })
  })()

$(document).ready(function(){

  const errors = new URLSearchParams(document.location.search)
  if(!errors.entries().next().done){
    $('#errors').removeClass("d-none")
    errors.forEach((v,k)=>{
      $('#errors').append('<p class="mb-0">'+k+" - "+v+"</p>")
    })
  }

  $('#profile').click((event)=>{
    event.preventDefault()
    $.get("/profile",(data)=>{
      console.log(data)
    })
  })

})

  // $('.dashboard').click((event)=>{
  //   event.preventDefault()
  //   //if(localStorage.getItem('token')==null) return 
  //   $.ajax({
  //     url:'/dashboard',
  //     headers:{'Authorization':'Bear '+localStorage.getItem('token') },
  //     success: (data)=>{
  //       window.location.href = "/dashboard";
  //     }
  //   })
  // })

  // $('#login').click((event)=>{
  //   event.preventDefault()
  //   $.post("/login",$('#sign-in').serialize(),(data,status,xhr)=>{      
  //     if(xhr.status == 200){
  //       window.location.href = '/dashboard'
  //     }
  //     console.log('no token received')
  //   })
  // })
