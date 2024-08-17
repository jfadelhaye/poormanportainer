const express = require('express');
const app = express();
const cors = require('cors')
app.use(express.json());
app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const http= require('http');


const PORT = process.env.PORT || 3000;


function dockerRequestContainers(options) {
  let result = [];
  return new Promise((resolve, reject) => {
    let req = http.request(options, (res) => {
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
      const parsedData = JSON.parse(rawData);
      for ( var i = 0; i < parsedData.length; i++) {
      console.log('parsing container' + i + ' ...');
        let container = {
          'id': parsedData[i].Id.substring(0, 8),
          'name': parsedData[i].Names[0].substring(1),
          'image': parsedData[i].Image,
          'state': parsedData[i].State,
          'status': parsedData[i].Status
        }
        result.push(container);
        console.log(result);

      }
      resolve(result);
    })
  });
  req.on('error', (e) => {
    reject(e);
  });
  req.end();
});
}

app.get('/containers', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let options = {
    socketPath: '/var/run/docker.sock',
    path: '/v1.45/containers/json?all=true',
    method: 'GET',
    query: {
      all: true
    },
    headers: {
      'Content-Type': 'application/json'
    }
  }
  let dockerResponse = dockerRequestContainers(options);
  dockerResponse.then((result) => {
    res.json(result);
  }).catch((err) => {
    res.status
  });
});

app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});
