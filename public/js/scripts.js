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


function postViaWorker(data){
  return new Promise((resolve,reject) => {
    let worker = new Worker('../js/worker.js')    
    worker.postMessage(data)
    worker.onmessage = (event) => {
      resolve(event.data)
    }
  })
}

$(document).ready(async function(){

  const errors = new URLSearchParams(document.location.search)
  if(!errors.entries().next().done){
    $('#errors').removeClass("d-none")
    errors.forEach((v,k)=>{
      $('#errors').append('<p class="mb-0">'+k+" - "+v+"</p>")
    })
  }

  
  async function genSearchResults(){
    let data  = await fetch('../js/output_data.json').then( response => {
      return response.json()
    })
    
    await charts(data.tweets_by_type,"tweets-by-type")
    
    $('#results #name').text(data.name)

    let ancor = document.createElement('a')
    ancor.href = buildTwitterUrl(data.username)
    ancor.id = "username-link"
    ancor.title = "Twitter link"
    ancor.innerText = "@"+data.username
    ancor.target = '_blank'
    $('#results #username').append(ancor)

    let img = new Image()
    img.src = data.user_img
    img.crossOrigin = "anonymouse"
    img.height = "48"
    $('#results #user-info #user-profile').prepend(img)
    
    $('#total-tweets-data')
    .attr({"data-real":data.total_tweets, "data-round":tweetCount(data.total_tweets)})
    .text(tweetCount(data.total_tweets))
    $('#followers-data')
    .attr({"data-real":data.followers, "data-round":tweetCount(data.followers)})
    .text(tweetCount(data.followers))
    $('#followings-data')
    .attr({"data-real":data.followings, "data-round":tweetCount(data.followings)})
    .text(tweetCount(data.followings))
    
    $("#search-date .date").text((data.date).slice(0,10))
    $("#search-date .time").text((data.date).slice(11,19))
    $("#interval-start-date .date").text((data.start_date).slice(0,10))
    $("#interval-start-date .time").text((data.start_date).slice(11,19))
    $("#interval-end-date .date").text((data.end_date).slice(0,10))
    $("#interval-end-date .time").text((data.end_date).slice(11,19))
    $("#sample span").text(data.metrics.total.count)
    
    $(".data-hover").mouseover(function(){
      $("span",this).text($("span",this).attr("data-real"))
    })

    $('.data-hover').mouseleave(function(){      
      $("span",this).text($("span",this).attr("data-round"))      
    })
  }
  
  await genSearchResults()

  function tweetCount(count){
    if (count / 1000000 >= 1)
      return (count / 1000000).toFixed(2) + "M"
    
    if(count / 1000 >= 1)
      return (count / 1000).toFixed(1) + "K"
    
    return count
  }

  // $('#search-btn').click(async (event)=>{
  //   event.preventDefault()
  //   $('#results').empty()
  //   $('#loader').removeClass('d-none')
  //   $('#search-btn').prop("disabled",true)

    // let data = await postViaWorker($('#form-search').serialize())
    //console.log(data[0]);

    // let data  = await fetch('../js/output_data.json').then( response => {
    //   return response.json()
    // })
    
    
  //   $('#loader').addClass('d-none')
  //   $('#results').show()
  //   $('#search-btn').removeAttr("disabled")
  // })

  async function charts(input,id){

    let canvas = document.createElement("canvas")
    canvas.id = "chart"
    document.getElementById(id).appendChild(canvas)

    new Chart(document.getElementById('chart'),{
      type:'doughnut',
      data:{
        labels:Object.keys(input),
        datasets:[{
          label:"Tweets by Type",
          data:Object.values(input),
          
          backgroundColor:['#ffbe0b','#fb5607','#ff006e','#8338ec','#3a86ff','#9e0059'],
          hoverOffset: 4
        }],
      }
    })
  }
  
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
    
    let most_retweets = $('<li>The post with most <a href="'+buildTwitterPostUrlPost(data.username,data.highlights.retweet_count.id)+'">retweets</a> '+data.highlights.retweet_count.count+'</li>')
    let most_replies = $('<li>The post with most <a href="'+buildTwitterPostUrl(data.username,data.highlights.reply_count.id)+'">replies</a> '+data.highlights.reply_count.count+'</li>')
    let most_likes = $('<li>The post with most <a href="'+buildTwitterPostUrl(data.username,data.highlights.like_count.id)+'">likes</a> '+data.highlights.like_count.count+'</li>')
    let most_quotes = $('<li>The post with most <a href="'+buildTwitterPostUrl(data.username,data.highlights.quote_count.id)+'">quotes</a> '+data.highlights.quote_count.count+'</li>')
    let most_impressions = $('<li>The post with most <a href="'+buildTwitterPostUrl(data.username,data.highlights.impression_count.id)+'">impressions</a> '+data.highlights.impression_count.count+'</li>')
    
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
  
  function buildTwitterUrl(user){
    return "https://twitter.com/"+user
  }
  function buildTwitterPostUrl(user,id){
    return buildTwitterUrl(user)+"/status/"+id
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
      
      // $.post("/twitter",$('#form-search').serialize(),(data,status,xhr)=>{      
      //   if(xhr.status == 200){
      //     let json_data = JSON.parse(data)
      //     build(json_data[0])
      //     $('#loader').addClass('d-none')
      //     $('#results').show()
      //     $('#search-btn').removeAttr("disabled")
      //   }else{
      //     console.log('twitter error '+xhr.status)
      //   }
        
      // })