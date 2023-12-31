import axios from "axios";
const {REACT_APP_API_URL,REACT_APP_WHISPER_API_KEY} = process.env;

export const handleUpload = (newfiles,apiKey) => {
    let formData = new FormData();
    formData.append("file", newfiles);
    formData.append("model", "whisper-1");
    return new Promise((resolve,reject)=> {
        axios({
            url:`https://api.openai.com/v1/audio/transcriptions`,
            method:'POST',
            headers:{
                Authorization: `Bearer ${apiKey}`
            },
            data: formData
        }).then((res)=> {
           resolve(res)
        }).catch((err)=> {
           reject(err)
        })
    })
   }

 
export const retrivePromptMessage = (id) => {
   return new Promise((resolve,reject)=> {
     axios({
        url:`${REACT_APP_API_URL}/getPromptMessage/${id}`,
        method:'GET'
     }).then((res)=>{
        console.log('reee',res)
        resolve(res.data)
     }).catch((err)=>{
        console.log('err',err)
        reject(err)
     })
   })
}

export const checkTheStatus = (prompt,apiKey) => {
 return new Promise((resolve,reject)=> {
    axios({
        url:`https://api.openai.com/v1/chat/completions`,
        method:'POST',
        headers:{
            Authorization: `Bearer ${apiKey}`
        },
       data:{
        model: "gpt-3.5-turbo-0613",
        messages: [
        {role: "user", content: prompt}
        ],
        functions: [
            {
              name: "show_code_editor",
              description: "User need to use code editor to provide there example",
              parameters: {
                type: "object",
                properties: {
                  show: {
                    type: "boolean",
                    description: "get the status"
                  }
                }
              }
            }
          ]
       }
    }).then((res)=>{
       resolve(res)
    }).catch((err)=>{
       reject(err)
    })
 })
}


export const handleUploadAnswers = (messages,promptInfo,id,apiKey) => {
      console.log('messages',messages);
    return new Promise((resolve,reject)=> {
        axios({
            url:`https://api.openai.com/v1/chat/completions`,
            method:'POST',
            headers:{
                Authorization: `Bearer ${apiKey}`
            },
            data: {
                model: "gpt-3.5-turbo-16k",
                messages:[
                    {role: "system", content: promptInfo},
                     ...messages
                ]
            }
        }).then((res)=> {
            console.log('response',res);
            resolve(res)
        }).catch((err)=>{
            reject(err)
        })
    })
}

export const updateEmailId = (userId,email) => {
    console.log("Id",userId);
    return new Promise((resolve,reject)=> {
        axios({
            url:`${REACT_APP_API_URL}/updateEmail/${userId}`,
            method:'PUT',
            data: {
               email
            }
        }).then((res)=> {
            resolve(res.data)
        }).catch((err)=>{
            reject(err)
        })
    })
}

