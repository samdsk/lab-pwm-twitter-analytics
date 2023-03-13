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
  
  $('#search-btn').click(async (event)=>{
    event.preventDefault()
    $('#results').hide()
    $('#loader').removeClass('d-none')
    $('#search-btn').prop("disabled",true)

    // let data = await postViaWorker($('#form-search').serialize())
    
    let data  = await fetch('../js/output_data_compare.json').then( response => {
        return response.json()
    })
      
    await genSearchResults(data)
    
    $('#loader').addClass('d-none')
    $('#results').removeClass("d-none")
    $('#results').show()
    $('#search-btn').removeAttr("disabled")
  })  


  // ! populate with seach results + charts
  async function genSearchResults(data){
    console.log(data.length);
    if(data.length==2 && data[1] != null){
      if(data[0].username == data[1].username){
        console.log("Ok: comparing mode");
        gen(data,data.length)
      }else{
        console.log("Error: comparing different users");
      }
    }else{
      gen(data,1)
    }
  }
  
  async function gen(INPUT,LENGTH){

    let data = INPUT[0]
    let compare = undefined
    if(LENGTH==2) compare = INPUT[1]
    
    const load_user_datails = async () => {
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
    
      $('#results #user-info #user-profile').prepend(img)

      let count = data.total_tweets
      let count_rounded = tweetCount(count)
      
      $('#total-tweets-data')
      .attr({"data-real":count, "data-round":count_rounded})
      .text(count_rounded)

      if(compare)
        appendCompare("#total-tweets-data",count,compare.total_tweets)
    }

    const load_followers = async () => {
      let count = data.followers
      let count_rounded = tweetCount(count)

      $('#followers')
      .attr({"data-real":count, "data-round":count_rounded})
      .text(count_rounded)

      if(compare)
        appendCompare("#followers",count,compare.followers)
    }

    const load_followings = async () => {
      let count = data.followings
      let count_rounded = tweetCount(count)

      $('#followings')
      .attr({"data-real":count, "data-round":count_rounded})
      .text(count_rounded)

      if(compare)
        appendCompare("#followings",count,compare.followings)
    }
    
    const load_sample_internal_new = async () => {   
      $("#search-sample-new #search-date .date").text((data.date).slice(0,10))
      $("#search-sample-new #search-date .time").append((data.date).slice(11,19))
      $("#search-sample-new #interval-start-date").text((data.start_date).slice(0,10))
      $("#search-sample-new #interval-start-time").append((data.start_date).slice(11,19))
      $("#search-sample-new #interval-end-date").text((data.end_date).slice(0,10))

      $("#search-sample-new #interval-end-time").append((data.end_date).slice(11,19))
      $("#search-sample-new #sample span").text(data.total.count)
    }
    
    const load_sample_interval_old = async () => {
      if(compare){
        $("#search-sample-old #search-date .date").text((compare.date).slice(0,10))
        $("#search-sample-old #search-date .time").append((compare.date).slice(11,19))
        $("#search-sample-old #interval-start-date").text((compare.start_date).slice(0,10))
        $("#search-sample-old #interval-start-time").append((compare.start_date).slice(11,19))
        $("#search-sample-old #interval-end-date").text((compare.end_date).slice(0,10))
  
        $("#search-sample-old #interval-end-time").append((compare.end_date).slice(11,19))
        $("#search-sample-old #sample span").text(compare.total.count)
      }
    }

    const load_highlights = async () => {
      for(let type of Object.keys(data.highlights)){
        let id = '#most-'+type
        let round = tweetCount(data.highlights[type].count)
        $(id).attr({
          "data-real":data.highlights[type].count,
          "data-round":round,
          "href":buildTwitterPostUrl(data.username,data.highlights[type].id)
        }).text(round)

        if(compare){
          appendCompare(id,data.highlights[type].count,compare.highlights[type].count)

          $(id+"-compare").attr({
            "href":buildTwitterPostUrl(compare.username,compare.highlights[type].id)
          })
          } 

        }
    }   
    
    const load_tweets_by_media_type_data = async () => {
      for(let type of Object.keys(data.media_type)){

        let count = data.media_type[type].count
        let count_rounded = tweetCount(count)
        let id = "tweets-by-media-type-data-"+type
        let span = $('<span class="data-hover"></span>')
        span.attr({"id":id,"data-real":count, "data-round":count_rounded})
        span.text(count_rounded)

        let span_compare = $('<span id="'+id+'-compare" class="data-hover"></span>')

        let li = $('<li class="list-group-item">'+toUpperFirstChar(cleanText(type))+': </li>').append(span).append(span_compare)
        $('#tweets-by-media-type-data ul').append(li)

        if(compare)
         appendCompare('#'+id,count,compare.media_type[type].count)
      }
    }

    const load_avg_metrics_table = async () => {
      for(let type of Object.keys(data.media_type)){       

        let span = $('<span id="media-type-avg-data-'+type+'" class="data-hover"></span>').text(tweetCount(data[type].count))
        let span_compare = $('<span id="media-type-avg-data-'+type+'-compare" class="data-hover"></span>')
        span.attr({"data-real":data[type].count, "data-round":tweetCount(data[type].count)})
        let li = $('<li class="list-group-item">'+type+': </li>').append(span).append(span_compare)
        $('#avg-interactions #'+type+' ul#average').append(li)
        if(compare)
          appendCompare('#media-type-avg-data-'+type,data[type].count,compare[type].count)        
        
        for(let key of Object.keys(data[type].metrics)){
          let li = $('<a onclick="return false;" class="list-group-item"></a>')

          let name = key.charAt(0).toUpperCase()+key.slice(1,-6)
          let avg_count = Math.floor(data[type].metrics[key]/data[type].count)
          let avg_count_compare = Math.floor(compare[type].metrics[key]/compare[type].count)

          if(key == 'reply_count')
            li.text('Replies : ')
          else 
            li.text(name+"s : ")

          let id = type+'-'+key
          
          let span = $('<span id="'+id+'"class="data-hover">'+tweetCount(avg_count)+'</span>')
          let compare_span = $('<span id="'+id+'-compare" class="data-hover"></span>')
          span.attr({"data-real":avg_count, "data-round":tweetCount(avg_count)})

          li.append(span).append(compare_span)        
          $('#'+type+' ul#average').append(li)
          if(compare)
            appendCompare('#'+id,avg_count,avg_count_compare)
        }
      }
    }

    await load_user_datails()
    await load_followers()
    await load_followings()
    await load_sample_internal_new()

    if(compare==null){      
      $("#search-sample-old").remove()
    }else{      
      await load_sample_interval_old()
    }

    await load_highlights()    
    await load_tweets_by_media_type_data()
    //await load_avg_metrics_table()
    //input,labels,id,type
    // await charts([data.tweets_by_media_type,compare.tweets_by_media_type],["Text","Video","Photo","Link","Poll","Gif"],"tweets-by-media-type")
    // await charts([fromMetricsToDataset(data.metrics,'total'),fromMetricsToDataset(compare.metrics,'total')],["Retweets","Replies","Quotes","Originals"],"tweets-by-type")
    // await metricCharts(data.metrics,'metric-charts','retweets')

    set_data_hover()

  }

  // await genSearchResults()

  function set_data_hover(){   
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

  function appendCompare(id,new_data,old_data){
    if(old_data == null || old_data == undefined) return
    
    if(old_data == new_data) return

    let up = ["bi-caret-up-fill","text-success"]
    let down = ["bi-caret-down-fill","text-danger"]

    console.log(new_data,old_data);
    
    let diff = new_data - old_data
    let rounded_data = tweetCount(diff)

    let icon = $('<i class="bi ms-1 me-1"></i>')
    
    if(new_data>old_data){
      icon.addClass(up)
    }else{
      icon.addClass(down)
    }

    $(id).after(icon)

    id = id+"-compare"
    $(id).attr({"data-real":diff, "data-round":rounded_data})
    $(id).append(rounded_data)
  }

  function toUpperFirstChar(str){
    return str.charAt(0).toUpperCase()+str.slice(1)
  }

  function cleanText(str){
    let regex = /[^A-Za-z0-9]/g    
    return str.replace(regex," ")
  }

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
    if (count / 1000000 >= 1 || count / 1000000 <= -1)
      return (count / 1000000).toFixed(2) + "M"
    
    if(count / 1000 >= 1 || count / 1000 <= -1)
      return (count / 1000).toFixed(1) + "K"
    
    return count
  }

  // draw pie charts
  async function charts(input,labels,id){
    
    let canvas = document.createElement("canvas")
    canvas.id = id+"-chart"
    document.getElementById(id).appendChild(canvas)

    new Chart(document.getElementById(canvas.id),{
      type:'pie',
      data:{
        labels:labels,
        datasets:[{
          label:cleanText(id)+" new",
          data:Object.values(input[0]),
          backgroundColor:['#FF595E','#FFCA3A','#8AC926','#1982C4','#00B4D8','#6A4C93'],
          hoverOffset: 4
        },{
          label:cleanText(id)+" old",
          data:Object.values(input[1]),
          backgroundColor:['#FF595E','#FFCA3A','#8AC926','#1982C4','#00B4D8','#6A4C93'],
          hoverOffset: 4
        }],
      },
      options : {
        responsive:true,
        aspectRatio: 1,
        maintainAspectRatio:false,
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
      maintainAspectRatio:false,
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

})

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