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

  function retrieve(){
    if (typeof(Worker) !== "undefined") {
      
      let worker = new Worker('worker.js')
      worker.onmessage = (event) => {        
        $('#results').append(event.data)
      }
    } else {
      $('#results').append("No Web Worker support...")
    }
  }

  $('#search-btn').click((event)=>{
    event.preventDefault()
    $('#results').empty()
    $('#loader').css('display','flex')
    $('#search-btn').prop("disabled",true)
    $.post("/twitter",$('#form-search').serialize(),(data,status,xhr)=>{      
      if(xhr.status == 200){
        let json_data = JSON.parse(data)
        build(json_data)
        $('#loader').hide()
        $('#results').show()
        $('#search-btn').removeAttr("disabled")
      }else{
        console.log('twitter error '+xhr.status)
      }
      
    })
  })

  function build(data){
    
    let name = $('<h5 id="name">'+data.name+'</h5>')    
    
    let img = new Image()
    img.crossOrigin = "anonymouse"
    img.src = data.user_img

    let username = $('<p>@'+data.username+'</p>')
    let date_interval = $('<p> Tweets from: '+data.start_date+' to '+data.end_date+'</p>')
    
    let date = $('<p>Search results of: '+data.date+'</p>')
    let followers = $('<p>Followers: '+data.followers+'</p>')
    let followings = $('<p>Followings: '+data.followings+'</p>')
    let total_tweets = $('<p>Total Tweets: '+data.total_tweets+'</p>')
    let ul = $('<ul id="tweets_by_type">Tweets by type</ul>')
    let text = $('<li>Text: '+data.tweets_by_type.text+'</li>')
    let polls = $('<li>Polls: '+data.tweets_by_type.polls+'</li>')
    let link = $('<li>Link: '+data.tweets_by_type.link+'</li>')
    let photo = $('<li>Photo: '+data.tweets_by_type.photo+'</li>')
    let video = $('<li>Video: '+data.tweets_by_type.video+'</li>')
    let gifs = $('<li>Gif: '+data.tweets_by_type.animated_gifs+'</li>')

    ul.append(text).append(polls).append(link).append(photo).append(video).append(gifs)

    let hl = $('<ul id="highlights">Highlights</ul>')

    let most_retweets = $('<li>The post with most <a href="'+buildTwitterUrl(data.username,data.highlights.retweet_count.id)+'">retweets</a> '+data.highlights.retweet_count.count+'</li>')
    let most_replies = $('<li>The post with most <a href="'+buildTwitterUrl(data.username,data.highlights.reply_count.id)+'">replies</a> '+data.highlights.reply_count.count+'</li>')
    let most_likes = $('<li>The post with most <a href="'+buildTwitterUrl(data.username,data.highlights.like_count.id)+'">likes</a> '+data.highlights.like_count.count+'</li>')
    let most_quotes = $('<li>The post with most <a href="'+buildTwitterUrl(data.username,data.highlights.quote_count.id)+'">quotes</a> '+data.highlights.quote_count.count+'</li>')
    let most_impressions = $('<li>The post with most <a href="'+buildTwitterUrl(data.username,data.highlights.impression_count.id)+'">impressions</a> '+data.highlights.impression_count.count+'</li>')
    
    hl.append(most_retweets).append(most_replies).append(most_likes).append(most_quotes).append(most_impressions)
    
    $('#results')
    .append(date)
    .append(name)
    .append(username)
    .append(img)
    .append(date_interval)
    .append(followers).append(followings)
    .append(total_tweets).append(ul).append(hl)

  }

  function buildTwitterUrl(user,id){
    return "https://twitter.com/"+user+"/status/"+id
  }

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
