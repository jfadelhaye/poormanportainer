/**
 * API communication
 */

function fetchContainers() {
  return fetchData('containers');
}

/** TODO : refactor dat  */
function fetchContainer(id) {
  return fetchData(`container/${id}`);
}

function startContainer(id) {
  let actions = document.querySelector('#containerTableHead tr td:last-child');
  actions.innerHTML = 'Starting... ⏳';
  return fetchData(`container/${id}/start`);
}

function stopContainer(id) {
  let actions = document.querySelector('#containerTableHead tr td:last-child');
  actions.innerHTML = 'Stopping ... ⏳';
  return fetchData(`container/${id}/stop`);
}

async function fetchData(route){
  try {
    let response = await fetch(`http://127.0.0.1:3001/${route}`, {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  let data = await response.json();
  return data;
  } catch (error) {
  console.error('Error fetching data:', error);
  }
}

/**
 * DOM Manipulation 
 */
function cleanTable(tbodyref) {
  tbodyref.innerHTML='';
}



function updateContainerDetails(container) {
  document.querySelector('#header').textContent = `Container ${container.name}`;
  let theadref = document.getElementById('containerTableHead');
  theadref.innerHTML = '';
  let row = theadref.insertRow();
  let cell1 = row.insertCell(0);
  let cell2 = row.insertCell(1);
  cell1.innerHTML = 'Key';
  cell2.innerHTML = 'Value';

  let tbodyref = document.getElementById('containerTableBody');
  cleanTable(tbodyref);
  console.log(container);
  for (let key in container) {
    // handle arrays and objects in struct 
    let value ='';
    if ( typeof container[key] === 'array') {
      if (container[key].length === 0) {
        value = 'No data';
      } else {
        value = container[key].join("<br/>");
      }
    }
    else if (typeof container[key] === 'object') {
      for (let k in container[key]) {
        if (typeof container[key][k] === 'object') {
          value += `${k}: ${JSON.stringify(container[key][k])} <br />`;
        }
        value += `${k}: ${container[key][k]} <br />`;
      }
    } else {
      value = container[key];
    }
    let row = tbodyref.insertRow();
    let cellkey = row.insertCell(0);
    let cellValue = row.insertCell(1);
    cellkey.innerHTML = `${key}`;
    cellValue.innerHTML = `${value}`;
  };
}

function updateTableWithContainersList(elements) {
  document.querySelector('#header').textContent = `Dashboard`;

  let theadref = document.getElementById('containerTableHead');
  theadref.innerHTML = '';
  let row = theadref.insertRow();
  let cell1 = row.insertCell(0);
  let cell2 = row.insertCell(1);
  let cell3 = row.insertCell(2);
  let cell4 = row.insertCell(3);
  let cell5 = row.insertCell(4);
  let cell6 = row.insertCell(5);
  cell1.innerHTML = 'ID';
  cell2.innerHTML = 'Name';
  cell3.innerHTML = 'Image';
  cell4.innerHTML = 'State';
  cell5.innerHTML = 'Status';
  cell6.innerHTML = 'Actions (To be implemented)';

  let tbodyref = document.getElementById('containerTableBody');
  cleanTable(tbodyref);
  elements.forEach((container) => {
    let row = tbodyref.insertRow();
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    let cell4 = row.insertCell(3);
    let cell5 = row.insertCell(4);
    let cell6 = row.insertCell(5);
    cell1.innerHTML = `<a href="#" class="container-id">${container.id}</a>`;
    let containerIdLink = cell1.querySelector('.container-id');
    containerIdLink.addEventListener('click', (e) => {
      fetchContainer(container.id).then((container) => {
      updateContainerDetails(container);
      });
    });
    cell2.innerHTML = container.name;
    cell3.innerHTML = container.image;
    cell4.innerHTML = container.state;
    cell5.innerHTML = container.status;
    let buttonStart = document.createElement('button');
    if (container.state === 'running') {
      buttonStart.disabled = true;
    }
    buttonStart.textContent = 'Start';
    buttonStart.addEventListener('click', (e) => {
      console.log(`Starting container ${container.id}`);
      startContainer(container.id).then((container) => {
        console.log(`started ${container} ...`);
        window.location.reload();
      });
    });
    let buttonStop = document.createElement('button');
    if (container.state === 'exited') {
      buttonStop.disabled = true;
    }
    buttonStop.textContent = 'Stop';
    buttonStop.addEventListener('click', (e) => {
      console.log(`Stopping container ${container.id}`);
      stopContainer(container.id).then((container) => {
        console.log(`stopped ${container} ...`);
        window.location.reload();
      });
    });

    let buttonLogs = document.createElement('button');
    buttonLogs.textContent = 'Logs';
    buttonLogs.addEventListener('click', (e) => {
      console.log(`Showing logs for container ${container.id}`);
    });

    let buttonDelete = document.createElement('button');
    buttonDelete.textContent = 'Delete';
    buttonDelete.addEventListener('click', (e) => {
      if (confirm('Are you sure you want to delete this container?')) {
        // Code to delete the container
        console.log(`Deleting container ${container.id}`);
      } else {
        console.log('Deletion cancelled');
      }
    });
    cell6.appendChild(buttonStart);
    cell6.appendChild(buttonStop);
    cell6.appendChild(buttonLogs);
    cell6.appendChild(buttonDelete);
  });
}


export { 
  fetchContainers, 
  fetchContainer, 
  cleanTable, 
  updateContainerDetails, 
  updateTableWithContainersList };  