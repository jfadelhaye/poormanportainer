const express = require('express');
const app = express();
const cors = require('cors')
const http= require('http');

app.use(express.json());
//cors handling
app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const PORT = process.env.PORT || 3001;

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
        let container = {
          'id': parsedData[i].Id.substring(0, 8),
          'name': parsedData[i].Names[0].substring(1),
          'image': parsedData[i].Image,
          'state': parsedData[i].State,
          'status': parsedData[i].Status
        }
        console.log('sending container list ...');
        result.push(container);
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

function dockerRequestSingleContainer(options) {
  return new Promise((resolve, reject) => {
    let req = http.request(options, (res) => {
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        const parsedData = JSON.parse(rawData);
        let container = {
          'id': parsedData.Id.substring(0, 8),
          'name': parsedData.Name.substring(1),
          'image': parsedData.Image,
          'state': parsedData.State,
          'status': parsedData.Status,
          'created': parsedData.Created,
          'command': parsedData.Command,
          'ports': parsedData.Ports,
          'labels': parsedData.Labels,
          'network': parsedData.NetworkSettings,
          'mounts': parsedData.Mounts,
          'volumes': parsedData.Volumes,
          'environment': parsedData.Config.Env,
          'exposedPorts': parsedData.Config.ExposedPorts,
          'entrypoint': parsedData.Config.Entrypoint,
          'workingDir': parsedData.Config.WorkingDir,
          'user': parsedData.Config.User,
          'hostConfig': parsedData.HostConfig,
          'networkSettings': parsedData.NetworkSettings

        }
        resolve(container);
      });
    });
    req.on('error', (e) => {
      reject(e);
    });
    req.end();
  });
}

function dockercontainerStartStop(options) {
  return new Promise((resolve, reject) => {
    console.log(` Starting ...`);

    let req = http.request(options, (res) => {
      res.setEncoding('utf8');
      let status = res.statusCode;
      resolve(status);
    });
    req.on('error', (e) => {
      console.log(e);
      reject(e);
    });
    req.end();
  });
}

function dockercontainerLogs(options) {
  return new Promise((resolve, reject) => {
    let req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        resolve(rawData);
      });
    }
    );
    req.on('error', (e) => {
      reject(e);
    });
    req.end();
  });
}
app.get('/container/:containerId/logs', (req, res) => {
  let id = req.params.containerId;
  let path = '/v1.45/containers/' + id + '/logs?stdout=1&stderr=1';
  let options = {
    socketPath: '/var/run/docker.sock',
    path: path,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }
  let dockerResponse = dockercontainerLogs(options);
  dockerResponse.then((result) => {
    console.log(result);
    res.json(result);
  }).catch((err) => {
    res.status
  });
});

app.get('/container/:containerId', (req, res) => {
  let id = req.params.containerId;
  let path = '/v1.45/containers/' + id + '/json';
  let options = {
    socketPath: '/var/run/docker.sock',
    path: path,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }
  let dockerResponse = dockerRequestSingleContainer(options);
  dockerResponse.then((result) => {
    res.json(result);
  }).catch((err) => {
    res.status
  });
});

/**  
 * there is definitly some refactor to do  here 
 */
app.get('/container/:containerId/start', (req, res) => {
  let id = req.params.containerId;
  let path = '/v1.45/containers/' + id + '/start';
  let options = {
    socketPath: '/var/run/docker.sock',
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }
  console.log(` starting container ${id}`);

  let dockerResponse = dockercontainerStartStop(options);
  dockerResponse.then((result) => {
    if (result.status == 304 ){
      result.status(304).send('Container is already running');
    } else if ( result.status == 404){
      result.status(404).send('Container not found');
    } else {
      result.status(204).send('Container started');
    }
  }).catch((err) => {
    res.status
  });
});

app.get('/container/:containerId/stop', (req, res) => {
  let id = req.params.containerId;
  let path = '/v1.45/containers/' + id + '/stop';
  let options = {
    socketPath: '/var/run/docker.sock',
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }
  console.log(` starting container ${id}`);

  let dockerResponse = dockercontainerStartStop(options);
  dockerResponse.then((result) => {
    res.json(result);
  }).catch((err) => {
    res.status
  });
});

app.get('/containers', (req, res) => {
  const options = {
    socketPath: '/var/run/docker.sock',
    path: '/v1.45/containers/json?all=true',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }
  const dockerResponse = dockerRequestContainers(options);
  dockerResponse.then((result) => {
    res.json(result);
  }).catch((err) => {
    res.status
  });
});

const srv = app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});

module.exports = srv;