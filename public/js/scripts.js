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

const sleep = ms => new Promise(r => setTimeout(r,ms))

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
    
    if($('#handler').val() == '') return 

    $('#results').addClass('d-none')
    $('#loader').removeClass('d-none')
    $('#loader #loader-gif').removeClass('d-none')
    $('#search-btn').prop("disabled",true)

    // let data = await postViaWorker($('#form-search').serialize())
    //await sleep(1000)
    $('#loader #loader-gif').addClass('d-none')
    // await sleep(1000)
    $('#loader #working-gif').removeClass('d-none')
    
    let data  = await fetch('../js/output_data_compare.json').then( response => {
        return response.json()
    })
    //await sleep(1000)
    await genSearchResults(data)

    $('#loader #working-gif').addClass('d-none')
    $('#loader').addClass('d-none')

    $('#results').removeClass("d-none")
    $('#results').show()
    $('#search-btn').removeAttr("disabled")
  })  

  // let data  = await fetch('../js/output_data.json').then( response => {
  //   return response.json()
  // })
  
  // await genSearchResults(data)

  function cleanResults(){
    $('#results #user-info #user-profile img').remove()
    $('.data-clean').each((i,obj) => $(obj).empty())
    $('.node-clean').each((i,obj) => $(obj).remove())

  }
  // ! populate with seach results + charts
  async function genSearchResults(data){
    cleanResults()

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
      $('#results #name').text(data.name)
    
      let ancor = document.createElement('a')
      ancor.href = buildTwitterUrl(data.username)
      ancor.id = "username-link"
      ancor.title = "Twitter link"
      ancor.innerText = "@"+data.username
      ancor.target = '_blank'
      $('#results #username').empty().append(ancor)
      
      let img = new Image()
      img.crossOrigin = "anonymouse"
      img.src = data.user_img
      img.width = "73"
      img.height = "73"
      
      $('#results #user-info #user-profile').prepend(img)

      let count = data.total_tweets
      let count_rounded = tweetCount(count)
      
      $('#total-tweets-data')
      .attr({"data-real":count, "data-round":count_rounded,"title":"Total tweets"})
      .text(count_rounded)

      if(compare)
        appendCompare("#total-tweets-data",count,compare.total_tweets)
    }

    const load_followers = async () => {
      let count = data.followers
      let count_rounded = tweetCount(count)

      $('#followers')
      .attr({"data-real":count, "data-round":count_rounded,"title":"Total followers"})
      .text(count_rounded)

      if(compare)
        appendCompare("#followers",count,compare.followers)
    }

    const load_followings = async () => {
      let count = data.followings
      let count_rounded = tweetCount(count)

      $('#followings')
      .attr({"data-real":count, "data-round":count_rounded,"title":"Total followings"})
      .text(count_rounded)

      if(compare)
        appendCompare("#followings",count,compare.followings)
    }

    const load_sample_internal_new = async () =>{
      let id = "#search-sample-new"
      load_dateTime(id,data)
    }
    
    const load_sample_interval_old = async () => {
      if(compare == null || compare == undefined){      
        $("#search-sample-old").remove()
        return
      }

      if(compare){
        let id = "#search-sample-old"
        load_dateTime(id,compare)
      }
    }

    const load_highlights = async () => {
      for(let type of Object.keys(data.highlights)){
        let id = '#most-'+type
        let round = tweetCount(data.highlights[type].count)
        $(id).attr({
          "data-real":data.highlights[type].count,
          "data-round":round,
          "title":"The tweet with most "+countToPlural(type).toLowerCase(),
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

    const load_tweets_by_type = async () => {
      let id = "tweets-by-type-data"

      for(let type of Object.keys(data.type)){
        
        let span = $('<span id="'+id+'-'+type+'" class="data-hover"></span>').text(tweetCount(data.type[type].count))
        let span_compare = $('<span id="'+id+'-'+type+'-compare" class="data-hover"></span>')

        span.attr({"data-real":data.type[type].count, "data-round":tweetCount(data.type[type].count),"title":type})

        let li = $('<li class="list-group-item">'+type+': </li>').append(span).append(span_compare)
        $('#'+id+' ul').append(li)
        if(compare)
          appendCompare('#'+id+'-'+type,data.type[type].count,compare.type[type].count)

      }
    }

    const load_avg_metrics_table = async () => {
      for(let type of Object.keys(data.media_type)){        

        let id = 'avg-interactions-'+type
        $('#'+id+' #interval').text(msToHMS(data.media_type[type].interval))
        
        for(let key of Object.keys(data.media_type[type].metrics)){
          let li = $('<a onclick="return false;" class="list-group-item"></a>')
          
          if(data.media_type[type].count == 0) {
            $('#'+id).remove()
            continue
          }
          
          let avg_count = Math.floor(data.media_type[type].metrics[key]/data.media_type[type].count)
          
          let name = countToPlural(key)
          li.text(name+" : ")
          
          let span_id = id+'-'+key          
          let span = $('<span id="'+span_id+'"class="data-hover">'+tweetCount(avg_count)+'</span>')
          span.attr({"data-real":avg_count, "data-round":tweetCount(avg_count),"title":"Average "+name.toLowerCase()})
          let compare_span = $('<span id="'+span_id+'-compare" class="data-hover"></span>')            
          
          li.append(span).append(compare_span)
          $('#'+id+' ul#average').append(li)
          
          if(compare){
            let avg_count_compare = Math.floor(compare.media_type[type].metrics[key]/compare.media_type[type].count)
            appendCompare('#'+span_id,avg_count,avg_count_compare)
          }
        }
      }
    }

    const load_total_info = async () => {
      let id = "total-info-h"
      let count = data.total.count
      let count_rounded = tweetCount(count)

      let span = $('<span id="'+id+'-data" class="data-hover data-clean">'+count+'</span>')
      span.attr({"data-real":count,"data_round":count_rounded,"title":"Total tweets analized"})
      let span_compare = $('<span id="'+id+'-data-compare" class="data-hover data-clean"></span>')

      $('#'+id).append(span).append(span_compare)

      id = id+"-data"
      if(compare)
        appendCompare('#'+id,count,compare.total.count)

      $("#total-info-i #interval").text(msToHMS(data.total.interval))

    }

    const load_total_charts = async () => {
      let id = "total-charts-wrapper-"
      for(let type of Object.keys(data.total.metrics)){
        lineCharts(id+type,data.total.metrics[type],type)
      }
    }

    const load_hashtags = async () => {
      let id = "hashtags-chart-wrapper"
      if(data.hashtags){
        let hashtags = Object.entries(data.hashtags).sort((a,b)=> b[1]-a[1]).slice(0,10)
        await barChart(hashtags,id,"hashtags")        
      }
    }

    const load_mentioned_users = async () => {
      let id = "mentioned_users-chart-wrapper"
      if(data.mentioned_users){
        let mentions = Object.entries(data.mentioned_users).sort((a,b)=> b[1]-a[1]).slice(0,10)
        await barChart(mentions,id,"mentioned_users")        
      }
    }    

    const load_langs_chart = async () => {
      let id = "tweets-by-langs"  
      let dataset = extractLangs(data.langs)
      await pieCharts(dataset.data,dataset.labels,null,id)
      return 
    }

    const load_media_type_Chart = async () => {
      let id = "tweets-by-media-type"
      let labels = ["Text","Video","Photo","Link","Poll","Gif"]
      if(compare)
        await pieCharts(extractCounts(data.media_type),labels,extractCounts(compare.media_type),id,'doughnut')
      else
        await pieCharts(extractCounts(data.media_type),labels,null,id,'doughnut')
    }

    const load_type_Chart = async () => {
      let id = "tweets-by-type"
      let labels = ["Retweets","Replies","Quotes","Originals"]
      if(compare) 
        await pieCharts(extractCounts(data.type),labels,extractCounts(compare.type),id,'doughnut')
      else 
        await pieCharts(extractCounts(data.type),labels,null,id,'doughnut')
    }

    const load_week_chart = async () => {
      let id = "week-chart-wrapper"
      let labels = Object.keys(data.tweets_per_day)
      let colors = ['#FFBE0B','#FB5607','#FF006E','#8338EC','#3A86FF','#3A6CFF']

      let datasets = extractMediaAndType(data.tweets_per_day,colors)
      await metricCharts(datasets,labels,id,"tweets-per-day")
    }


    Promise.all([
      load_user_datails(),
      load_followers(),
      load_followings(),
      load_sample_internal_new(),
      load_sample_interval_old(),
      load_highlights(), 
      load_avg_metrics_table(),
      load_total_info(),
      load_week_chart(),
      load_media_type_Chart(),
      load_type_Chart(),
      load_langs_chart(),
      load_hashtags(),
      load_mentioned_users()
    ])

    //input,labels,id,type
    // 
    // 
    // await metricCharts(data.metrics,'metric-charts','retweets')

    set_data_hover()

  }

  function load_dateTime(id,data){   
    $(id+" #search-date .date").text((data.date).slice(0,10))
    let span = $('<span class="time-span node-clean"></span>')
    $(id+" #search-date .time").append(span.text((data.date).slice(11,19)))

    $(id+" #interval-start-date").text((data.start_date).slice(0,10))
    $("#search-sample-new #interval-start-time").append(span.text((data.start_date).slice(11,19)))

    $(id+" #interval-end-date").text((data.end_date).slice(0,10))
    $(id+" #interval-end-time").append(span.text((data.end_date).slice(11,19)))

    $(id+" #sample span").text(data.total.count)
  }

  function extractLangs(langs) {
    let labels = []
    let dataset = []
    var unknown_lang = 0
    Object.entries(langs).map( e => {
      let eng = new Intl.DisplayNames(e[0],{type:"language",fallback:'none'})
      let lang = eng.of(e[0])
      console.log(lang);
      if(lang && lang != "No linguistic content"){
        labels.push(lang)
        dataset.push(e[1])
      }else{
        unknown_lang += e[1];
      }
    })

    if(unknown_lang>0){
      labels.push("Unidentified")
      dataset.push(unknown_lang)
    }

    return {data:dataset,labels:labels}
  }
  function extractCounts(data){
    let dataset = []
    Object.keys(data).forEach( key => {
      dataset.push((data[key].count))
    })

    return dataset
  }
  // draw pie charts
  async function pieCharts(data_1,labels,data_2,id,chartType = 'pie'){
    
    let canvas = document.createElement("canvas")
    canvas.id = id+"-chart"
    document.getElementById(id).appendChild(canvas)

    let colors = ['#FF595E','#FFCA3A','#8AC926','#1982C4','#00B4D8','#6A4C93']

    let dataset_1 = {
      label:cleanText(id)+" new",
      data:data_1,
      backgroundColor:colors,
      hoverOffset: 4
    }
    let datasets = [dataset_1]

    if(data_2){
      let dataset_2 = {
        label:cleanText(id)+" old",
        data:data_2,
        backgroundColor:colors,
        hoverOffset: 4        
      }
      datasets.push(dataset_2)
    }

    new Chart(document.getElementById(canvas.id),{
      type:chartType,
      data:{
        labels:labels,
        datasets:datasets,
      },
      options : {
        responsive:true,
        aspectRatio: 1,
        maintainAspectRatio:false,
        plugins:{
          legend:{
            position:"left",
            labels: {           
              boxWidth:10,
              borderRadius:10,
              generateLabels: (chart) => {
                const datasets = chart.data.datasets;
                return datasets[0].data.map((data, i) => ({
                  text: `${chart.data.labels[i]} : ${data}`,
                  fillStyle: datasets[0].backgroundColor[i],
                  index: i
                }))
              }
            }
          },
          datalabels:{
            anchor:"center",            
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

  function toDataset(data,label,color,stack){
    let struct = {}
    struct["data"] = data
    struct["label"] = label
    struct["backgroundColor"] = color
    struct['stack'] = stack

    return struct
  }
  
  function extractMediaAndType(data,colors){
    let labels = Object.keys(data)
    let count = 0

    let media = {
      text: [],
      video: [],
      photo: [],
      link: [],
      polls: [],
      animated_gif: []
    }
    let type = {
      retweeted: [],
      replied_to: [],
      quoted: [],
      original: []
    }

    let tweet_media_types = Object.keys(data[labels[0]].media)
    let tweet_types = Object.keys(data[labels[0]].type)

    for(let day of labels){
      for(let x of tweet_media_types){
        media[x].push(data[day].media[x])
      }
      for(let x of tweet_types){
        type[x].push(data[day].type[x])
      }
    }

    let output = []
    for(let m of Object.keys(media)){      
      output.push(toDataset(media[m],m,colors[count++],0))
    }

    count = 0

    for(let t of Object.keys(type)){      
      output.push(toDataset(type[t],t,colors[count++],1))
    }

    return output
  }
  async function metricCharts(datasets,labels,id,type){
    let canvas = document.createElement("canvas")
    canvas.id = type+"-chart"
    
    document.getElementById(id).appendChild(canvas)      

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
          text:cleanText(id)
        },          
         legend: {
            display: false
         },
         datalabels:{display:false},
      },
      scales: {
        x: {
          display:true,
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
  async function barChart(data,id,type){
    
    let canvas = document.createElement("canvas")
    canvas.id = type+"-chart"
    document.getElementById(id).appendChild(canvas)

    let labels = []
    let dataset = []

    data.forEach(e => {
      labels.push(e[0])
      dataset.push(e[1])
    })

    color = '#5634f0'
    new Chart(document.getElementById(canvas.id),{
      type:'bar',      
      data:{
        labels :  labels,
        datasets: [{
          label: type,
          data: dataset,
          fill: false,
          backgroundColor: color,
        }],
      },
      options: {
        indexAxis:'y',
        barThickness:"15",
        plugins: {
           legend: {
              display: false
           },
           datalabels:{display:false,color:"#fff"},
          },
        scales: {
          x: {
            ticks: {
                maxRotation: 45,
                minRotation: 45
            }
          },
          y: {display: true},
      }
      }
    })
  }

  async function lineCharts(id,data,type){
    console.log(id);
    let canvas = document.createElement("canvas")
    canvas.id = type+"-chart"
    document.getElementById(id).appendChild(canvas)
    let labels = [...Array(data.length).keys()]
    color = '#5634f0'
    new Chart(document.getElementById(canvas.id),{
      type:'line',
      data:{
        labels :  labels,
        datasets: [{
          label: type,
          data: data,
          fill: false,
          borderColor: color,
          tension: 0.5                   
        }],
      },
      options: {
        plugins: {
           legend: {
              display: true
           },
           datalabels:{display:false},
          },
        scales: {
          x: {display: false},
          y: {display: false},
      }
      }
    })
  }

  function countToPlural(key){
    if(key == 'reply_count')
      return  "Replies"
    else
      return key.charAt(0).toUpperCase()+key.slice(1,-6)+"s"
  }

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

    let up = ["bi-caret-up-fill","text-success","node-clean"]
    let down = ["bi-caret-down-fill","text-danger","node-clean"]

    // console.log(new_data,old_data);
    
    let diff = new_data - old_data
    let rounded_data = tweetCount(diff)

    let icon = $('<i class="bi ms-1 me-1"></i>')
    
    if(new_data>old_data){
      icon.addClass(up)
      icon.attr("title","Gained")
    }else{
      icon.addClass(down)
      icon.attr("title","Lost")
    }

    $(id).after(icon)

    id = id+"-compare"
    $(id).attr({"data-real":diff, "data-round":rounded_data, "title":"Difference between new and old data"})
    $(id).append(rounded_data)
  }

  function toUpperFirstChar(str){
    return str.charAt(0).toUpperCase()+str.slice(1)
  }

  function cleanText(str){
    let regex = /[^A-Za-z0-9]/g    
    return str.replace(regex," ")
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
    return Math.floor(h)+"H "+Math.floor(m)+"m "+Math.floor(s)+"s"
  }
  function tweetCount(count){
    if (count / 1000000 >= 1 || count / 1000000 <= -1)
      return (count / 1000000).toFixed(2) + "M"
    
    if(count / 1000 >= 1 || count / 1000 <= -1)
      return (count / 1000).toFixed(1) + "K"
    
    return count
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