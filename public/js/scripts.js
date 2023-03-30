// ! boostrap form validation check script
function formValidator() {
  'use strict'
  console.log("asd");
  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll('.needs-validation')
  // Loop over them and prevent submission
  Array.prototype.slice.call(forms)
    .forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault()
          // event.stopPropagation()
        }
        form.classList.add('was-validated')
      }, false)
    })
}

formValidator()

// ! chartsjs plugins
Chart.register(ChartDataLabels)

function postViaWorker(data,method,url){
  return new Promise((resolve,reject) => {
    let worker = new Worker('../js/worker.js')
    worker.postMessage({data:data,method:method,url:url})
    worker.onmessage = (event) => {
      resolve(event.data)
    }
  })
}

const sleep = ms => new Promise(r => setTimeout(r,ms))

$(document).ready(async function(){
  // reset checkboxes on page ready
  $('.form-check-input:checked').each(function(i,e){
    $(this).click()
  })

  function errorParamDisplay(){
    const params = new URLSearchParams(document.location.search)

    if(params.get('error')){
      errorDisplay({error:params.get('error')})
    }

    if(params.get('success')){
      errorDisplay({success:params.get('success')})
    }
    var newURL = location.href.split("?")[0];
    window.history.pushState('object', document.title, newURL);
  }
  errorParamDisplay()

  // ! error display function
  function errorDisplay(data){
    $('#error-modal .modal-header').removeClass("bg-danger bg-success")
    $('#error-modal #error-msg').removeClass("text-danger text-success")

    if(data.error){
      $('#error-modal .modal-header').addClass('bg-danger')
      $('#error-modal h5.modal-title').text("Error")
      $('#error-modal #error-msg').addClass('text-danger').text(data.error)
    }
    else if(data.success){
      $('#error-modal .modal-header').addClass('bg-success')
      $('#error-modal h5.modal-title').text("Success")
      $('#error-modal #error-msg').addClass('text-success').text(data.success)
    }

    $('#error-modal').modal('show')

  }

  $('#signup #signup-btn').click(async function(event){
    let input = $('#signup #signup-psw-confirm input')[0]
    if($('#signup #signup-psw-confirm input').val() !=  $('#signup #signup-psw input').val()){
      $('#signup #signup-psw-confirm .invalid-feedback').show()
      input.setCustomValidity("Passwords don't match")

      return
    }

    $('#signup #signup-psw-confirm .invalid-feedback').hide()
    input.setCustomValidity("")
    event.preventDefault()
    let form = $('#signup-form').serialize()
    let data = await postViaWorker(form,'POST',"/signup")
    errorDisplay(data)
  })

  // change psw
  // FIXME error handler
  $('#change-submit').click(async function(event){
    event.preventDefault()
    if($("#password").val().length <1)
      return errorDisplay({error:"Please insert the old password to proceed!"})

    if($("#change-password").val().length<7 || $("#change-password-2").val().length<7)
      return errorDisplay({error:"Password must have at least 8 characters!"})

    if($("#change-password").val() != $("#change-password-2").val())
      return errorDisplay({error:"Passwords don't match!"})

    let form = $('#change-form').serialize()
    const data = await postViaWorker(form,"POST","/dashboard/profile")
    return errorDisplay(data)
  })

  $('#profile-delete-submit').click(async function(event){
    event.preventDefault()

    if($('#profile-delete-password').val().length <1)
      return errorDisplay({error:"Please insert the old password to proceed!"})

    let data = await postViaWorker($('#profile-delete-form').serialize(),"DELETE","/dashboard/profile")

    console.log(data)
    return errorDisplay(data)

  })

  $('#profile-delete-btn').click(async function(){
    $('#profile-delete-modal').modal('show')
  })

  // delete a seached result
  $('.close-icon').click(async function(){
    if(!confirm("Are you sure you want to delete this record?")) return

    let id = $(this).attr('data-id')
    let data = "id="+encodeURIComponent(id)
    let response = await postViaWorker(data,"DELETE","/results")

    if(response?.error)
      return errorDisplay(response)

    $(this).parent().parent().parent().fadeOut(function(){
      $(this).remove()
    })
    if($("#searches .searched-entry-container").length < 1) window.location.reload()

  })

  // show detailed clicked result
  $('.searched-entry').click(async function(){
    let id = $(this).attr('id')
    let url = '/results?compare=0&id='+id
    let data = await postViaWorker(null,'GET',url)

    if(data.error) return errorDisplay(data)
    await genSearchResults(data)
    $('#results-wrapper').removeClass('d-none').modal('toggle')
    $('#results').removeClass('d-none')
  })

  // search history close button icon hovering effect
  $('.close-icon').hover(function(){
    $(this).removeClass('bi-x-square')
    $(this).addClass('bi-x-square-fill')
  },function(){
    $(this).removeClass('bi-x-square-fill')
    $(this).addClass('bi-x-square')
  })

  // model close button
  $('.model-close-button').click(function(){
    $('.modal').modal('hide')
  })

  // show detailed comparing results
  $('.compare-btn').click(async function(event){
    const id_1 =  $('.form-check-input:checked').attr('data-id')
    const id_2 =  $(this).parent().find('.form-check-input').attr('data-id')

    let url = "/results?compare=1&id="+id_1+"&id="+id_2

    let data = await postViaWorker(null,'GET',url)

    await genSearchResults(data)

    $('#results-wrapper').removeClass('d-none').modal('toggle')
    $('#results').removeClass('d-none')

  })

  // disable checkboxes of other usernames
  // and re-enable checkboxes if there is no checkboxes checked

  //FIXME to test with more results per username
  $('.form-check-input').click(function(event){

    let username = $(this).attr('data-username')
    let id = $(this).attr('data-id')

    $("#searched-history .form-check-input[data-username="+username+"]").each(function(i,e){
      $('#searched-history .form-check-input:not(:checked)').addClass('d-none')
      if($(this).attr('data-id') != id)
        $(this).parent().find('.compare-btn').removeClass("d-none")
      })

    if($('.form-check-input:checked').length < 1){
      $('.form-check-input:disabled').each( function(i,e){
          $(this).removeAttr("disabled")
          $(this).removeAttr('checked')
      })
      $('#searched-history .compare-btn').addClass('d-none')
      $('#searched-history .form-check-input').removeClass('d-none')
    }

  })

  // search page search button
  $('#search-btn').click(async (event)=>{
    event.preventDefault()

    if($('#handler').val() == '') return

    $('#results').addClass('d-none')
    $('#loader').removeClass('d-none')
    $('#loader #loader-gif').removeClass('d-none')
    $('#search-btn').prop("disabled",true)

    let data = await postViaWorker($('#form-search').serialize(),'POST','/twitter')
    //await sleep(1000)
    // await sleep(1000)
    // $('#loader #working-gif').removeClass('d-none')

    // let data  = await fetch('../js/output_data_compare.json').then( response => {
      //     return response.json()
      // })
      //await sleep(1000)

      await genSearchResults(data)

    $('#loader #loader-gif').addClass('d-none')
    // $('#loader #working-gif').addClass('d-none')
    $('#loader').addClass('d-none')

    $('#results').removeClass("d-none")
    $('#results').show()
    $('#search-btn').removeAttr("disabled")
  })

  function cleanResults(){
    $('#results #user-info #user-profile img').remove()
    $('#results .data-clean').each((i,obj) => $(obj).empty())
    $('#results .node-clean').each((i,obj) => $(obj).remove())

  }
  // ! populate with seach results + charts
  async function genSearchResults(data){
    cleanResults()
    if(data.error) return
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

      $('#results #total-tweets-data')
      .attr({"data-real":count, "data-round":count_rounded,"title":"Total tweets"})
      .text(count_rounded)

      if(compare)
        appendCompare("#results #total-tweets-data",count,compare.total_tweets)
    }

    const load_followers = async () => {
      load_x("#followers",data.followers,compare?.followers,"Total Followers")
    }

    const load_followings = async () => {
      load_x('#followings',data.followings,compare?.followings,"Total Followings")
    }

    const load_total_info = async () => {
      $("#results #total-interval").text(msToHMS(data.total.interval))
      if(compare)
        appendCompareInterval('#results #total-interval',data.total.interval,compare.total.interval)
    }

    const load_sample_internal_new = async () =>{
      let id = "#results #search-sample-new"
      load_dateTime(id,data)
    }

    const load_sample_interval_old = async () => {
      let id = "#results #search-sample-old"

      if(compare == null || compare == undefined){
        $(id).addClass('d-none')
        return
      }

      if(compare){
        $(id).removeClass('d-none')
        load_dateTime(id,compare)
      }
    }

    const load_highlights = async () => {
      for(let type of Object.keys(data.highlights)){
        let id = '#results  #most-'+type
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
      load_type("tweets-by-media-type-data",data.media_type,compare?.media_type)
    }

    const load_tweets_by_type_data = async () => {
      load_type("tweets-by-type-data",data.type,compare?.type)
    }

    const load_avg_metrics_table = async () => {
      for(let type of Object.keys(data.media_type)){

        let id = 'avg-interactions'
        let sub_id = id+'-'+type
        let intv_id = id+'-interval-'+type

        if(data.media_type[type].count == 0) {
          $('#'+sub_id).hide()
          continue
        }

        $('#results #'+intv_id).text(msToHMS(data.media_type[type].interval))
        if(compare)
          appendCompareInterval("#"+intv_id,data.media_type[type].interval,compare.media_type[type].interval)

        for(let key of Object.keys(data.media_type[type].metrics)){
          let li = $('<a onclick="return false;" class="list-group-item data-clean"></a>')

          let avg_count = Math.floor(data.media_type[type].metrics[key]/data.media_type[type].count)

          let name = countToPlural(key)
          li.text(name+" : ")

          let span_id = sub_id+'-'+key
          let span = $('<span id="'+span_id+'"class="data-hover data-clean">'+tweetCount(avg_count)+'</span>')
          span.attr({"data-real":avg_count, "data-round":tweetCount(avg_count),"title":"Average "+name.toLowerCase()})
          let compare_span = $('<span id="'+span_id+'-compare" class="data-hover data-clean"></span>')

          li.append(span).append(compare_span)
          $('#results #'+sub_id+' ul').append(li)

          if(compare){
            let avg_count_compare = Math.floor(compare.media_type[type].metrics[key]/compare.media_type[type].count)
            appendCompare('#results #'+span_id,avg_count,avg_count_compare)
          }
        }

        $('#'+sub_id).show()
      }
    }


// FIXME append something then there is no hashtag graph
    const load_hashtags = async () => {
      let id = "hashtags-chart-wrapper"
      if(compare) $('#hashtags-wrapper').hide()
      else $('#hashtags-wrapper').show()

      if(data.hashtags){
        let hashtags = Object.entries(data.hashtags).sort((a,b)=> b[1]-a[1]).slice(0,10)
        await top10Chart(hashtags,id,"Top 10 hashtags")
      }else{
        $('#'+id).append('<h5>No data</h5>')
      }
    }

    const load_mentioned_users = async () => {
      let id = "mentioned_users-chart-wrapper"
      if(compare) $('#mentioned_users-wrapper').hide()
      else $('#mentioned_users-wrapper').show()

      if(data.mentioned_users){
        let mentions = Object.entries(data.mentioned_users).sort((a,b)=> b[1]-a[1]).slice(0,10)
        await top10Chart(mentions,id,"Top 10 mentiones")
      }else{
        $('#'+id).append('<h5>No data</h5>')
      }
    }

    const load_langs_chart = async () => {
      let id = "tweets-by-langs"
      let dataset = extractLangs(data.langs)
      let data_langs = {}
      dataset.labels.forEach((key,i)=> {
        data_langs[key] = {count:dataset.data[i]}
      })

      if(compare){
        let data_langs_compare = {}
        let dataset_compare = extractLangs(compare.langs)

        dataset_compare.labels.forEach((key,i)=> {
          data_langs_compare[key] = {count:dataset_compare.data[i]}
        })

        load_type(id+"-data",data_langs,data_langs_compare)
      }else{
        load_type(id+"-data",data_langs,null)
      }
      await pieCharts(dataset,null,id,"Tweets by languages")

    }

    const load_media_type_Chart = async () => {
      let id = "tweets-by-media-type"
      let labels = ["Text","Video","Photo","Link","Poll","Gif"]
      let dataset = {
        data:extractCounts(data.media_type),
        labels:labels
      }

      if(compare){
        let dataset_compare ={
          data:extractCounts(compare.media_type),
          labels:labels
        }
        await pieCharts(dataset,dataset_compare,id,"Tweets by Media Type compare",'doughnut')
      }
      else
        await pieCharts(dataset,null,id,"Tweets by Media Type")
    }

    const load_type_Chart = async () => {
      let id = "tweets-by-type"
      let labels = ["Retweets","Replies","Quotes","Originals"]
      let dataset = {
        data:extractCounts(data.type),
        labels:labels
      }

      if(compare){
        let dataset_compare ={
          data:extractCounts(compare.type),
          labels:labels
        }
        await pieCharts(dataset,dataset_compare,id,"Tweets by Tweet Type compare",'doughnut')
      }
      else
        await pieCharts(dataset,null,id,"Tweets by Tweet Type")
    }

    const load_week_chart = async () => {
      let id = "week-chart-wrapper"

      let colors = ['#FFBE0B','#FB5607','#FF006E','#8338EC','#3A86FF','#3A6CFF']

      if(compare){
        let labels = [...Array(7).keys()]
        let dataset = extractDailyTotal(data.tweets_per_day)
        let dataset_compare = extractDailyTotal(compare.tweets_per_day)
        await lineChart(dataset,labels,dataset_compare,id,"daily-tweets-compare","Daily tweets")
      }else{
        let labels = Object.keys(data.tweets_per_day)
        let datasets = extractMediaAndType(data.tweets_per_day,colors)
        await dailyChartByType(datasets,labels,id,"Daily tweets by Media Type and Tweet Type")
      }
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
      load_tweets_by_media_type_data(),
      load_tweets_by_type_data(),
      load_type_Chart(),
      load_langs_chart(),
      load_hashtags(),
      load_mentioned_users()
    ])
  }

  function load_type(id,data,compare){

    for(let type of Object.keys(data)){
      let count = data[type].count
      let count_rounded = tweetCount(count)

      let sub_id = id+"-"+type

      let span = $('<span class="data-hover data-clean"></span>')
      span.attr({"id":sub_id,"data-real":count, "data-round":count_rounded})
      span.text(count_rounded)

      let span_compare = $('<span id="'+sub_id+'-compare" class="data-hover data-clean"></span>')

      let li = $('<li class="list-group-item data-clean">'+toUpperFirstChar(cleanText(type))+': </li>').append(span).append(span_compare)
      $('#results  #'+id+' ul').append(li)

      if(compare && compare[type]){
        appendCompare('#results #'+id+' #'+sub_id,count,compare[type].count)
      }
    }
  }

  function load_x(id,data,compare,title){
    let rounded = tweetCount(data)
    id = '#results '+id
    $(id)
    .attr({"data-real":data, "data-round":rounded,"title":title})
    .text(rounded)

    if(compare)
      appendCompare(id,data,compare)
  }

  function load_dateTime(id,data){
    let date = data.date
    $(id+" #search-date .date").text(date.slice(0,10))
    let span = $('<span class="time-span node-clean"></span>')

    $(id+" #search-date .time").append(
      $('<span class="time-span node-clean"></span>').text(date.slice(11,19)))

    let start_date = data.start_date
    $(id+" #interval-start-date").text(start_date.slice(0,10))
    $(id+" #interval-start-time").append(
      $('<span class="time-span node-clean"></span>').text(start_date.slice(11,19)))

    let end_date = data.end_date
    $(id+" #interval-end-date").text(end_date.slice(0,10))
    $(id+" #interval-end-time").append(
      $('<span class="time-span node-clean"></span>').text(end_date.slice(11,19)))

    $(id+" #sample span").text(data.total.count)
  }

  function extractLangs(langs) {
    let labels = []
    let dataset = []
    var unknown_lang = 0
    Object.entries(langs).map( e => {
      let eng = new Intl.DisplayNames("en",{type:"language",fallback:'none'})
      let lang = eng.of(e[0])

      if(lang && lang != "No linguistic content"){
        labels.push(toUpperFirstChar(lang))
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
  async function pieCharts(data_1,data_2,id,title,chartType = 'pie'){

    let canvas = document.createElement("canvas")
    canvas.id = id+"-chart"
    document.getElementById(id).appendChild(canvas)

    let colors = ['#FF595E','#FFCA3A','#8AC926','#1982C4','#00B4D8','#6A4C93']

    let dataset_1 = {
      label:title,
      data:data_1.data,
      backgroundColor:colors,
      hoverOffset: 4
    }
    let datasets = [dataset_1]

    if(data_2){
      let dataset_2 = {
        label:title+" compare",
        data:data_2.data,
        backgroundColor:colors,
        hoverOffset: 4
      }
      datasets.push(dataset_2)
    }

    new Chart(document.getElementById(canvas.id),{
      type:chartType,
      data:{
        labels:data_1.labels,
        datasets:datasets,
      },
      options :{
        responsive:true,
        aspectRatio: 1,
        maintainAspectRatio:false,
        plugins:{
          legend:{
            display:true,
            position:"bottom",
            labels: {

              usePointStyle:true,
              pointStyle:'rectRounded',
              padding:20
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
      },

    })
  }
  async function pieCharts_1(data_1,data_2,id,chartType = 'pie'){

    let canvas = document.createElement("canvas")
    canvas.id = id+"-chart"
    document.getElementById(id).appendChild(canvas)

    let colors = ['#FF595E','#FFCA3A','#8AC926','#1982C4','#00B4D8','#6A4C93']

    let dataset_1 = {
      label:cleanText(id)+" new",
      labels:data_1.labels,
      data:data_1.data,
      backgroundColor:colors,
      hoverOffset: 4
    }
    let datasets = [dataset_1]

    if(data_2){
      let dataset_2 = {
        label:cleanText(id)+" old",
        labels:data_2.labels,
        data:data_2.data,
        backgroundColor:colors,
        hoverOffset: 4
      }
      datasets.push(dataset_2)
    }

    // const pieLabelsLine = {
    //   id: "pieLabelsLine",
    //   afterDraw(chart) {
    //     const {
    //       ctx,
    //       chartArea: { width, height },
    //     } = chart;

    //     const cx = chart._metasets[0].data[0].x;
    //     const cy = chart._metasets[0].data[0].y;

    //     const sum = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);

    //     chart.data.datasets.forEach((dataset, i) => {
    //       chart.getDatasetMeta(i).data.forEach((datapoint, index) => {
    //         const { x: a, y: b } = datapoint.tooltipPosition();

    //         const x = 2 * a - cx;
    //         const y = 2 * b - cy;

    //         // draw line
    //         const halfwidth = width / 2;
    //         const halfheight = height / 2;
    //         const xLine = x >= halfwidth ? x + 20 : x - 20;
    //         const yLine = y >= halfheight ? y + 20 : y - 20;

    //         const extraLine = x >= halfwidth ? 10 : -10;

    //         ctx.beginPath();
    //         ctx.moveTo(x, y);
    //         ctx.arc(x, y, 2, 0, 2 * Math.PI, true);
    //         ctx.fill();
    //         ctx.moveTo(x, y);
    //         ctx.lineTo(xLine, yLine);
    //         ctx.lineTo(xLine + extraLine, yLine);
    //         // ctx.strokeStyle = dataset.backgroundColor[index];
    //         ctx.strokeStyle = "black";
    //         ctx.stroke();

    //         // text
    //         const textWidth = ctx.measureText(chart.data.labels[index]).width;
    //         ctx.font = "12px Arial";
    //         // control the position
    //         const textXPosition = x >= halfwidth ? "left" : "right";
    //         const plusFivePx = x >= halfwidth ? 1 : -1;
    //         ctx.textAlign = textXPosition;
    //         ctx.textBaseline = "middle";
    //         // ctx.fillStyle = dataset.backgroundColor[index];
    //         ctx.fillStyle = "black";
    //           ctx.fillText(chart.data.labels[index] +" : "+ (((chart.data.datasets[0].data[index] * 100) / sum)).toFixed(2) + "%",
    //           xLine + extraLine + plusFivePx, yLine)
    //       //   ctx.fillText(
    //       //     ((chart.data.datasets[0].data[index] * 100) / sum).toFixed(2) +
    //       //       "%",
    //       //     xLine + extraLine + plusFivePx,
    //       //     yLine
    //       //   );
    //       });
    //     });
    //   },
    // };

    // var params = {
    //   display: true,
    //   // text: [
    //   // '%l (%p.3) \n VALUE: (%v.3)',
    //   // '%l (%p) \n VALUE: (%v)',
    //   // 'SIMPLE VALUE \n => %v',
    //   // 'VALUE WITH PRECISION 4 \n => %v.4',
    //   // 'SIMPLE PERCENT \n => %p',
    //   // 'PERCENT WITH PRECISION 3 \n => %p.3',
    //   // 'JUST LABEL \n => %l',
    //   // 'JUST TEXT'
    //   // ],
    //   borderWidth: 2,
    //   lineWidth: 2,
    //   padding: 3,
    //   textAlign: 'center',
    //   stretch: 10,
    //   font: {
    //       resizable: true,
    //       minSize: 12,
    //       maxSize: 25,
    //       family: Chart.defaults.font.family,
    //       size: Chart.defaults.font.size,
    //       style: Chart.defaults.font.style,
    //       lineHeight: Chart.defaults.font.lineHeight,
    //   },
    //   color: "black",
    //   valuePrecision: 1,
    //   percentPrecision: 2
    // };
    // var chartOption = {

    //     maintainAspectRatio: false,
    //     layout: {
    //         padding: 0
    //     },
    //     plugins: {
    //         legend:{display:false},
    //         outlabels: params,
    //     }
    // };

    new Chart(document.getElementById(canvas.id),{
      type:chartType,
      data:{
        datasets:datasets,
      },
      options : chartOption,
      // {
      //   responsive:true,
      //   aspectRatio: 1,
      //   maintainAspectRatio:false,

      //   plugins:{
      //     // legend:{
      //     //   position:"bottom",
      //     //   labels: {
      //     //     boxWidth:10,
      //     //     borderRadius:10,
      //     //     generateLabels: (chart) => {
      //     //       console.log(chart.data);
      //     //       const datasets = chart.data.datasets;
      //     //       let labelset_1 = datasets[0].data.map((data, i) => ({
      //     //         text: `${datasets[0].labels[i]} : ${data}`,
      //     //         fillStyle: datasets[0].backgroundColor[i],
      //     //         index: i
      //     //       }))
      //     //       let labelset_2 = datasets[1].data.map((data, i) => ({
      //     //         text: `compare - ${datasets[1].labels[i]} : ${data}`,
      //     //         fillStyle: datasets[1].backgroundColor[i],
      //     //         index: i
      //     //       }))

      //     //       return labelset_1.concat(labelset_2)
      //     //     }
      //     //   }
      //     // },
      //     // tooltip: {
      //     //   callbacks: {
      //     //       label: function(context) {
      //     //         var index = context.dataIndex;
      //     //         return context.dataset.labels[index] + ': ' + context.dataset.data[index];
      //     //       }
      //     //   }
      //     // },
      //     // datalabels:{
      //     //   anchor:"center",
      //     //   color:'white',
      //     //   formatter: (value,context)=>{
      //     //     let total = context.dataset.data.reduce((acc,v)=> acc+v,0)
      //     //     let perc = Math.floor(value/total *100)
      //     //     return perc>2 ? perc+"%":''
      //     //   }
      //     // }
      //   }
      // },

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
  function extractDailyTotal(data){
    let labels = Object.keys(data)

    let output = []
    let tweet_types = Object.keys(data[labels[0]].type)

    for(let day of labels){
      let count = 0
      for(let type of tweet_types){
        count += data[day].type[type]
      }
      output.push(count)
    }

    return output
  }

  async function dailyChartByType(datasets,labels,id,title){
    let canvas = document.createElement("canvas")
    canvas.id = id+"-chart"
    document.getElementById(id).appendChild(canvas)

    new Chart(document.getElementById(canvas.id),{
    type:'bar',
    data:{
      labels : labels,
      datasets:datasets,
    },
    options: {
      responsive:true,
      maintainAspectRatio:false,
      plugins: {
        title:{
          display:true,
          text:title
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
          display:true,
          stacked:true
        },
      }
    },

  })

  }

  async function top10Chart(data,id,title){

    let canvas = document.createElement("canvas")
    canvas.id = id+"-chart"
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
          label: title,
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
          y: {display: true,title:"asd"},
      }
      }
    })
  }

  async function lineChart(data_1,labels,data_2,id,type,title){
    let canvas = document.createElement("canvas")
    canvas.id = type+"-chart"
    document.getElementById(id).appendChild(canvas)


    color_1 = '#FF006E'
    color_2 = '#FFBE0B'

    let dataset_1 = {
      label:title,
      data:data_1,
      fill: false,
      borderColor: color_1,
      tension: 0.1
    }
    let datasets = [dataset_1]

    if(data_2){
      let dataset_2 = {
        label:title+" compare",
        data:data_2,
        fill: false,
        borderColor: color_2,
        tension: 0.1
      }
      datasets.push(dataset_2)
    }


    new Chart(document.getElementById(canvas.id),{
      type:'line',
      data:{
        labels :  labels,
        datasets: datasets,
      },
      options: {
        plugins: {
           legend: {
              display: true
           },
           datalabels:{display:false},
          },
        scales: {
          x: {display: true},
          y: {display: true},
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
    $(document).on("mouseover ",'.data-hover',function(){
      $(this).text($(this).attr("data-real"))
    })

    $(document).on("mouseleave",'.data-hover',function(){
      $(this).text($(this).attr("data-round"))
    })

    $('.date').mouseover(function(){
      $(this).next().show()
    }).mouseleave(function(){
      $(this).next().hide()
    })

    // NOTE mobile
    $('.date').on('touchstart tap',(function(){
      $(this).next().toggle()
    }))

     // NOTE mobile
    $(document).on('touchstart tap','.data-hover',function(){
      if($(this).text() == $(this).attr("data-real"))
        $(this).text($(this).attr("data-round"))
      else
        $(this).text($(this).attr("data-real"))
    })


  }

  function appendCompare(id,new_data,old_data){
    if(!old_data) return
    if(old_data == new_data) return

    let diff = new_data - old_data
    let rounded_data = tweetCount(diff)

    let up = ["bi-caret-up-fill","text-success"]
    let down = ["bi-caret-down-fill","text-danger"]
    let icon = $('<i class="bi ms-1 me-1"></i>')

    if(diff>0){
      icon.addClass(up)
      icon.attr("title","Gained")
    }else{
      icon.addClass(down)
      icon.attr("title","Lost")
    }

    icon.addClass("node-clean")
    $(id).after(icon)

    id = id+"-compare"
    $(id).attr({"data-real":diff, "data-round":rounded_data, "title":"Difference between new and old data"})
    $(id).text(rounded_data)
  }
  function appendCompareInterval(id,new_data,old_data){

    if(!old_data) return
    if(old_data == new_data) return

    let diff = new_data - old_data
    let rounded_data = msToHMS(diff)
    if(rounded_data.length<1)  return

    let up = ["bi-caret-up-fill","text-success"]
    let down = ["bi-caret-down-fill","text-danger"]
    let icon = $('<i class="bi ms-1 me-1"></i>')

    if(diff>0){
      icon.addClass(up)
      icon.attr("title","Gained")
    }else{
      icon.addClass(down)
      icon.attr("title","Lost")
    }

    icon.addClass("node-clean")
    $(id).after(icon)

    id = id+"-compare"
    $(id).attr({"title":"Difference of interval"})
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

    if(h<1 && m<1 && s<1) return "0s"
    if(h<1 && m<1) return Math.floor(s)+"s"
    if(h<1) return Math.floor(m)+"m "+Math.floor(s)+"s"

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

  set_data_hover()
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