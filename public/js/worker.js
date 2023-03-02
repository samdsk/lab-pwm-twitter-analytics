self.onmessage = (event) => {
    console.log("Worker received msg",event.data)
    var xhr = new XMLHttpRequest
    xhr.open('POST','/twitter')
    xhr.responseType = 'json'
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(event.data)

    xhr.onreadystatechange = function (){        
        if(xhr.readyState == 4 && xhr.status == 200){
            postMessage(JSON.parse(xhr.response))
        }
    }
}
