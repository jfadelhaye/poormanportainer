import { 
  fetchContainers,
  updateTableWithContainersList
} from './modules/functions.js';

document.querySelector("#refreshButton").addEventListener('click', (e) => {
  fetchContainers().then((containers) => {
    updateTableWithContainersList(containers);
  });
});

fetchContainers().then((containers) => {
  updateTableWithContainersList(containers);
});

