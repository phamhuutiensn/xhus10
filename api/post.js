const express = require("express");
const router = express.Router();

/**
 * OKIE PRO
 * GET product list.
 *
 * @return product list | empty.
 */
var rootURL = "https://gocthongtin.com/";

var adapterForwtf111 = (function() {
  var url = require('url'),
  adapters = {
    'http:': require('http'),
    'https:': require('https'),
  };
  return function(inputUrl) {
    return adapters[url.parse(inputUrl).protocol]
  }
}());


/*
id 
title
content
description
thumbnail
*/



 function getData(postID){
  return new Promise(function(resolve, reject){
    var url = rootURL + '?pcs=1&p=' + postID;
    adapterForwtf111(url).get(url, function(res){
        var body = '';
        res.on('data', function(chunk){
            body += chunk;
        });

        res.on('end', function(){
            resolve(body);
        });
    }).on('error', function(e){
      reject(e);
    });

  })
 }
router.get("/:postID", async (req, res) => {
  res.removeHeader("X-Powered-By");
  res.clearCookie();
  var postID = req.params.postID;
  var slug = postID
  var utm = req.query.utm;
  var utm_source = req.query.utm_source;
  var utm_campaign = req.query.utm_campaign;
  var utm_medium = req.query.utm_medium;
  var utm_term = req.query.utm_term;
    var utm_content = req.query.utm_content;

  // https://animalloversblog.netlify.app/.netlify/functions/server/post/19920/?utm_source=NamePartner&utm_campaign=NameAuthor&utm_medium=NameNetlify

  var showPost = false;
  if (typeof postID == "undefined"){
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write("Chưa có ID post");
    res.end();
  }
  if (!req.get('User-Agent').includes("facebookexternalhit")){ // không phải robot Facebook
    if (typeof req.header('Referer') != "undefined"){
      if (req.header('Referer').includes("facebook")){ // đường dẫn từ Facebook 
        
        if (typeof slug == "undefined"){
          res.write("<script>window.location.href='" +  rootURL + "/" + postID + "'</script>")
          // res.writeHead(302, {location: rootURL + "?p=" + postID});
        }else if (typeof utm_source == "undefined"){
          res.write("<script>window.location.href='" +  rootURL + "/" + slug + "?utm_source=" + utm + "&utm_medium=" + utm + "&utm_campaign=" + utm + "&utm_term=" + utm + "'</script>")
          // res.writeHead(302, {location: rootURL + "/" + slug + "?utm_source=" + utm + "&utm_medium=" + utm + "&utm_campaign=" + utm + "" + "&utm_content=" + utm + "&utm_term=" + utm + ""});
        }else{
          res.write("<script>window.location.href='" +  rootURL + "/" + slug + "?utm_source=" + utm_source + "&utm_medium=" + utm_medium + "&utm_campaign=" + utm_campaign + "&utm_content=" + utm_content + "&utm_term=" + utm_term + "'</script>")
          // res.writeHead(302, {location: rootURL + "/" + slug + "?utm_source=" + utm_source + "&utm_medium=" + utm_medium + "&utm_campaign=" + utm_campaign + "" + "&utm_content=" + utm_content + "&utm_term=" + utm_term + ""});
        }
        
        res.end();
      }
    }else{
      showPost = true;
    }
  }else{
    showPost = true;
  }
  if (showPost){
    getData(postID).then(function(data){
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      // res.write("Referer: " + req.header('Referer') + "\n User Agent: " + req.get('User-Agent'));
      var title = JSON.parse(data)['title'];
      var content = JSON.parse(data)['content'];
      var thumbnail = JSON.parse(data)['thumbnail'];
      var description = JSON.parse(data)['description'];
      var htmlCode = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>` + title +`</title>
        <meta property="og:locale" content="en_US">
        <meta property="og:type" content="article">
        <meta property="og:title" content="` + title +`">
        <meta property="og:description" content="` + description +`">
        <meta property="og:site_name" content="We Love Animals">
        <meta property="article:section" content="Animal">
        <meta property="og:image" content="` + thumbnail + `">
        <meta property="og:image:alt" content="` + title + `">
       
       <style>
          img { width: 100%; height: auto; }
          ul { list-style-type: none; margin: 0; padding: 0; overflow: hidden; background-color: #333; }
          li {float: left; }
          li a { display: block; color: white; text-align: center; padding: 14px 16px; text-decoration: none; }
          li a:hover:not(.active) { background-color: #111; }
          .active { background-color: #4CAF50; }
       </style>
      </head>
      <body style="background:#eee;"><div style="padding:20px;margin:30px auto;padding:20px;max-width:800px;background:white;box-shadow: 5px 5px 5px #888888;">
      <div>
        <ul>
          <li><a href="#home">Home</a></li>
          <li><a href="#news">News</a></li>
          <li><a href="#contact">Contact</a></li>
          <li style="float:right"><a class="active" href="#about">About</a></li>
        </ul>
      </div>
        <h1>` + title + `</h1>
        <img style="width:100%;height:auto;" src="`  + thumbnail + `">` + content + `</div>
      </body>
      </html>`
      res.write(htmlCode);
      res.end();
    })
  }
});


module.exports = router;
