//version
const version = "V0.1.0";

var getMessages = [];

//dev messages
function debug(e, message){
  if(!e.debugMessage){
    return;
  }
  getMessages.push('<i>'+message+'</i>');
}

//send message functions.
function sendMessage(payload){
  var data = {
    "method": "post",
    "payload": payload
  };
  UrlFetchApp.fetch("https://api.telegram.org/bot<token>/", data);
}

function sendText(e, message){
  //message = message.toString();
  if(e.debugMessage){
    getMessages.push(message);
    return;
  }
  sendMessage({
    "method": "sendMessage",
    "chat_id": e.message.chat.id.toString(),
    "text": message
  });
}

// send a image with a url
// or a telegram fileid if you want :)
function sendImage(e, url){
  if(e.debugMessage){
    getMessages.push('image: ' + url);
    return;
  }
  sendMessage({
    "method": "sendPhoto",
    "chat_id": e.message.chat.id.toString(),
    "photo": url
  });
}

function fetchData(url){
  //this is a function that fetch the data of url, and return a json.
  var ans = JSON.parse(UrlFetchApp.fetch(url).getContentText());
  return ans;
}

//same function as fetchData, but it will fetch with cookie.
//maybe we can remove one of them. Welcome PR!

function fetchDataCookie(url,cookie){
  var ans = JSON.parse(UrlFetchApp.fetch(url,{
    "headers": {
      "Cookie": cookie
    }
  }).getContentText());
  return ans;
}

//caches
var cache = CacheService.getScriptCache();

function getCache(id){
  return cache.get(id);
}

function putCache(id,content){
  cache.put(id,content);
}

function removeCache(id){
  cache.remove(id);
}

//modes

function setMode(e,mode){
  let id = e.message.chat.id + 'mode';
  putCache(id,mode);
}

function cancelMode(e){
  let id = e.message.chat.id + 'mode';
  removeCache(id);
}

function getMode(e){
  let id = e.message.chat.id + 'mode';
  return getCache(id);
}

//request handler.
function doPost(e) { // this is for telegram webhook.
  var string = JSON.parse(e.postData.contents);
  run(string);
}
function doGet(e) {
  if(!e.queryString){
    return HtmlService.createHtmlOutput(version);
  }
  var string = {debugMessage: true, message: {text: e.queryString, chat: {id: 'debugger'}}};
  run(string);
  return HtmlService.createHtmlOutput(getMessages.join('<hr>').replaceAll('\n','<br>'));
}

// put your commands here
const commands = {
  '/help': 'Send help'
}

//main function. You have to work a lot with it

function run(e){
  if(e.message.text){
    if(e.message.text == '/cancel'){
      // right now cancel the mode
      cancelMode(e);
      sendText(e, 'Cancled');
      return;
    }else if(getMode(e)){
      let mode = getMode(e);
      if(mode == 'somemode'){
          // do something
      }
      return;
    }
    
    if(e.message.text == '/start'){
      // introduction of your bot
      sendText(e, 'Hello, this is my bot.');
      sendText(e, 'You can found the code on GitHub: https://github.com/oimasterakioi/telegrambot');
        //p.s. Remember to put this template repo's url in your repo's README!
      cancelMode(e);
    }
    
    else if(e.message.text == '/help'){
      // going to send a list of commands
      let res = 'Commands:\n';
      for(let command in commands)
        res += command + ' - ' + commands[command] + '\n';
      sendText(e, res);
    }
    
    else if(e.message.text == 'something'){
        // do something
        sendMessage(e, 'doing something');
    }

    else if(e.message.text == '/somemode'){
      sendText(e,'Mode ...');
      setMode(e,'somemode');
    }
     
    else{
      // command not found. return the error message.
      sendText(e, 'Command not found. Use /help to get a list of commands.');
    }
  }
}