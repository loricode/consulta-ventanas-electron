const { ipcRenderer } = require('electron')

window.onload = function() { 
   renderGetProducts(); 
};


async function renderGetProducts() {
   await ipcRenderer.invoke('getDataTablaDos')   
}