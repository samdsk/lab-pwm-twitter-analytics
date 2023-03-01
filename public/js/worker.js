
// self.onmessage = (data) => {
//     console.log("Worker received msg")
//     var xhr = new XMLHttpRequest
//     xhr.open('POST','/twitter',data)
//     xhr.responseType = 'json'
//     xhr.send()

//     xhr.onreadystatechange = function (){
//         let res;
//         if(xhr.readyState == 4 && xhr.status == 200)
//             res = xhr.responseText
//         else res = xhr.status

//         console.log(JSON.parse(res))
//         postMessage(res)
//     }
// }

self.onmessage = (data) => {
    postMessage("ciao")
}

// self.addEventListener("message", function(event){
//     postMessage(event)
// })