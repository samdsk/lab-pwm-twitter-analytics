// ! boostrap form validation check script
(function formValidator() {
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

// Chart colors
const colors_1 = ['#6a4c93','#1982c4','#8ac926','#ffca3a','#ff595e','#778da9']
const colors_2 = ['#26547c','#ef476f','#ffd166','#06d6a0','#FAA307','#7d8597']
const colors_3 = ['#33a8c7','#52e3e1','#a0e426','#00a878','#f77976','#d883ff','#d883ff','#147DF5','#9336fd','#BE0AFF']

// ! enable boostrap tooltips
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

// set theme on page load
document.getElementsByTagName('html')[0]
.setAttribute("data-bs-theme",localStorage.getItem("theme") || 'light')

if(document.getElementsByTagName('html')[0].getAttribute('data-bs-theme')=='light'){
  document.querySelector('#dark-mode i').classList.add('bi-sun-fill')
}else{
  document.querySelector('#dark-mode i').classList.add('bi-moon-stars-fill')
}

// ! registring chartsjs plugins
Chart.register(ChartDataLabels)

// web worker for sending ajax requests
function postViaWorker(data,method,url){
  return new Promise((resolve,reject) => {

    let worker = new Worker('/js/worker.js')

    worker.postMessage({data:data,method:method,url:url})
    worker.onmessage = (event) => {
      resolve(event.data)
    }
  })
}

// g-captcha callback enable
function enableBtns(){
  let buttons = document.getElementsByClassName('disable-btn')
  Array.prototype.slice.call(buttons).forEach(function(button){
    button.removeAttribute("disabled")
  })
}

// g-captcha callback disable
function disableBtns(){
  let buttons = document.getElementsByClassName('disable-btn')
  Array.prototype.slice.call(buttons).forEach(function(button){
    button.setAttribute("disabled",'')
  })
}

// sleep/waiting function
const sleep = ms => new Promise(r => setTimeout(r,ms))

// Caching previous search record requests
/* async function loadFromCache(url,id){
  let data
  if(localStorage.getItem("dataCache-"+id)){
    data = JSON.parse(localStorage.getItem("dataCache-"+id))
  }else{
    data = await postViaWorker(null,'GET',url+id)
    localStorage.setItem("dataCache-"+id,JSON.stringify(data))
  }

  return data
} */


// email validation with regex
const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

$(document).ready(async function(){
  // dark-mode click activate function
  $('#dark-mode').click(function(){
    if($('html').attr('data-bs-theme') == 'light'){
      $('html').attr('data-bs-theme','dark')
      localStorage.setItem("theme","dark")
      $('i',this).addClass('bi-sun-fill').removeClass('bi-moon-stars-fill')
    }
    else{
      $('html').attr('data-bs-theme','light')
      localStorage.setItem("theme","light")
      $('i',this).removeClass('bi-sun-fill').addClass('bi-moon-stars-fill')
    }
  })

  // dark-mode hover icon
  $('#dark-mode').hover(function(){
    if($('i',this).hasClass('bi-sun-fill'))
      $('i',this).removeClass('bi-sun-fill').addClass('bi-moon-stars-fill')
    else
      $('i',this).addClass('bi-sun-fill').removeClass('bi-moon-stars-fill')
  },function(){
    if($('i',this).hasClass('bi-sun-fill'))
      $('i',this).removeClass('bi-sun-fill').addClass('bi-moon-stars-fill')
    else
      $('i',this).addClass('bi-sun-fill').removeClass('bi-moon-stars-fill')
  })

  // Show Modal
  $('.show-modal-btn').click(function(){
    let modal = $(this).attr('data-modal')
    $('#'+modal).modal('show')
  })

  // reset checkboxes on page ready
  $('.form-check-input:checked').each(function(i,e){
    $(this).click()
  })
  // Submit form via web worker
  $('.form-submit').click(async function(event){
    event.preventDefault()
    const form_id = $(this).attr('data-form')
    const form = $('#'+form_id)
    if(!form) return errorDisplay({error:"Frontend error: Form must be specified"})

    let inputcheck = true;

    form.find('input').each((i,e)=>{
      if($(e).val().length <1) {
        inputcheck = false
      }
    })

    if(!inputcheck) return errorDisplay({error:"Input can't be empty!"})

    const email = form.find('input.email')

    if(email.length==1 && !validateEmail(email[0].value)){
      console.log("email failed");
      $(email[0]).parent().find('.invalid-feedback').show()
      return
    }

    const psw = form.find('input.password')
    const psw_confirm = form.find('input.password-confirm')

    if(psw.length == 1 && psw_confirm.length == 1){

      const input = psw[0]
      const input_confirm = psw_confirm[0]

      if(input.value !== input_confirm.value) {
        console.log("psw failed");
        input_confirm.setCustomValidity("Passwords don't match")
        $(input_confirm).parent().find('.invalid-feedback').show()
        return
      }
      input_confirm.setCustomValidity("")
      $(input_confirm).parent().find('.invalid-feedback').hide()
    }

    const method = form.attr('method')
    if(!method) return errorDisplay({error:"Must specify method in form"})

    let url = form.attr('action')
    if(!url) url = window.location.href

    let form_data = form.serialize()

    let data = await postViaWorker(form_data,method,url)

    if(data.error || data.success)
      return errorDisplay(data)
  })


  // Display Error/Success message from URL Params
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

  // removing deleted search record
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

  // show detailed view of clicked search record
  $('.searched-entry').click(async function(){
    let id = $(this).attr('id')
    let url = '/results?id='

    $('#results').hide()
    $('#results').hide()
    $('#results-modal').removeClass('d-none').modal('toggle')
    $('#loader #spinner').removeClass('d-none')

    let data = await postViaWorker(null,'GET',url+id)

    await sleep(500)
    $('#loader #spinner').addClass('d-none')

    await genSearchResults(data)


  })

  // search history close button / icon hovering effect
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

  // show detailed view of comparing results
  $('.compare-btn').click(async function(event){
    const id_1 =  $('.form-check-input:checked').attr('data-id')
    const id_2 =  $(this).parent().find('.form-check-input').attr('data-id')

    let url = "/results?id="

    $('#results').hide()
    $('#results-modal').removeClass('d-none').modal('toggle')
    $('#loader #spinner').removeClass('d-none')

    let data_1 = await postViaWorker(null,'GET',url+id_1)
    let data_2 = await postViaWorker(null,'GET',url+id_2)

    await sleep(500)
    $('#loader #spinner').addClass('d-none')

    await genSearchResults([data_1,data_2])
  })

  // disables checkboxes of other usernames
  // and re-enable checkboxes if there is no checkboxes checked
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

    if($('#handler').val() == '') return errorDisplay({error:"Please provide a valid Twitter username!"})

    $('#results').fadeOut(1000).addClass('d-none')
    $('#loader #spinner').removeClass('d-none')
    $('#search-btn').prop("disabled",true)

    let data = await postViaWorker($('#form-search').serialize(),'POST','/twitter')

    // let data  = await fetch('../js/output_data_compare.json').then( response => {
    //       return response.json()
    // })

    await sleep(500)
    $('#loader #spinner').addClass('d-none')

    await genSearchResults(data)

    $('#search-btn').removeAttr("disabled")

    disableBtns()
    grecaptcha.reset()
  })

  // resets the search results area progress bar
  function resetProgressBar() {
    let id = "#loader #progress-bar "
    $(id+' .progress-bar').removeClass(function (index, className) {
      return (className.match(new RegExp("\\S*w-\\S*", 'g')) || []).join(' ')
    })
  }

  // update the search results area progress bar
  function updateProgressBar(n){
    let id = "#loader #progress-bar "
    $(id+' .progress-bar').addClass('w-'+n)
  }

  // resetting/cleaning search results area
  function cleanResults(){
    $('#results #user-info #user-profile img').remove()
    $('#results .data-clean').each((i,obj) => $(obj).empty())
    $('#results .node-clean').each((i,obj) => $(obj).remove())
  }

  // ! populate with seach results + charts
  async function genSearchResults(data){
    if(data.error) return errorDisplay(data)

    resetProgressBar()
    await sleep(500)
    $('#loader #progress-bar').removeClass('d-none')

    cleanResults()

    if(data.length==2 && data[0].username != data[1].username){
      return errorDisplay({error:"Can't compare different users"})
    }

    await build(data)

    await sleep(500)
    $('#loader #progress-bar').addClass('d-none')
    $('#results').removeClass("d-none").fadeIn(1000)

  }

  // building search area
  async function build(INPUT){

    // set chart colors for according to theme
    if(localStorage.getItem('theme') == 'dark'){
      Chart.defaults.color = "#bbb"
      Chart.defaults.borderColor = "rgba(256, 255, 255, 0.1)"
    }else{
      Chart.defaults.color = "#333"
      Chart.defaults.borderColor = 'rgba(0, 0, 0, 0.1)'
    }

    let data = undefined
    let compare = undefined

    if(INPUT?.length) {
      data = INPUT[0]
      compare = INPUT[1]
    }else{
      data = INPUT
    }

    const load_user_datails = async () => {
      $('#results #name span').text(data.name)

      let ancor = document.createElement('a')
      ancor.href = buildTwitterUrl(data.username)
      ancor.id = "username-link"
      ancor.title = "Twitter link"
      ancor.innerText = "@"+data.username
      ancor.target = '_blank'
      $('#results #username span').empty().append(ancor)

      let img = new Image()
      img.crossOrigin = "anonymouse"
      img.src = data.user_img
      img.width = "73"
      img.height = "73"
      img.classList = 'rounded col-auto p-0'
      img.alt = "Profile image"

      $('#results #user-info #user-profile').prepend(img)

      let count = data.total_tweets
      let count_rounded = tweetCount(count)

      $('#results #total-tweets-data')
      .attr({"data-real":count, "data-round":count_rounded,"title":"Total tweets"})
      .text(count_rounded)

      if(compare)
        buildCompare("#results #total-tweets-data",count,compare.total_tweets,'total-tweets',tweetCount)
    }

    const load_followers = async () => {
      load_element("#results #followers",data.followers,compare?.followers,"Total Followers",tweetCount)
    }

    const load_followings = async () => {
      load_element('#results #followings',data.followings,compare?.followings,"Total Followings",tweetCount)
    }

    const load_mentions = async () =>{
      load_element('#results #mentions',data.mentions,compare?.mentions,"Recent Mentions",tweetCount)
    }

    const load_engagement = async () =>{
      let id = '#results #engagement'
      let eng = engagement(data)
      let eng_compare = engagement(compare)
      load_element(id,eng,eng_compare,"Engagement",(x)=>x)
    }

    const load_total_info = async () => {
      $("#results #total-interval").text(msToHMS(data.total.interval))
      if(compare)
        buildCompare('#results #total-interval',data.total.interval,compare.total.interval,'Avg. Interval',msToHMS)
      else
        buildCompare('#results #total-interval',data.total.interval,null,'Avg. Interval',msToHMS)
    }

    const load_limit_data = async () => {

      if(!$('#results #search-limit').hasClass('d-none'))
        $('#results #search-limit').addClass('d-none')

      if(data.limit){
        $('#results #search-limit p span#limit').text(data.limit.limit)
        $('#results #search-limit p span#remaining').text(data.limit.remaining)
        $('#results #search-limit p span#reset').text(msToHMS(data.limit.reset))
        $('#results #search-limit').removeClass('d-none')
      }
    }

    const load_sample_interval_dataset = async () =>{
      let id = "#results #search-sample-new"
      load_dateTime(id,data)
    }

    const load_sample_interval_comparing = async () => {
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
          buildCompare(id,data.highlights[type].count,compare.highlights[type].count,type,tweetCount)

          $(id+"-compare").attr({
            "href":buildTwitterPostUrl(compare.username,compare.highlights[type].id)
          })
        }
      }
    }

    const load_tweets_by_media_type_data = async () => {
      const fn = (x)=>x.count
      load_subTypes("#results #tweets-by-media-type-data",data.media_type,compare?.media_type,fn,fn)
    }

    const load_tweets_by_type_data = async () => {
      const fn = (x)=>x.count
      load_subTypes("#results #tweets-by-type-data",data.type,compare?.type,fn,fn)
    }

    const load_avg_type = async () => {
      for(let type of Object.keys(data.type)){
        if(type == 'retweeted') continue
        let id = 'avg-'+type
        if(data.type[type].count != 0){
          load_avg(id,data.type[type],compare?.type[type])
          $(id).show()
        }
        else
          $('#results #'+id).hide()
      }
    }

    const load_avg_media_type = async () => {
      for(let type of Object.keys(data.media_type)){
        let id = 'avg-'+type
        if(data.media_type[type].count != 0){
          load_avg(id,data.media_type[type],compare?.media_type[type])
          $(id).show()
        }
        else
          $('#results #'+id).hide()
      }
    }

    const load_hashtags = async () => {
      let id = "hashtags-chart-wrapper"
      if(compare) $('#results #hashtags-wrapper').hide()
      else $('#results #hashtags-wrapper').show()

      if(data.hashtags){
        let hashtags = Object.entries(data.hashtags).sort((a,b)=> b[1]-a[1]).slice(0,10)
        await top10Chart(hashtags,id,"Top 10 hashtags")
      }else{
        await top10Chart([],id,"Top 10 hashtags")
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
        await top10Chart([],id,"Top 10 mentiones")
      }
    }

    const load_lang_data = async (id,data,compare) =>{
      for(let lang of Object.keys(data)){
        build_ulElement(id,lang)

        if(compare && compare[lang])
          load_element('#results #'+id+'-'+lang,data[lang].count,compare[lang]?.count,lang,tweetCount)
        else
          load_element('#results #'+id+'-'+lang,data[lang].count,null,lang,tweetCount)
      }
    }

    const load_langs = async () => {
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

        await load_langs_chart(id,dataset,dataset_compare)
        await load_lang_data(id+'-data-ul',data_langs,data_langs_compare)
      }else{
        await load_langs_chart(id,dataset,null)
        await load_lang_data(id+'-data-ul',data_langs,null)
      }

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
        await pieCharts(dataset,dataset_compare,id,"Tweets by Media Type compare",colors_1,'doughnut')
      }
      else
        await pieCharts(dataset,null,id,"Tweets by Media Type",colors_1)
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
        await pieCharts(dataset,dataset_compare,id,"Tweets by Tweet Type compare",colors_2,'doughnut')
      }
      else
        await pieCharts(dataset,null,id,"Tweets by Tweet Type",colors_2)
    }

    const load_week_chart = async () => {
      let id = "week-chart-wrapper"

      if(compare){
        let labels = [...Array(7).keys()]
        let dataset = extractDailyTotal(data.tweets_per_day)
        let dataset_compare = extractDailyTotal(compare.tweets_per_day)
        await lineChart(dataset,labels,dataset_compare,id,"daily-tweets-compare","Daily tweets")
      }else{
        let labels = Object.keys(data.tweets_per_day)
        let datasets = extractMediaAndType(data.tweets_per_day,colors_1,colors_2)
        await dailyChartByType(datasets,labels,id,"Daily tweets by Media Type and Tweet Type")
      }
    }

    await load_user_datails()
    await load_followers()
    await load_followings()
    await load_limit_data()
    await load_mentions()
    await load_engagement()

    updateProgressBar(10)

    await load_sample_interval_dataset()
    await load_sample_interval_comparing()
    await load_highlights()

    updateProgressBar(20)

    await load_total_info()

    updateProgressBar(30)

    await load_week_chart()

    updateProgressBar(40)

    await load_media_type_Chart()

    updateProgressBar(50)

    await load_type_Chart()

    updateProgressBar(60)

    await load_langs()
    await load_hashtags()
    await load_mentioned_users()

    updateProgressBar(70)

    await load_tweets_by_media_type_data()
    await load_tweets_by_type_data()

    updateProgressBar(80)

    await load_avg_type()
    await load_avg_media_type()

    updateProgressBar(100)

    sleep(200)
  }

  // generate/append subtypes of MEDIA_TYPE or TYPE json objs
  function load_subTypes(id,data,compare,dn,cn){
    for(let type of Object.keys(data)){
      let sub_id = id+"-"+type

      if(compare)
        load_element(sub_id,dn(data[type]),cn(compare[type]),type,tweetCount)
      else
        load_element(sub_id,dn(data[type]),null,type,tweetCount)
    }
  }

  // generate language chart
  async function load_langs_chart(id,data,compare){
    if(compare){
      await pieCharts(data,compare,id,"Tweets by languages",colors_3)
    }else{
      await pieCharts(data,null,id,"Tweets by languages",colors_3)
    }
  }

  // append new element (<a>) to given list
  function build_ulElement(id,type){
    let sub_id = id+'-'+type

    let span = $('<span class="text-primary data-hover"></span>')

    span.attr({"id":sub_id})

    let span_compare = $('<span id="'+sub_id+'-compare" class="text-primary data-hover"></span>')

    let a = $('<a class="list-group-item list-group-item-action">'+toUpperFirstChar(type)+': </a>')
    .append(span).append(span_compare)

    $('#'+id).append(a)
  }

  // insert apply round function to data and compare and insert it to given id
  // requires: round function : (a) => b
  function load_element(id,data,compare,title,round){
    let rounded = round(data)

    $(id)
    .attr({"data-real":Number(data), "data-round":rounded,"title":title})
    .text(rounded)

    if(compare)
      buildCompare(id,data,compare,title,round)
  }

  // builds Average area of MEDIA_TYPE or TYPE
  function load_avg(id,data,compare){
    id = '#results #'+id
    let count_id = id+'-count'
    let interval_id = id+'-interval'
    let ul_id = id+'-data'

    $(count_id).text(data.count)
    $(interval_id).text(msToHMS(data.interval))

    if(compare){
      buildCompare(count_id,data.count,compare.count,'count',tweetCount)
      buildCompare(interval_id,data.interval,compare.interval,'interval',msToHMS,'interval')
    }
    const dn = (x) => Number(x/data.count).toFixed(2)
    const cn = (x) => Number(x/compare?.count).toFixed(2)

    if(compare){
      load_subTypes(ul_id,data.metrics,compare?.metrics,dn,cn)
    }else{
      load_subTypes(ul_id,data.metrics,compare?.metrics,dn,null)
    }

  }

  // if compare value is present appends an icon and the difference between comparing value,
  // the value is rounded by the given round function
  // if type is NOT equal to 'interval' it will set data-round and data-real
  // requires: round function : (a) => b
  function buildCompare(id,data,compare,title,round,type = undefined){
    if(!compare) return
    if(data == compare) return

    let diff = Number((data - compare).toFixed(3))

    // if(type === 'interval')
    //   console.log(diff);

    let rounded = round(diff)


    appendDiffIcon(id,diff)

    id += '-compare'

    if(!type)
      $(id).attr({"data-real":diff,"data-round":rounded,"title":"Difference of "+title})
    else if(type === 'interval')
      $(id).attr({"title":"Difference of "+title})

    $(id).append(rounded)
  }

  // append comparing icon: if diff is negative red arrow pointing downwards otherwise green upwards
  function appendDiffIcon(id,diff){
    if(diff == 0) return

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
  }

  // calcuate the engament of tweet account within the given data
  // Formula: (Likes + Retweets + Quotes + Replies) divided by the number of tweets,
  // then by the total number of followers, then multiplied by 100.
  function engagement(input){
    if(!input) return undefined

    let result = 0
    let metrics = input.total.metrics

    for(let type of Object.keys(metrics)){
      if(type == 'impression_count') continue
      result += metrics[type]
    }

    result /= input.total.count
    result /= input.followers
    result *= 100

    return result.toFixed(2)

  }

  // appends date-time of search record
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

  // extracts and returns languages and counts from given json obj
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

  // extract  and returns counts of given json obj
  function extractCounts(data){
    let dataset = []
    Object.keys(data).forEach( key => {
      dataset.push((data[key].count))
    })

    return dataset
  }

  // draw pie charts
  async function pieCharts(data_1,data_2,id,title,colors,chartType = 'pie'){

    let canvas = document.createElement("canvas")
    canvas.id = id+"-chart"
    document.getElementById(id).appendChild(canvas)

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
          title:{
            display:true,
            text:title
          },
          legend:{
            display:true,
            position:"right",
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

  // builds dataset element required by chartsjs dataset obj
  function toDataset(data,label,color,stack){
    let struct = {}
    struct["data"] = data
    struct["label"] = label
    struct["backgroundColor"] = color
    struct['stack'] = stack

    return struct
  }

  // extracts media and type and their respective counts
  // output is an array of dataset obj of chartsjs
  function extractMediaAndType(data,colors_1,colors_2){
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
      output.push(toDataset(media[m],m,colors_1[count++],0))
    }

    count = 0

    for(let t of Object.keys(type)){
      output.push(toDataset(type[t],t,colors_2[count++],1))
    }

    return output
  }

  // returns total of tweets per day
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

  // generates daily chart
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
        legend:{
          display:true,
          position:"bottom",
          labels: {

            usePointStyle:true,
            pointStyle:'rectRounded',
            padding:20
          }
        },
         datalabels:{display:false},
      },
      scales: {
        x: {
          title:{text:'Day',display:true,position:'center'},
          stacked:true
        },
        y: {
          title:{text:'#tweets',display:true,position:'center'},
          stacked:true
        },
      }
    },

  })

  }

  // gengerates top 10 mentions/hashtags charts
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

  // generates daily line chart
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

  // returns the plural of given string *_count
  // required string formatted like: something_count
  // supported words are: retweet_count, reply_count, impression_count, like_count, quote_count
  function countToPlural(key){
    if(key == 'reply_count')
      return  "Replies"
    else
      return key.charAt(0).toUpperCase()+key.slice(1,-6)+"s"
  }

  // set hover to elements which have the class name data-hover
  // requires: element must have data-real and data-round attibutes
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

  // return string with letter converted to uppercase
  function toUpperFirstChar(str){
    return str.charAt(0).toUpperCase()+str.slice(1)
  }

  // returns the string obtained by converting the given number in days, hours, minuts, seconds
  // example: 10D 3H 23m 45s
  // example: 3H 23m 45s if H == 0
  // example: 23m 45s if D and H == 0
  // example: 45s if D and H and m == 0
  function msToHMS(e){
    e = Math.abs(e)
    let s = e/1000;
    let m = s/60;
    s = s%60;
    let h = m/60;
    m = m%60;
    let d = h/24;
    h = h%24;

    if(d<1 && h<1 && m<1 && s<1) return "0s"
    if(d<1 && h<1 && m<1) return Math.floor(s)+"s"
    if(d<1 && h<1) return Math.floor(m)+"m "+Math.floor(s)+"s"
    if(d<1) return Math.floor(h)+"H "+Math.floor(m)+"m "+Math.floor(s)+"s"

    return Math.floor(d) +"D "+ Math.floor(h)+"H "+Math.floor(m)+"m "+Math.floor(s)+"s"
  }

  // round the given number if >=million with 2 decimals
  // if < million and >= 1000 with 3 decimals
  // example: 140_683 -> 140.68K
  // example: 140_600_456 -> 140.6M
  function tweetCount(count){
    if (count / 1000000 >= 1 || count / 1000000 <= -1)
      return Number((count / 1000000).toFixed(2)) + "M"

    if(count / 1000 >= 1 || count / 1000 <= -1)
      return Number((count / 1000).toFixed(1)) + "K"

    return Number(count)
  }

  // appends the given string to "https://twitter.com/"
  // twitter account link
  function buildTwitterUrl(user){
    return "https://twitter.com/"+user
  }

  // appends the given string to "https://twitter.com/status/"
  // twitter post link
  function buildTwitterPostUrl(user,id){
    return buildTwitterUrl(user)+"/status/"+id
  }

  // calling functions
  errorParamDisplay()
  set_data_hover()
})