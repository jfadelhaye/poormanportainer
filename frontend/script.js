async function fetchData() {
  try {
    let response = await fetch('http://127.0.0.1:3000/containers', {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
    let data = await response.json();

    let tbodyref = document.getElementById('containerTable');
    data.forEach((container) => {
      let row = tbodyref.insertRow();
      let cell1 = row.insertCell(0);
      let cell2 = row.insertCell(1);
      let cell3 = row.insertCell(2);
      let cell4 = row.insertCell(3);
      let cell5 = row.insertCell(4);
      cell1.innerHTML = container.id;
      cell2.innerHTML = container.name;
      cell3.innerHTML = container.image;
      cell4.innerHTML = container.state;
      cell5.innerHTML = container.status;
    });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

fetchData();
