
// worker for sending ajax requests
self.onmessage = (event) => {
    // console.log("Worker received msg",event.data)
    let method = event.data.method
    let url = event.data.url
    let data = event.data.data
    var xhr = new XMLHttpRequest

    xhr.open(method,url)
    xhr.responseType = 'json'
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(data)

    xhr.onreadystatechange = function (){
        if(xhr.readyState == 4 && xhr.status == 200){
            postMessage(xhr.response)
        }else if(xhr.readyState == 4){
            postMessage({'error':xhr.status})
        }
    }
}
