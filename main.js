const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path'); 

let db = require('./src/config/database')

let win;
let myS = null;
function createWindow () {
   win = new BrowserWindow({

    width: 800,
    height: 600,
    webPreferences: {

     // nodeIntegration: true,
     // contextIsolation:true,
     // devTools:false,
     preload:path.join(app.getAppPath(), './src/index.js')
      
    }
  })


  const { screen } = require('electron')
  console.log(screen)
  myS = screen
  win.loadFile('./src/index.html')
}


app.whenReady().then(createWindow)



app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
})



ipcMain.handle('getDataTablaDos', () => {
  const { screen } = require('electron')
  console.log(screen)
  const primaryDisplay = screen?.getPrimaryDisplay()
   console.log(primaryDisplay)
});



ipcMain.handle('get', () => {
  const { screen } = require('electron')
  console.log(screen)
  const displays = screen?.getAllDisplays();
   console.log(displays)

   const resultMap = displays.map((item, index) => ({
    index:index, //indice del array se refiere a la posición del item
    id: item.id, //id de la ventana
    width: item.bounds.width,
    height: item.bounds.height
   }))

   return resultMap
});

ipcMain.handle('add', (event, obj) => {
  //addProduct(obj)


  //abres otra ventana modal y al cargar se ejecuta getDataTablaDos
  const child = new BrowserWindow({  parent: win, titleBarStyle: 'hidden', movable:false,
  webPreferences: {
    preload:path.join(app.getAppPath(), './src/views/home.js')
   }
})
  child.loadFile('./src/views/home.html')
  child.show();
 
});


ipcMain.handle('get_one', (event, obj) => {
  getproduct(obj)    
});

ipcMain.handle('remove_product', (event, obj) => {
  deleteproduct(obj)
});


ipcMain.handle('update', (event, obj) => {
  updateproduct(obj)    
});



function getProducts()
{
  
  db.query('SELECT * FROM products', (error, results, fields) => {
    if (error){
      console.log(error);
    }
    
    win.webContents.send('products', results)
  });  
}


function addProduct(obj)
{
  const sql = "INSERT INTO products SET ?";  
  db.query(sql, obj, (error, results, fields) => {
    if(error) {
       console.log(error);
    }
    getProducts()  
 });
}

function deleteproduct(obj)
{
  const { id }  = obj
  const sql = "DELETE FROM products WHERE id = ?"
  db.query(sql, id, (error, results, fields) => {
    if(error) {
       console.log(error);
    }
    getProducts()  
  });
}

function getproduct(obj)
{
  let { id } = obj 
  let sql = "SELECT * FROM products WHERE id = ?"
  db.query(sql, id, (error, results, fields) => {
    if (error){
      console.log(error);
    }
    console.log(results)
    win.webContents.send('product', results[0])
  });
}


function updateproduct(obj) 
{
   let { id, name, price } = obj
   const sql = "UPDATE products SET name=?, price=? WHERE id=?";  
   db.query(sql, [name, price, id], (error, results, fields) => {
     if(error) {
        console.log(error);
     }
     getProducts()  
   });
}


