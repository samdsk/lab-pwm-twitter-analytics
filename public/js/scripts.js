// ! boostrap form validation check script

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

// ! chartsjs plugins
Chart.register(ChartDataLabels)

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

  // ! error display function
  function errorDisplay(){
    const errors = new URLSearchParams(document.location.search)
    if(!errors.entries().next().done){
      $('#errors').removeClass("d-none")
      errors.forEach((v,k)=>{
        $('#errors').append('<p class="mb-0">'+k+" - "+v+"</p>")
      })
    }
  }

  errorDisplay() 

  // ! populate with seach results + charts
  async function genSearchResults(){

    // ! testing from file
    let data  = await fetch('../js/output_data.json').then( response => {
      return response.json()
    })
    
    
    $('#results #name').append(data.name)
    
    let ancor = document.createElement('a')
    ancor.href = buildTwitterUrl(data.username)
    ancor.id = "username-link"
    ancor.title = "Twitter link"
    ancor.innerText = "@"+data.username
    ancor.target = '_blank'
    $('#results #username').append(ancor)
    
    let img = new Image()
    img.crossOrigin = "anonymouse"
    img.src = data.user_img
    img.height = "48"
    $('#results #user-info #user-profile').prepend(img)
    
    $('#total-tweets-data')
    .attr({"data-real":data.total_tweets, "data-round":tweetCount(data.total_tweets)})
    .text(tweetCount(data.total_tweets))
    $('#followers')
    .attr({"data-real":data.followers, "data-round":tweetCount(data.followers)})
    .text(tweetCount(data.followers))
    $('#followings')
    .attr({"data-real":data.followings, "data-round":tweetCount(data.followings)})
    .text(tweetCount(data.followings))
    
    $("#search-date .date").text((data.date).slice(0,10))
    $("#search-date .time").append((data.date).slice(11,19))
    $("#interval-start-date").text((data.start_date).slice(0,10))
    $("#interval-start-time").append((data.start_date).slice(11,19))
    $("#interval-end-date").text((data.end_date).slice(0,10))

    $("#interval-end-time").append((data.end_date).slice(11,19))
    $("#sample span").text(data.metrics.total.count)
    

   
    // ! highlights
    for(let type of Object.keys(data.highlights)){
      $('#most-'+type+" a").attr({
        "href":buildTwitterPostUrl(data.username,data.highlights[type].id)
      }).text(data.highlights[type].count)
    }
    
    
    for(let type of Object.keys(data.metrics)){
      if(type == "total") continue
      // $('#'+type+' #count').text(data.metrics[type].count)
      // let avg = msToHMS(data.metrics[type].interval/data.metrics[type].count)
      // $('#'+type+' #interval').text(avg)
      
      if(type == "retweeted") continue
      
      for(let key of Object.keys(data.metrics[type].metrics)){
        let li = $('<a onclick="return false;" class="list-group-item"></a>')

        let name = key.charAt(0).toUpperCase()+key.slice(1,-6)
        let count = Math.floor(data.metrics[type].metrics[key]/data.metrics[type].count)

        if(key == 'reply_count')
          li.text('Replies : ')
        else 
          li.text(name+"s : ")

        let span = $('<span class="data-hover" data-real>'+tweetCount(count)+'</span></a>')
        span.attr({"data-real":count, "data-round":tweetCount(count)})

        li.append(span)

        $('#'+type+' ul#average').append(li)
      }
    }
    //input,labels,id,type
    await charts(data.tweets_by_type,["Text","Video","Photo","Link","Poll","Gif"],"tweets-by-media-type")
    await charts(fromMetricsToDataset(data.metrics,'total'),["Retweets","Replies","Likes","Quotes"],"tweets-by-type")
    await metricCharts(data.metrics,'metric-charts','retweets')


    $(".data-hover").mouseover(function(){
      $(this).text($(this).attr("data-real"))
    })
    
    $('.data-hover').mouseleave(function(){      
      $(this).text($(this).attr("data-round"))      
    })

    $('#search-interval').mouseover(()=>{
      $('#search-interval .time').show()
    })
    $('#search-interval').mouseleave(()=>{
     $('#search-interval .time').hide()
    })
  }

  await genSearchResults()

  // custom data structure for chartsjs
  function fromMetricsToDataset(data,skip){
    let output = {}
    for(let x of Object.keys(data)){
      if(x == skip) continue
      output[x] = data[x].count
    }

    return output
  }

  function fromMetricsToDatasets(data){
    
    let colors = ['#FFBE0B','#FB5607','#FF006E','#8338EC','#3A86FF']
    let output = []
    let count = 0

    for(let x of Object.keys(data)){
      let struct = {}
      struct["data"] = normalize(data[x])
      struct["label"] = x
      struct["backgroundColor"] = colors[count++]      
      struct['fill'] = false
      struct['tension'] = 0.1
      output.push(struct)
    }

    return output
  }

  function normalize(data){    
    let output = []
    let max = Math.max(...data)
    for(let i=0;i<data.length;i++){
      output.push(data[i]/max)
    }

    return output
  }

  function msToHMS(e) {
    let s = e/1000;
    let m = s/60;
    s = s%60;
    let h = m/60;
    m = m%60;
    return Math.floor(h)+":"+Math.floor(m)+":"+Math.floor(s)
  }

  function tweetCount(count){
    if (count / 1000000 >= 1)
      return (count / 1000000).toFixed(2) + "M"
    
    if(count / 1000 >= 1)
      return (count / 1000).toFixed(1) + "K"
    
    return count
  }

   // draw pie charts
   async function charts(input,labels,id){
    
    let canvas = document.createElement("canvas")
    canvas.id = id+"chart"
    document.getElementById(id).appendChild(canvas)

    new Chart(document.getElementById(canvas.id),{
      type:'pie',
      data:{
        labels:labels,
        datasets:[{
          label:id,
          data:Object.values(input),
          backgroundColor:['#FF595E','#FFCA3A','#8AC926','#1982C4','#00B4D8','#6A4C93'],
          hoverOffset: 4
        }],
      },
      options : {
        responsive:true,
        plugins:{
          legend:{
            position:"bottom"
          },
          datalabels:{
            color:'white',
            formatter: (value,context)=>{
              let total = context.dataset.data.reduce((acc,v)=> acc+v,0)
              
              let perc = Math.floor(value/total *100)
              return perc>2 ? perc+"%":''
            }
          }
        }
      }
    })
  } 

  async function metricCharts(data,id,type){
    let canvas = document.createElement("canvas")
    canvas.id = type+"-chart"
    
    document.getElementById(id).appendChild(canvas)
    let labels = [...Array(data.total.metrics.retweet_count.length).keys()]
    
    const datasets = fromMetricsToDatasets(data.total.metrics)    

    new Chart(document.getElementById(canvas.id),{
    type:'bar',
    data:{
      labels :  labels,
      datasets:datasets,
    },
    options: {
      responsive:true,      
      plugins: {
        title:{
          display:true,
          text:"metric stacked charts"
        },          
         legend: {
            display: true
         },
         datalabels:{display:false},
      },
      scales: {
        x: {
          display:false,
          stacked:true
        },
        y: {
          display: false,
          stacked:true
        },
      }
    },
    
  })

  }

  function buildTwitterUrl(user){
    return "https://twitter.com/"+user
  }
  function buildTwitterPostUrl(user,id){
    return buildTwitterUrl(user)+"/status/"+id
  }
  // new Chart(document.getElementById(canvas.id),{
  //   type:'line',
  //   data:{
  //     labels :  labels,
  //     datasets:datasets,
  //   },
  //   options: {
  //     normalized:true,
  //     parsing:true,
  //     plugins: {
  //       legend: {
  //           display: false
  //       },
  //       datalabels:{display:false},
  //       },
  //     scales: {
  //       x: {display: true},
  //       y: {display: true},
  //   }
  //   }
  // })

  // async function metricCharts(data,id,type,color){
  //   let canvas = document.createElement("canvas")
  //   canvas.id = type+"-chart"
  //   document.getElementById(id).appendChild(canvas)
  //   let labels = [...Array(data.length).keys()]
   
  //   new Chart(document.getElementById(canvas.id),{
  //     type:'line',
  //     data:{
  //       labels :  labels,
  //       datasets: [{
  //         label: type,
  //         data: data,
  //         fill: false,
  //         borderColor: color,
  //         tension: 0.5                   
  //       }],
  //     },
  //     options: {
  //       plugins: {
  //          legend: {
  //             display: false
  //          },
  //          datalabels:{display:false},
  //         },
  //       scales: {
  //         x: {display: false},
  //         y: {display: false},
  //     }
  //     }
  //   })
  // }

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